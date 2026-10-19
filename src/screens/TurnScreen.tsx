import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button, Chip } from '../components';
import { GameState, SAMPLE_QUESTIONS, incomingPass, isLastTurn } from '../game';
import { colors, common } from '../theme';

type Props = {
  state: GameState;
  onPass: (to: number, question: string) => void;
  onAnswerLast: (answer: number) => void;
};

export function TurnScreen({ state, onPass, onAnswerLast }: Props) {
  const [picked, setPicked] = useState<number | undefined>();
  const [question, setQuestion] = useState('');

  const { players, holder } = state;
  const incoming = incomingPass(state);
  const last = isLastTurn(state);
  const others = players.map((name, index) => ({ name, index })).filter((p) => p.index !== holder);

  const pickPrompt = incoming
    ? 'Answer by picking who gets the lighter. Don’t tell them why.'
    : 'Who gets the lighter first?';

  return (
    <ScrollView contentContainerStyle={common.content} keyboardShouldPersistTaps="handled">
      <Text style={common.muted}>{players[holder]}, you have the lighter 🔥</Text>

      {incoming && (
        <View style={common.card}>
          <Text style={common.muted}>{players[incoming.from]} asks you:</Text>
          <Text style={styles.question}>{incoming.question}</Text>
        </View>
      )}

      {last && (
        <Text style={common.body}>
          This is your third time with the lighter. Answer the question, then everything gets revealed.
        </Text>
      )}

      <Text style={common.heading}>{last ? 'Your answer' : pickPrompt}</Text>
      <View style={styles.chips}>
        {others.map((p) => (
          <Chip key={p.index} label={p.name} selected={picked === p.index} onPress={() => setPicked(p.index)} />
        ))}
      </View>

      {last ? (
        <Button
          label="Reveal everything"
          disabled={picked === undefined}
          onPress={() => picked !== undefined && onAnswerLast(picked)}
        />
      ) : (
        <>
          <Text style={common.heading}>
            {picked === undefined ? 'Your secret question' : `Your secret question for ${players[picked]}`}
          </Text>
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
          <Text style={common.muted}>Need an idea?</Text>
          <View style={styles.chips}>
            {SAMPLE_QUESTIONS.slice(0, 4).map((q) => (
              <Chip key={q} label={q} onPress={() => setQuestion(q)} />
            ))}
          </View>
          <Button
            label="Pass the lighter"
            disabled={picked === undefined || question.trim().length === 0}
            onPress={() => picked !== undefined && onPass(picked, question)}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  question: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  questionInput: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
});
