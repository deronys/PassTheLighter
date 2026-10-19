import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../components';
import { GameState } from '../game';
import { colors, common } from '../theme';

type Props = {
  state: GameState;
  onPlayAgain: () => void;
  onNewPlayers: () => void;
};

export function RevealScreen({ state, onPlayAgain, onNewPlayers }: Props) {
  const { players, passes, holder } = state;

  return (
    <ScrollView contentContainerStyle={common.content}>
      <Text style={styles.flame}>🔥</Text>
      <Text style={[common.title, styles.center]}>Everything revealed</Text>
      <Text style={[common.muted, styles.center]}>{players[holder]} got the lighter three times.</Text>

      {passes.map((pass, index) => (
        <View key={index} style={common.card}>
          <Text style={common.muted}>
            {players[pass.from]} asked {players[pass.to]}
          </Text>
          <Text style={styles.question}>{pass.question}</Text>
          {pass.answer !== undefined && (
            <Text style={common.body}>
              {players[pass.to]} picked <Text style={styles.answer}>{players[pass.answer]}</Text>
            </Text>
          )}
        </View>
      ))}

      <Button label="Play again" onPress={onPlayAgain} />
      <Button label="New players" variant="secondary" onPress={onNewPlayers} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flame: {
    fontSize: 64,
    textAlign: 'center',
    marginTop: 24,
  },
  center: {
    textAlign: 'center',
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  answer: {
    color: colors.flame,
    fontWeight: '700',
  },
});
