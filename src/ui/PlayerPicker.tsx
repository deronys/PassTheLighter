import { useRef } from 'react';
import { Animated, type GestureResponderEvent, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path, Polygon } from 'react-native-svg';

import { play } from '../feedback';
import type { User } from '../online/rules';
import { colors, nativeDriver } from '../theme';
import { Avatar, Title } from './kit';

type Props = {
  users: User[];
  counts: Record<string, number>;
  selected: number;
  onSelect: (index: number) => void;
};

// "Pass it to...": three players at a time with the chosen one in the middle,
// under a yellow pointer. Swipe left or right, or use the arrows, to go
// through everyone.
export function PlayerPicker({ users, counts, selected, onSelect }: Props) {
  const n = users.length;
  const at = (offset: number) => (selected + offset + n) % n;
  const step = (dir: number) => {
    play('tap');
    onSelect(at(dir));
  };
  const side = (offset: number) => {
    const user = users[at(offset)];
    return (
      <Pressable accessibilityRole="button" accessibilityLabel={user.name} onPress={() => step(offset)} style={styles.side}>
        <Avatar user={user} size={70} count={counts[user.id] ?? 0} label={firstWord(user.name)} />
      </Pressable>
    );
  };
  const chosen = users[selected];

  // Swipe like a carousel: left brings the next player, right the previous one.
  // Plain touch events, so the swipe works in phone browsers as well as the app.
  const start = useRef<{ x: number; y: number } | null>(null);
  const dx = useRef(new Animated.Value(0)).current;
  const touch = (e: GestureResponderEvent) => {
    const n = e.nativeEvent as unknown as { pageX?: number; pageY?: number; changedTouches?: ArrayLike<{ pageX: number; pageY: number }> };
    const t = n.changedTouches?.[0];
    return { x: t?.pageX ?? n.pageX ?? 0, y: t?.pageY ?? n.pageY ?? 0 };
  };
  const swipe = {
    onTouchStart: (e: GestureResponderEvent) => {
      start.current = touch(e);
    },
    onTouchMove: (e: GestureResponderEvent) => {
      if (start.current) dx.setValue(Math.max(-60, Math.min(60, (touch(e).x - start.current.x) / 2)));
    },
    onTouchEnd: (e: GestureResponderEvent) => {
      if (!start.current) return;
      const end = touch(e);
      const moved = end.x - start.current.x;
      // A mostly up-and-down move is the page scrolling, not a swipe.
      const sideways = Math.abs(moved) > Math.abs(end.y - start.current.y);
      start.current = null;
      if (sideways && moved < -SWIPE_DISTANCE) step(1);
      else if (sideways && moved > SWIPE_DISTANCE) step(-1);
      Animated.spring(dx, { toValue: 0, useNativeDriver: nativeDriver, bounciness: 8 }).start();
    },
    onTouchCancel: () => {
      start.current = null;
      Animated.spring(dx, { toValue: 0, useNativeDriver: nativeDriver }).start();
    },
  };

  return (
    <View style={styles.wrap}>
      <Title size={34} style={styles.title}>
        PASS IT TO...
      </Title>
      <Svg width={34} height={20} style={styles.pointer}>
        <Polygon points="0,0 34,0 17,20" fill={colors.yellow} />
      </Svg>
      <Animated.View style={[styles.row, { transform: [{ translateX: dx }] }]} {...swipe}>
        <Arrow dir={-1} onPress={() => step(-1)} />
        {n > 2 && side(-1)}
        <View accessibilityLabel={`Passing to ${chosen.name}`} style={styles.center}>
          <Avatar user={chosen} size={94} count={counts[chosen.id] ?? 0} selected label={firstWord(chosen.name)} />
        </View>
        {n > 1 && side(1)}
        <Arrow dir={1} onPress={() => step(1)} />
      </Animated.View>
    </View>
  );
}

const SWIPE_DISTANCE = 40;

const firstWord = (name: string) => name.split(' ')[0];

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
    gap: 8,
  },
  side: {
    opacity: 0.85,
    marginTop: 14,
  },
  center: {
    marginHorizontal: 4,
  },
});
