import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { PopIn } from '../components/PopIn';
import { QuestionDeck } from '../components/QuestionDeck';
import { QUESTIONS, type QuestionCategory, categoryOf } from '../data/questions';
import { Screen } from '../components/Screen';
import { play } from '../feedback';
import { type GameState, incomingPass, isLastTurn } from '../game';
import { colors, common, fonts } from '../theme';

// The look of your own card until you copy a question from an idea card.
const OWN_CARD: QuestionCategory = { name: 'Your question', emoji: '✏️', colors: ['#FF6A2B', '#C4134F'] };

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
  // The idea card the question was copied from, while it is unchanged.
  const [fromCard, setFromCard] = useState<number | undefined>();

  const { players, holder } = state;
  const incoming = incomingPass(state);
  const last = isLastTurn(state);
  const others = players.map((player, index) => ({ player, index })).filter((p) => p.index !== holder);

  if (step === 'ask' && picked !== undefined) {
    const target = players[picked];
    const card = fromCard !== undefined && question === QUESTIONS[fromCard] ? categoryOf(fromCard) : OWN_CARD;
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
          <Text style={common.heading}>Your question for</Text>
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
        <LinearGradient colors={card.colors} style={styles.ownCard}>
          <View style={styles.ownTop}>
            <Text style={styles.ownEmoji}>{card.emoji}</Text>
            <Text style={styles.ownKicker}>{card === OWN_CARD ? card.name : `${card.name} · your question`}</Text>
          </View>
          <TextInput
            style={styles.ownInput}
            value={question}
            onChangeText={setQuestion}
            placeholder={`Ask ${target.name} anything…`}
            placeholderTextColor="rgba(255,255,255,0.6)"
            multiline
            maxLength={140}
          />
          <View style={styles.ownBottom}>
            <Text style={styles.ownCount}>{question.length}/140</Text>
            <Text style={styles.ownBigEmoji}>{card.emoji}</Text>
          </View>
        </LinearGradient>

        <Text style={styles.ideasLabel}>💡 Stuck? Grab an idea</Text>
        <QuestionDeck cards={suggestions} onDeal={onShuffle} onUse={(index) => {
            setFromCard(index);
            setQuestion(QUESTIONS[index]);
          }} />
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
              {players[incoming.from].name} asks you
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
    fontFamily: fonts.bold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.4,
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
  ownCard: {
    minHeight: 200,
    borderRadius: 22,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  ownTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ownEmoji: {
    fontSize: 18,
  },
  ownKicker: {
    fontFamily: fonts.semi,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  ownInput: {
    flex: 1,
    minHeight: 96,
    fontFamily: fonts.bold,
    fontSize: 22,
    lineHeight: 28,
    color: '#FFFFFF',
    textAlignVertical: 'top',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowRadius: 6,
    padding: 0,
    borderWidth: 0,
    outlineWidth: 0,
  },
  ownBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  ownCount: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  ownBigEmoji: {
    fontSize: 34,
    opacity: 0.5,
  },
  ideasLabel: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
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
