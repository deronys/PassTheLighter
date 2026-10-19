import { Pressable, StyleSheet, Text, View } from 'react-native';

import { type GameState, RECEIVES_TO_END } from '../game';
import { colors, fonts } from '../theme';

type Props = {
  state: GameState;
  onHome: () => void;
  onHistory: () => void;
};

const PLAYING = ['handoff', 'turn'];

// Shown on every screen of a game: home on the left; on the right, how many
// times the lighter holder has had it, which opens the game's history.
export function GameHeader({ state, onHome, onHistory }: Props) {
  const playing = PLAYING.includes(state.phase);
  const holder = state.players[state.holder];
  const count = state.receives[state.holder];

  return (
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Home" onPress={onHome} style={styles.button}>
        <Text style={styles.icon}>🏠</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          playing
            ? `${holder.name} has had the lighter ${count} of ${RECEIVES_TO_END} times. Open the game history.`
            : 'Open the game history'
        }
        onPress={onHistory}
        style={[styles.button, styles.counter]}
      >
        <Text style={styles.icon}>{playing ? '🔥' : '📜'}</Text>
        <Text style={styles.count}>{playing ? `${count}/${RECEIVES_TO_END}` : state.passes.length}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: colors.dusk,
  },
  button: {
    minWidth: 44,
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 22,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counter: {
    flexDirection: 'row',
    gap: 6,
  },
  icon: {
    fontSize: 20,
  },
  count: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.flame,
    fontVariant: ['tabular-nums'],
  },
});
