import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Flame } from './Lighter';

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
        <Text style={styles.homeLabel}>‹  Games</Text>
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
        {playing ? (
          <>
            <Flame size={16} />
            <Text style={styles.count}>
              {count}
              <Text style={styles.countOf}>/{RECEIVES_TO_END}</Text>
            </Text>
          </>
        ) : (
          <Text style={styles.homeLabel}>History</Text>
        )}
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
  },
  button: {
    minWidth: 44,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
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
  homeLabel: {
    fontFamily: fonts.semi,
    fontSize: 14,
    color: colors.text,
  },
  count: {
    fontFamily: fonts.display,
    fontSize: 15,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  countOf: {
    color: colors.muted,
  },
});
