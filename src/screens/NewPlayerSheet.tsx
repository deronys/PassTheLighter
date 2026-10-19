import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { AVATARS, PLAYER_COLORS } from '../data/achievements';
import { newProfile, type Profile } from '../profiles';
import { colors, common } from '../theme';

type Props = {
  visible: boolean;
  takenNames: string[];
  onClose: () => void;
  onSave: (profile: Profile) => void;
};

export function NewPlayerSheet({ visible, takenNames, onClose, onSave }: Props) {
  const [name, setName] = useState('');
  // Avatars show initials; the emoji is still saved for older versions.
  const avatar = AVATARS[0];
  const [color, setColor] = useState(PLAYER_COLORS[0]);

  const trimmed = name.trim();
  const taken = takenNames.some((n) => n.toLowerCase() === trimmed.toLowerCase());
  const preview = { id: 'preview', name: trimmed || 'New player', avatar, color };

  const save = () => {
    onSave(newProfile({ ...preview, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }));
    setName('');
    setColor(PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
      <View style={styles.sheet}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.preview}>
            <Avatar player={preview} size={84} />
          </View>
          <TextInput
            style={common.input}
            value={name}
            onChangeText={setName}
            placeholder="Name"
            placeholderTextColor={colors.muted}
            autoCapitalize="words"
            maxLength={16}
          />
          {taken && <Text style={common.muted}>Someone already has that name.</Text>}
          <Text style={common.label}>Your colour</Text>
          <View style={styles.grid}>
            {PLAYER_COLORS.map((c) => (
              <Pressable
                key={c}
                accessibilityRole="button"
                accessibilityLabel={`Colour ${c}`}
                accessibilityState={{ selected: c === color }}
                onPress={() => setColor(c)}
                style={[styles.swatch, { backgroundColor: c }, c === color && styles.swatchSelected]}
              />
            ))}
          </View>
        </ScrollView>
        <View style={styles.actions}>
          <Button label="Add player" disabled={trimmed.length === 0 || taken} onPress={save} sound="pop" />
          <Button label="Cancel" variant="secondary" onPress={onClose} />
        </View>
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
    maxHeight: '88%',
    backgroundColor: colors.dusk,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 24,
  },
  content: {
    padding: 20,
    gap: 14,
  },
  preview: {
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  swatchSelected: {
    borderWidth: 4,
    borderColor: colors.text,
  },
  actions: {
    paddingHorizontal: 20,
    gap: 10,
  },
});
