import { useState } from 'react';
import { Text } from 'react-native';

import { Button } from '../components/Button';
import { Screen } from '../components/Screen';
import { SecretsCarousel } from '../components/SecretsCarousel';
import type { GameState } from '../game';
import { common } from '../theme';

type Props = {
  state: GameState;
  onComment: (passIndex: number, author: number, text: string) => void;
  onReact: (passIndex: number, emoji: string) => void;
  onVote: () => void;
};

// The big reveal: flip each secret question over, react and roast, then vote.
export function RecapScreen({ state, onComment, onReact, onVote }: Props) {
  const [index, setIndex] = useState(0);
  const last = index === state.passes.length - 1;

  return (
    <Screen
      footer={
        last ? (
          <Button label="Vote for the awards 🏆" onPress={onVote} />
        ) : (
          <Button label="Next secret ▶" onPress={() => setIndex(index + 1)} />
        )
      }
    >
      <Text style={common.title}>The secrets</Text>
      <SecretsCarousel state={state} index={index} onIndex={setIndex} onComment={onComment} onReact={onReact} />
    </Screen>
  );
}
