import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Player } from '../game';
import { colors, fonts, nativeDriver } from '../theme';

type Props = {
  player: Player;
  size?: number;
  // Shows a little flame for each time the player got the lighter.
  flames?: number;
  highlighted?: boolean;
  selected?: boolean;
  // A green ring and tick, for a confirmed pick.
  checked?: boolean;
  dimmed?: boolean;
  showName?: boolean;
  onPress?: () => void;
};

export function Avatar({ player, size = 64, flames, highlighted, selected, checked, dimmed, showName = true, onPress }: Props) {
  const glow = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!highlighted) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 700, useNativeDriver: nativeDriver }),
        Animated.timing(glow, { toValue: 0, duration: 700, useNativeDriver: nativeDriver }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [highlighted, glow]);

  useEffect(() => {
    if (!selected && !checked) return;
    pop.setValue(0.8);
    Animated.spring(pop, { toValue: 1, useNativeDriver: nativeDriver, bounciness: 18 }).start();
  }, [selected, checked, pop]);

  const ring = checked ? colors.pick : selected ? colors.flame : player.color;
  const content = (
    <Animated.View style={[styles.wrap, dimmed && styles.dimmed, { transform: [{ scale: pop }] }]}>
      <View>
        {highlighted && (
          <Animated.View
            style={[
              styles.glow,
              { width: size + 16, height: size + 16, borderRadius: (size + 16) / 2, opacity: glow },
            ]}
          />
        )}
        <View
          style={[
            styles.circle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: ring,
              borderWidth: selected || checked ? 4 : 3,
              backgroundColor: player.color + '33',
            },
          ]}
        >
          <Text style={{ fontSize: size * 0.5 }}>{player.avatar}</Text>
        </View>
        {checked && (
          <View style={[styles.tick, { width: size * 0.4, height: size * 0.4, borderRadius: size * 0.2 }]}>
            <Text style={[styles.tickMark, { fontSize: size * 0.24 }]}>✓</Text>
          </View>
        )}
      </View>
      {showName && (
        <Text style={[styles.name, { maxWidth: size + 28 }]} numberOfLines={1}>
          {player.name}
        </Text>
      )}
      {flames !== undefined && (
        <Text style={styles.flames} accessibilityLabel={`Got the lighter ${flames} times`}>
          {flames > 0 ? '🔥'.repeat(flames) : '·'}
        </Text>
      )}
    </Animated.View>
  );

  if (!onPress) return content;
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: selected || checked }} accessibilityLabel={player.name} onPress={onPress}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 4,
  },
  dimmed: {
    opacity: 0.4,
  },
  glow: {
    position: 'absolute',
    top: -8,
    left: -8,
    backgroundColor: 'rgba(255, 177, 59, 0.45)',
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tick: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    backgroundColor: colors.pick,
    borderWidth: 2,
    borderColor: colors.night,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickMark: {
    fontFamily: fonts.bold,
    color: colors.night,
  },
  name: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.text,
  },
  flames: {
    fontSize: 11,
    minHeight: 14,
    color: colors.muted,
  },
});
