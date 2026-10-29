// Development only: while "Bots wait for me" is on in Settings, a bot holding
// the lighter passes it only when you tap this button.
import { Pressable, StyleSheet, Text } from 'react-native';

import { botHolds, firstName } from '../online/demo';
import { type Game } from '../online/rules';
import { useStore } from '../online/store';
import { colors, fonts } from '../theme';

export function BotMoveButton({ game, compact }: { game: Game; compact?: boolean }) {
  const { state, user, botMove } = useStore();
  if (!state.settings.manualBots || !botHolds(state, game)) return null;
  const name = firstName(user(game.holder!));
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Make ${name} play`}
      onPress={() => botMove(game.id)}
      hitSlop={6}
      style={[styles.button, compact && styles.compact]}
    >
      <Text style={[styles.label, compact && styles.compactLabel]}>🤖 MAKE {name.toUpperCase()} PLAY</Text>
      {!compact && <Text style={styles.note}>Test mode: bots wait for your tap</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.cyan,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  compact: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 6,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.cyan,
  },
  compactLabel: {
    fontSize: 13,
  },
  note: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.muted,
  },
});
