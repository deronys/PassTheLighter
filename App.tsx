import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { GameState, answerLast, cleanNames, beginTurn, passLighter, startGame } from './src/game';
import { HandoffScreen } from './src/screens/HandoffScreen';
import { RevealScreen } from './src/screens/RevealScreen';
import { SetupScreen } from './src/screens/SetupScreen';
import { TurnScreen } from './src/screens/TurnScreen';
import { common } from './src/theme';

export default function App() {
  const [names, setNames] = useState<string[]>([]);
  const [game, setGame] = useState<GameState | null>(null);

  const start = (playerNames: string[]) => {
    const players = cleanNames(playerNames);
    setNames(players);
    setGame(startGame(players, Math.floor(Math.random() * players.length)));
  };

  let screen;
  if (!game) {
    screen = <SetupScreen initialNames={names} onStart={start} />;
  } else if (game.phase === 'handoff') {
    screen = (
      <HandoffScreen
        name={game.players[game.holder]}
        firstTurn={game.passes.length === 0}
        onReady={() => setGame(beginTurn(game))}
      />
    );
  } else if (game.phase === 'turn') {
    screen = (
      <TurnScreen
        // A fresh key per turn clears the previous player's picks.
        key={game.passes.length}
        state={game}
        onPass={(to, question) => setGame(passLighter(game, to, question))}
        onAnswerLast={(answer) => setGame(answerLast(game, answer))}
      />
    );
  } else {
    screen = (
      <RevealScreen state={game} onPlayAgain={() => start(game.players)} onNewPlayers={() => setGame(null)} />
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={common.screen}>
        <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {screen}
        </KeyboardAvoidingView>
      </SafeAreaView>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
