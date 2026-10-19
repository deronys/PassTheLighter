import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { GameState } from '../game';
import { colors, fonts } from '../theme';
import { Avatar } from './Avatar';

type Props = {
  state: GameState;
  onHistory: () => void;
};

// Every player with how many times they got the lighter, plus the history button.
export function PlayerBar({ state, onHistory }: Props) {
  return (
    <View style={styles.bar}>
      <View style={styles.players}>
        {state.players.map((player, index) => (
          <Avatar
            key={player.id}
            player={player}
            size={40}
            flames={state.receives[index]}
            highlighted={index === state.holder && state.phase === 'turn'}
          />
        ))}
      </View>
      <Pressable accessibilityRole="button" onPress={onHistory} style={styles.history}>
        <Text style={styles.historyLabel}>📜 History · {state.passes.length}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    gap: 10,
    alignItems: 'center',
  },
  players: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  history: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyLabel: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.muted,
  },
});
