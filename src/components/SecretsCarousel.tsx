import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { play } from '../feedback';
import type { GameState } from '../game';
import { colors, fonts } from '../theme';
import { SecretReveal } from './SecretReveal';

type Props = {
  state: GameState;
  index: number;
  onIndex: (index: number) => void;
  // Show every question face up, for looking back after the game.
  allRevealed?: boolean;
  onComment: (passIndex: number, author: number, text: string) => void;
  onReact: (passIndex: number, emoji: string) => void;
};

// The secrets one at a time, with arrows and a dot for each pass.
export function SecretsCarousel({ state, index, onIndex, allRevealed, onComment, onReact }: Props) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const count = state.passes.length;
  const go = (next: number) => {
    if (next < 0 || next >= count) return;
    play('tap');
    onIndex(next);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.nav}>
        <NavButton label="◀" accessibilityLabel="Previous secret" disabled={index === 0} onPress={() => go(index - 1)} />
        <View style={styles.counter}>
          <Text style={styles.counterLabel}>
            Secret {index + 1} of {count}
          </Text>
          <View style={styles.dots}>
            {state.passes.map((_, i) => (
              <View key={i} style={[styles.dot, (allRevealed || revealed.has(i)) && styles.dotSeen, i === index && styles.dotActive]} />
            ))}
          </View>
        </View>
        <NavButton label="▶" accessibilityLabel="Next secret" disabled={index === count - 1} onPress={() => go(index + 1)} />
      </View>

      <SecretReveal
        state={state}
        index={index}
        revealed={allRevealed || revealed.has(index)}
        onReveal={() => setRevealed((r) => new Set(r).add(index))}
        onComment={(author, text) => onComment(index, author, text)}
        onReact={(emoji) => onReact(index, emoji)}
      />
    </View>
  );
}

function NavButton({ label, accessibilityLabel, disabled, onPress }: { label: string; accessibilityLabel: string; disabled: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.navButton, disabled && styles.navDisabled, pressed && styles.pressed]}
    >
      <Text style={styles.navLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 16,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counter: {
    alignItems: 'center',
    gap: 6,
  },
  counterLabel: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.flame,
    letterSpacing: 0.5,
  },
  dots: {
    flexDirection: 'row',
    gap: 5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotSeen: {
    backgroundColor: colors.muted,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.flame,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border,
  },
  navDisabled: {
    opacity: 0.3,
  },
  navLabel: {
    fontSize: 16,
    color: colors.text,
  },
  pressed: {
    transform: [{ scale: 0.94 }],
  },
});
