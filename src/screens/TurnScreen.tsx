import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { PopIn } from '../components/PopIn';
import { QuestionDeck } from '../components/QuestionDeck';
import { Screen } from '../components/Screen';
import { play } from '../feedback';
import { type GameState, incomingPass, isLastTurn } from '../game';
import { colors, common, fonts } from '../theme';

type Props = {
  state: GameState;
  // Question indexes dealt for this turn.
  suggestions: number[];
  top: React.ReactNode;
  onShuffle: () => void;
  onPass: (to: number, question: string) => void;
  onAnswerLast: (answer: number) => void;
};

// A turn has two steps: first pick who gets the lighter (the answer to the
// question you were asked), then write the question for them.
export function TurnScreen({ state, suggestions, top, onShuffle, onPass, onAnswerLast }: Props) {
  const [step, setStep] = useState<'pick' | 'ask'>('pick');
  const [picked, setPicked] = useState<number | undefined>();
  const [question, setQuestion] = useState('');

  const { players, holder } = state;
  const incoming = incomingPass(state);
  const last = isLastTurn(state);
  const others = players.map((player, index) => ({ player, index })).filter((p) => p.index !== holder);

  if (step === 'ask' && picked !== undefined) {
    const target = players[picked];
    return (
      <Screen
        footer={
          <Button
            label={`Pass to ${target.name} 🔥`}
            sound="pass"
            disabled={question.trim().length === 0}
            onPress={() => onPass(picked, question)}
          />
        }
      >
        <Text style={styles.stepLabel}>Step 2 of 2</Text>
        <View style={styles.askHeader}>
          <Text style={common.heading}>Pick a card for</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${target.name}. Change who gets the lighter`}
            onPress={() => setStep('pick')}
            style={styles.targetChip}
          >
            <Avatar player={target} size={30} showName={false} />
            <Text style={styles.targetName}>{target.name}</Text>
            <Text style={styles.changeIcon}>↺</Text>
          </Pressable>
        </View>
        <QuestionDeck cards={suggestions} onDeal={onShuffle} onChange={setQuestion} />
      </Screen>
    );
  }

  const footer = last ? (
    <Button
      label="Reveal everything"
      sound={null}
      disabled={picked === undefined}
      onPress={() => picked !== undefined && onAnswerLast(picked)}
    />
  ) : (
    <Button label="Next: write your question" disabled={picked === undefined} onPress={() => setStep('ask')} />
  );

  return (
    <Screen footer={footer}>
      {top}
      {!last && <Text style={styles.stepLabel}>Step 1 of 2</Text>}

      {incoming && (
        <PopIn>
          <View style={[common.card, styles.questionCard]}>
            <Text style={styles.kicker}>
              {players[incoming.from].avatar} {players[incoming.from].name} asks you
            </Text>
            <Text style={styles.question}>{incoming.question}</Text>
          </View>
        </PopIn>
      )}

      {last && (
        <View style={[common.card, styles.lastCard]}>
          <Text style={styles.lastTitle}>Third time with the lighter!</Text>
          <Text style={common.body}>Answer this last question, then all the secrets come out.</Text>
        </View>
      )}

      <Text style={common.heading}>
        {last ? 'Your answer' : incoming ? 'Answer by passing the lighter' : 'Who gets the lighter first?'}
      </Text>
      {incoming && !last && <Text style={common.muted}>Pick your answer. Don't tell them why!</Text>}
      <View style={styles.players}>
        {others.map(({ player, index }) => (
          <Avatar
            key={player.id}
            player={player}
            size={64}
            flames={state.receives[index]}
            checked={picked === index}
            dimmed={picked !== undefined && picked !== index}
            onPress={() => {
              play('pop');
              setPicked(index);
            }}
          />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stepLabel: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  questionCard: {
    borderColor: colors.flame,
    borderWidth: 2,
    backgroundColor: 'rgba(255, 177, 59, 0.12)',
  },
  kicker: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.ember,
  },
  question: {
    fontFamily: fonts.display,
    fontSize: 26,
    lineHeight: 32,
    color: colors.text,
  },
  lastCard: {
    backgroundColor: 'rgba(255, 94, 58, 0.18)',
    borderColor: colors.flameHot,
  },
  lastTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.flameHot,
  },
  players: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
    justifyContent: 'center',
  },
  askHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  targetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 4,
    paddingRight: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border,
  },
  targetName: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.flame,
  },
  changeIcon: {
    fontSize: 16,
    color: colors.muted,
  },
});
