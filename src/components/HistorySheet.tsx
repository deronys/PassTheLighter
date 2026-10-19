import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { GameState } from '../game';
import { colors, common, fonts } from '../theme';
import { Avatar } from './Avatar';
import { Button } from './Button';

type Props = {
  state: GameState;
  visible: boolean;
  onClose: () => void;
};

// Who gave the lighter to whom. While the game is on, the questions stay secret;
// once it is over, every question and answer is shown too.
export function HistorySheet({ state, visible, onClose }: Props) {
  const { players, passes } = state;
  const revealed = state.phase !== 'handoff' && state.phase !== 'turn';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close history" />
      <View style={styles.sheet}>
        <Text style={common.heading}>Lighter history</Text>
        <View style={styles.players}>
          {players.map((player, i) => (
            <Avatar key={player.id} player={player} size={38} flames={state.receives[i]} />
          ))}
        </View>
        <Text style={common.muted}>
          {revealed ? 'Every question and answer of this game.' : 'The questions stay secret until the end of the game.'}
        </Text>
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {passes.length === 0 && <Text style={common.muted}>Nobody has passed the lighter yet.</Text>}
          {passes.map((pass, index) => (
            <View key={index} style={styles.item}>
              <View style={styles.row}>
                <Text style={styles.number}>{index + 1}</Text>
                <Text style={styles.player} numberOfLines={1}>
                  {players[pass.from].avatar} {players[pass.from].name}
                </Text>
                <Text style={styles.arrow}>🔥→</Text>
                <Text style={styles.player} numberOfLines={1}>
                  {players[pass.to].avatar} {players[pass.to].name}
                </Text>
              </View>
              {revealed && (
                <View style={styles.reveal}>
                  <Text style={styles.question}>“{pass.question}”</Text>
                  {pass.answer !== undefined && (
                    <Text style={common.muted}>
                      {players[pass.to].name} answered {players[pass.answer].avatar} {players[pass.answer].name}
                    </Text>
                  )}
                </View>
              )}
            </View>
          ))}
        </ScrollView>
        <Button label="Close" variant="secondary" onPress={onClose} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  sheet: {
    maxHeight: '85%',
    backgroundColor: colors.dusk,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 32,
    gap: 12,
  },
  players: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    gap: 8,
  },
  item: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  number: {
    fontFamily: fonts.display,
    color: colors.muted,
    width: 22,
    fontVariant: ['tabular-nums'],
  },
  player: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.text,
  },
  arrow: {
    fontSize: 16,
  },
  reveal: {
    paddingLeft: 32,
    gap: 2,
  },
  question: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.ember,
  },
});
