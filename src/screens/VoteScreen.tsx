import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { Screen } from '../components/Screen';
import { findCategory } from '../data/awards';
import type { GameState } from '../game';
import { common, fonts, colors } from '../theme';

type Props = {
  state: GameState;
  onHistory: () => void;
  onSubmit: (picks: Record<string, number>) => void;
};

export function VoteScreen({ state, onHistory, onSubmit }: Props) {
  const [picks, setPicks] = useState<Record<string, number>>({});
  const { players, voter, categories } = state;
  const done = categories.every((c) => picks[c] !== undefined);
  const remaining = categories.filter((c) => picks[c] === undefined).length;

  return (
    <Screen
      footer={
        <Button
          label={done ? 'Lock in my votes 🔒' : `${remaining} awards left`}
          disabled={!done}
          sound="pop"
          onPress={() => onSubmit(picks)}
        />
      }
    >
      <Text style={common.title}>Your votes</Text>
      <Text style={[common.muted, common.center]}>
        {players[voter].name}, vote in secret. You can't vote for yourself.
      </Text>
      <Pressable accessibilityRole="button" onPress={onHistory} style={styles.history}>
        <Text style={styles.historyLabel}>📜 See every question and answer</Text>
      </Pressable>
      {categories.map((id) => {
        const category = findCategory(id);
        return (
          <View key={id} style={common.card}>
            <Text style={styles.title}>
              {category.emoji} {category.title}
            </Text>
            <Text style={common.muted}>{category.description}</Text>
            <View style={styles.players}>
              {players.map((player, index) =>
                index === voter ? null : (
                  <Avatar
                    key={player.id}
                    player={player}
                    size={46}
                    checked={picks[id] === index}
                    dimmed={picks[id] !== undefined && picks[id] !== index}
                    onPress={() => setPicks({ ...picks, [id]: index })}
                  />
                ),
              )}
            </View>
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.text,
  },
  history: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyLabel: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.text,
  },
  players: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    paddingTop: 4,
  },
});
