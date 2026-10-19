import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '../components';
import { MIN_PLAYERS, canStart, cleanNames } from '../game';
import { colors, common } from '../theme';

type Props = {
  initialNames: string[];
  onStart: (names: string[]) => void;
};

export function SetupScreen({ initialNames, onStart }: Props) {
  const [names, setNames] = useState(
    initialNames.length > 0 ? initialNames : Array<string>(MIN_PLAYERS).fill(''),
  );

  const setName = (index: number, value: string) =>
    setNames((current) => current.map((n, i) => (i === index ? value : n)));
  const removeName = (index: number) =>
    setNames((current) => current.filter((_, i) => i !== index));

  const filled = cleanNames(names).length;
  const ready = canStart(names);

  return (
    <ScrollView contentContainerStyle={common.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.flame}>🔥</Text>
      <Text style={[common.title, styles.center]}>Pass The Lighter</Text>
      <Text style={[common.muted, styles.center]}>
        One phone is the lighter. Add at least {MIN_PLAYERS} players.
      </Text>

      {names.map((name, index) => (
        <View key={index} style={styles.row}>
          <TextInput
            style={[common.input, styles.nameInput]}
            value={name}
            onChangeText={(value) => setName(index, value)}
            placeholder={`Player ${index + 1}`}
            placeholderTextColor={colors.muted}
            autoCapitalize="words"
            returnKeyType="next"
          />
          {names.length > MIN_PLAYERS && (
            <Pressable
              accessibilityLabel={`Remove player ${index + 1}`}
              onPress={() => removeName(index)}
              style={styles.remove}
            >
              <Text style={styles.removeLabel}>✕</Text>
            </Pressable>
          )}
        </View>
      ))}

      <Button label="+ Add player" variant="secondary" onPress={() => setNames([...names, ''])} />
      {!ready && filled >= MIN_PLAYERS && (
        <Text style={[common.muted, styles.center]}>Each player needs a different name.</Text>
      )}
      <Button label="Start" disabled={!ready} onPress={() => onStart(names)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flame: {
    fontSize: 64,
    textAlign: 'center',
    marginTop: 24,
  },
  center: {
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameInput: {
    flex: 1,
  },
  remove: {
    padding: 12,
  },
  removeLabel: {
    fontSize: 18,
    color: colors.muted,
  },
});
