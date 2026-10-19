import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { Screen } from '../components/Screen';
import { findCategory } from '../data/awards';
import type { GameState } from '../game';
import { common, fonts, colors } from '../theme';

type Props = {
  state: GameState;
  onSubmit: (picks: Record<string, number>) => void;
};

export function VoteScreen({ state, onSubmit }: Props) {
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
        {players[voter].avatar} {players[voter].name}, vote in secret. You can't vote for yourself.
      </Text>
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
                    selected={picks[id] === index}
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
    fontSize: 19,
    color: colors.ember,
  },
  players: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    paddingTop: 4,
  },
});
