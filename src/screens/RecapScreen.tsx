import { Text } from 'react-native';

import { Button } from '../components/Button';
import { MomentCard } from '../components/MomentCard';
import { Screen } from '../components/Screen';
import type { GameState } from '../game';
import { common } from '../theme';

type Props = {
  state: GameState;
  onComment: (passIndex: number, author: number, text: string) => void;
  onReact: (passIndex: number, emoji: string) => void;
  onVote: () => void;
};

export function RecapScreen({ state, onComment, onReact, onVote }: Props) {
  return (
    <Screen footer={<Button label="Vote for the awards 🏆" onPress={onVote} />}>
      <Text style={common.title}>The secrets</Text>
      <Text style={[common.muted, common.center]}>
        Every question, revealed. React, roast each other and comment on any pass before voting.
      </Text>
      {state.passes.map((_, index) => (
        <MomentCard
          key={index}
          state={state}
          index={index}
          onComment={(author, text) => onComment(index, author, text)}
          onReact={(emoji) => onReact(index, emoji)}
        />
      ))}
    </Screen>
  );
}
