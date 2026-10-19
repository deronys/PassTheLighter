import { StyleSheet, View } from 'react-native';

import type { GameState } from '../game';
import { Avatar } from './Avatar';

// Every player with how many times they got the lighter.
export function PlayerBar({ state }: { state: GameState }) {
  return (
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
  );
}

const styles = StyleSheet.create({
  players: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
});
