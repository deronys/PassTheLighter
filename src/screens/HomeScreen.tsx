import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { Lighter } from '../components/Lighter';
import { Screen } from '../components/Screen';
import { gameStatus, isFinished } from '../game';
import type { SavedGame } from '../games';
import { colors, common, fonts } from '../theme';

type Props = {
  games: SavedGame[];
  muted: boolean;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onNewGame: () => void;
  onProfiles: () => void;
  onMute: () => void;
};

export function HomeScreen({ games, muted, onOpen, onDelete, onNewGame, onProfiles, onMute }: Props) {
  const active = games.filter((g) => !isFinished(g.state));
  const finished = games.filter((g) => isFinished(g.state));

  return (
    <Screen footer={<Button label="New game" sound="flick" onPress={onNewGame} />}>
      <View style={styles.topRow}>
        <Pressable accessibilityRole="button" onPress={onProfiles} style={styles.pill}>
          <Text style={styles.pillLabel}>🏅 Profiles</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={muted ? 'Turn sound on' : 'Turn sound off'}
          onPress={onMute}
          style={styles.pill}
        >
          <Text style={styles.pillLabel}>{muted ? '🔇' : '🔊'}</Text>
        </Pressable>
      </View>

      <Lighter size={games.length > 0 ? 80 : 110} />
      <Text style={[common.title, styles.title]}>Pass The Lighter</Text>

      {games.length === 0 && (
        <Text style={[common.muted, common.center]}>
          One phone is the lighter. Pass it on, ask secret questions, and find out what everyone really thinks. Start
          a new game to play.
        </Text>
      )}

      {active.length > 0 && <Text style={common.heading}>Games in progress</Text>}
      {active.map((game) => (
        <GameCard key={game.id} game={game} onOpen={onOpen} />
      ))}

      {finished.length > 0 && <Text style={common.heading}>Finished games</Text>}
      {finished.map((game) => (
        <GameCard key={game.id} game={game} onOpen={onOpen} onDelete={onDelete} />
      ))}
    </Screen>
  );
}

function GameCard({ game, onOpen, onDelete }: { game: SavedGame; onOpen: (id: string) => void; onDelete?: (id: string) => void }) {
  const { state } = game;
  const finished = isFinished(state);
  const date = new Date(game.updatedAt);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${finished ? 'Open the recap of' : 'Continue'} the game with ${state.players.map((p) => p.name).join(', ')}`}
      onPress={() => onOpen(game.id)}
      style={({ pressed }) => [common.card, styles.card, !finished && styles.activeCard, pressed && styles.pressed]}
    >
      <View style={styles.cardTop}>
        <View style={styles.avatars}>
          {state.players.map((p, i) => (
            <View key={p.id} style={i > 0 && styles.overlap}>
              <Avatar player={p} size={34} showName={false} />
            </View>
          ))}
        </View>
        {onDelete && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Remove this game"
            onPress={() => onDelete(game.id)}
            hitSlop={10}
            style={styles.remove}
          >
            <Text style={styles.removeLabel}>✕</Text>
          </Pressable>
        )}
      </View>
      <Text style={styles.names} numberOfLines={1}>
        {state.players.map((p) => p.name).join(' · ')}
      </Text>
      <View style={styles.cardBottom}>
        <Text style={[styles.status, finished && styles.statusDone]}>{gameStatus(state)}</Text>
        <Text style={common.muted}>
          {date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}{' '}
          {date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillLabel: {
    fontFamily: fonts.bold,
    color: colors.text,
    fontSize: 14,
  },
  title: {
    fontSize: 40,
  },
  card: {
    gap: 8,
  },
  activeCard: {
    borderColor: colors.flame,
  },
  pressed: {
    opacity: 0.8,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatars: {
    flexDirection: 'row',
  },
  overlap: {
    marginLeft: -8,
  },
  remove: {
    padding: 4,
  },
  removeLabel: {
    fontSize: 16,
    color: colors.muted,
  },
  names: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.text,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  status: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.flame,
  },
  statusDone: {
    color: colors.muted,
  },
});
