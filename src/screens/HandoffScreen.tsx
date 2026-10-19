import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../components';
import { colors, common } from '../theme';

type Props = {
  name: string;
  firstTurn: boolean;
  onReady: () => void;
};

// Shown between turns so nobody sees the previous player's question.
export function HandoffScreen({ name, firstTurn, onReady }: Props) {
  return (
    <View style={[common.content, styles.container]}>
      <Text style={styles.flame}>🔥</Text>
      <Text style={[common.muted, styles.center]}>
        {firstTurn ? 'The lighter starts with' : 'Pass the lighter to'}
      </Text>
      <Text style={[common.title, styles.center, styles.name]}>{name}</Text>
      <Text style={[common.muted, styles.center]}>Only {name} should look at the screen.</Text>
      <View style={styles.button}>
        <Button label={`I'm ${name}`} onPress={onReady} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  flame: {
    fontSize: 96,
    textAlign: 'center',
  },
  center: {
    textAlign: 'center',
  },
  name: {
    fontSize: 40,
    color: colors.text,
  },
  button: {
    marginTop: 24,
  },
});
