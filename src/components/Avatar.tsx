import { useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { type Player, RECEIVES_TO_END } from '../game';
import { colors, fonts, nativeDriver } from '../theme';

type Props = {
  player: Player;
  size?: number;
  // Shows a pip for each time the player got the lighter, out of three.
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

  const ring = checked ? colors.pick : selected ? colors.flame : undefined;
  const ringWidth = Math.max(2, Math.round(size / 24));
  const content = (
    <Animated.View style={[styles.wrap, dimmed && styles.dimmed, { transform: [{ scale: pop }] }]}>
      <View>
        {highlighted && (
          <Animated.View
            style={[
              styles.glow,
              { width: size + ringWidth * 2 + 20, height: size + ringWidth * 2 + 20, borderRadius: size, opacity: glow },
            ]}
          />
        )}
        <View
          style={[
            styles.ring,
            {
              padding: ringWidth,
              borderRadius: size / 2 + ringWidth * 2,
              borderColor: ring ?? 'transparent',
            },
          ]}
        >
          <LinearGradient
            colors={[player.color, shade(player.color)]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}
          >
            <Text style={[styles.initials, { fontSize: size * 0.36, color: isLight(player.color) ? colors.night : '#FFFFFF' }]}>
              {initials(player.name)}
            </Text>
          </LinearGradient>
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
        <View style={styles.pips} accessibilityLabel={`Got the lighter ${flames} times`}>
          {Array.from({ length: RECEIVES_TO_END }, (_, i) => (
            <View key={i} style={[styles.pip, i < flames && styles.pipLit]} />
          ))}
        </View>
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

// Up to two letters: the first of the first two words.
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words[0][0] + words[1][0] : (words[0] ?? '?').slice(0, 1)).toUpperCase();
}

function channels(hex: string): number[] {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

// A darker version of a colour, for the far end of the avatar's gradient.
function shade(hex: string): string {
  return '#' + channels(hex).map((c) => Math.round(c * 0.55).toString(16).padStart(2, '0')).join('');
}

function isLight(hex: string): boolean {
  const [r, g, b] = channels(hex);
  return 0.299 * r + 0.587 * g + 0.114 * b > 170;
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
    backgroundColor: 'rgba(255, 45, 111, 0.4)',
  },
  ring: {
    borderWidth: 2,
  },
  initials: {
    fontFamily: fonts.display,
    letterSpacing: -0.5,
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
    fontFamily: fonts.semi,
    fontSize: 13,
    color: colors.text,
  },
  pips: {
    flexDirection: 'row',
    gap: 3,
    height: 4,
  },
  pip: {
    width: 10,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceStrong,
  },
  pipLit: {
    backgroundColor: colors.flame,
  },
});
