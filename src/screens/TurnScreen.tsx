import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { PopIn } from '../components/PopIn';
import { Screen } from '../components/Screen';
import { play } from '../feedback';
import { type GameState, incomingPass, isLastTurn } from '../game';
import { colors, common, fonts } from '../theme';

type Props = {
  state: GameState;
  suggestions: string[];
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
        <PopIn>
          <View style={[common.card, styles.target]}>
            <Avatar player={target} size={56} showName={false} />
            <View style={styles.targetText}>
              <Text style={common.muted}>The lighter goes to</Text>
              <Text style={common.heading}>{target.name}</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={() => setStep('pick')} style={styles.change}>
              <Text style={styles.changeLabel}>Change</Text>
            </Pressable>
          </View>
        </PopIn>
        <Text style={common.heading}>Your secret question for {target.name}</Text>
        <Text style={common.muted}>Ask about the others in the group. They answer by passing the lighter on.</Text>
        <TextInput
          style={[common.input, styles.questionInput]}
          value={question}
          onChangeText={setQuestion}
          placeholder="Who do you think…"
          placeholderTextColor={colors.muted}
          multiline
          maxLength={200}
        />
        <View style={styles.suggestHeader}>
          <Text style={common.muted}>Need an idea?</Text>
          <Pressable accessibilityRole="button" onPress={onShuffle} style={styles.shuffle}>
            <Text style={styles.shuffleLabel}>🎲 New ideas</Text>
          </Pressable>
        </View>
        <View style={common.row}>
          {suggestions.map((q) => (
            <Chip key={q} label={q} selected={q === question} onPress={() => setQuestion(q)} />
          ))}
        </View>
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
  target: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  targetText: {
    flex: 1,
  },
  change: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surfaceStrong,
  },
  changeLabel: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.text,
  },
  questionInput: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  suggestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shuffle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.surfaceStrong,
  },
  shuffleLabel: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.text,
  },
});
