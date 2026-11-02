import { useEffect, useMemo, useRef } from 'react';
import { Animated, type GestureResponderEvent, Platform, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path, Polygon } from 'react-native-svg';

import { play } from '../feedback';
import { firstName } from '../online/demo';
import type { User } from '../online/rules';
import { colors, nativeDriver } from '../theme';
import { Avatar, Title } from './kit';

type Props = {
  users: User[];
  counts: Record<string, number>;
  selected: number;
  onSelect: (index: number) => void;
};

// "Pass it to...": the players sit in a loop with the chosen one in the
// middle, under a yellow pointer. Drag them left or right with a finger and
// they follow it, then settle on the nearest player. Arrows and a tap on a
// neighbour work too.
export function PlayerPicker({ users, counts, selected, onSelect }: Props) {
  const n = users.length;
  const wrap = (i: number) => ((i % n) + n) % n;

  // Where the carousel is, counted in players. It never wraps, so it can
  // glide past the end of the list straight back to the first player.
  const pos = useRef(new Animated.Value(selected)).current;
  const now = useRef(selected);
  const drag = useRef<{ x: number; y: number; from: number; t: number; lastX: number; v: number; sideways?: boolean } | null>(null);

  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  // Tells the screen as soon as another player reaches the middle.
  const choose = (position: number) => {
    const nearest = wrap(Math.round(position));
    if (nearest === selectedRef.current) return;
    selectedRef.current = nearest;
    play('tap');
    onSelect(nearest);
  };
  const track = (value: number) => {
    now.current = value;
    pos.setValue(value);
    choose(value);
  };
  const settle = (target: number) => {
    Animated.spring(pos, { toValue: target, useNativeDriver: nativeDriver, speed: 16, bounciness: 6 }).start();
    now.current = target;
    choose(target);
  };
  const step = (dir: number) => settle(Math.round(now.current) + dir);

  // Picked from outside (or a new game): glide to that player the short way round.
  useEffect(() => {
    const here = Math.round(now.current);
    if (wrap(here) !== selected) settle(here + shortWay(selected - wrap(here), n));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, n]);

  const point = (e: GestureResponderEvent) => {
    const t = e.nativeEvent as unknown as { pageX?: number; pageY?: number; changedTouches?: ArrayLike<{ pageX: number; pageY: number }> };
    const c = t.changedTouches?.[0];
    return { x: c?.pageX ?? t.pageX ?? 0, y: c?.pageY ?? t.pageY ?? 0 };
  };
  const touch = {
    onTouchStart: (e: GestureResponderEvent) => {
      const p = point(e);
      pos.stopAnimation((v) => (now.current = v));
      drag.current = { x: p.x, y: p.y, from: now.current, t: Date.now(), lastX: p.x, v: 0 };
    },
    onTouchMove: (e: GestureResponderEvent) => {
      const d = drag.current;
      if (!d) return;
      const p = point(e);
      // Decide once whether this is a sideways drag or the page scrolling.
      if (d.sideways === undefined && Math.max(Math.abs(p.x - d.x), Math.abs(p.y - d.y)) > 6) d.sideways = Math.abs(p.x - d.x) > Math.abs(p.y - d.y);
      if (!d.sideways) return;
      const t = Date.now();
      if (t > d.t) d.v = (p.x - d.lastX) / (t - d.t);
      d.t = t;
      d.lastX = p.x;
      track(d.from - (p.x - d.x) / SLOT);
    },
    onTouchEnd: () => {
      const d = drag.current;
      drag.current = null;
      if (!d?.sideways) return;
      // A quick flick carries on to the next player even after a short drag.
      settle(Math.round(now.current - d.v * 120 / SLOT));
    },
    onTouchCancel: () => {
      drag.current = null;
      settle(Math.round(now.current));
    },
  };

  // Each player's place and look, driven by the carousel position. Built once
  // per player count, not on every redraw. Only the players near the middle
  // show; the rest fade out at the sides.
  const looks = useMemo(() => {
    const fade = Math.min(1.6, n / 2);
    return Array.from({ length: n }, (_, i) => {
      const rel = Animated.add(Animated.modulo(Animated.add(Animated.multiply(pos, -1), i + n * 1000 + n / 2), n), -n / 2);
      return {
        opacity: n < 3 ? 1 : rel.interpolate({ inputRange: [-fade, -1, 0, 1, fade], outputRange: [0, 0.85, 1, 0.85, 0], extrapolate: 'clamp' }),
        transform: [
          { translateX: Animated.multiply(rel, SLOT) },
          { scale: rel.interpolate({ inputRange: [-1, 0, 1], outputRange: [SIDE / CENTER, 1, SIDE / CENTER], extrapolate: 'clamp' }) },
        ],
      };
    });
  }, [n, pos]);

  return (
    <View style={styles.wrap}>
      <Title size={34} style={styles.title}>
        PASS IT TO...
      </Title>
      <Svg width={34} height={20} style={styles.pointer}>
        <Polygon points="0,0 34,0 17,20" fill={colors.yellow} />
      </Svg>
      <View style={styles.row}>
        <Arrow dir={-1} onPress={() => step(-1)} />
        <View style={styles.window} {...touch}>
          {users.map((user, i) => {
            const isChosen = i === selected;
            return (
              <Animated.View
                key={user.id}
                pointerEvents={n > 1 ? 'box-none' : 'auto'}
                style={[styles.slot, looks[i], isChosen && styles.front]}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={isChosen ? `Passing to ${user.name}` : user.name}
                  onPress={() => !isChosen && step(shortWay(i - selected, n))}
                >
                  <Avatar user={user} size={CENTER} count={counts[user.id] ?? 0} selected={isChosen} label={firstName(user)} />
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
        <Arrow dir={1} onPress={() => step(1)} />
      </View>
    </View>
  );
}

// Distance between two players, and their sizes in the middle and at the sides.
const SLOT = 88;
const CENTER = 94;
const SIDE = 70;

// The shortest way round the loop from one player to another, in steps.
function shortWay(diff: number, n: number): number {
  if (diff > n / 2) return diff - n;
  if (diff < -n / 2) return diff + n;
  return diff;
}

function Arrow({ dir, onPress }: { dir: 1 | -1; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={dir > 0 ? 'Next player' : 'Previous player'} onPress={onPress} hitSlop={10}>
      <Svg width={40} height={36} viewBox="0 0 40 36" style={dir < 0 ? { transform: [{ scaleX: -1 }] } : undefined}>
        <Path d="M2 12 L22 12 L22 2 L38 18 L22 34 L22 24 L2 24 Z" fill={colors.white} />
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  title: {
    textAlign: 'center',
    marginBottom: 6,
  },
  pointer: {
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 4,
  },
  window: {
    flex: 1,
    // Phone browsers keep scrolling the page up and down, and leave sideways drags to us.
    ...(Platform.OS === 'web' ? ({ touchAction: 'pan-y' } as object) : null),
    height: CENTER + 40,
    overflow: 'hidden',
  },
  slot: {
    position: 'absolute',
    top: 10,
    left: '50%',
    marginLeft: -(CENTER + 30) / 2,
    width: CENTER + 30,
    alignItems: 'center',
  },
  front: {
    zIndex: 1,
  },
});
