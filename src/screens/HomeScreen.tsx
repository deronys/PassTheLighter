import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { Lighter } from '../components/Lighter';
import { Screen } from '../components/Screen';
import { MIN_PLAYERS } from '../game';
import type { Profile } from '../profiles';
import { colors, common, fonts } from '../theme';
import { NewPlayerSheet } from './NewPlayerSheet';

type Props = {
  profiles: Profile[];
  selected: string[];
  muted: boolean;
  onToggle: (id: string) => void;
  onCreate: (profile: Profile) => void;
  onProfiles: () => void;
  onMute: () => void;
  onStart: () => void;
};

export function HomeScreen({ profiles, selected, muted, onToggle, onCreate, onProfiles, onMute, onStart }: Props) {
  const [adding, setAdding] = useState(false);
  const missing = MIN_PLAYERS - selected.length;

  return (
    <Screen
      footer={
        <Button
          label={missing > 0 ? `Pick ${missing} more` : `Start · ${selected.length} players`}
          disabled={missing > 0}
          sound="flick"
          onPress={onStart}
        />
      }
    >
      <View style={styles.topRow}>
        <Pressable accessibilityRole="button" onPress={onProfiles} style={styles.pill}>
          <Text style={styles.pillLabel}>🏅 Profiles</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={muted ? 'Turn sound on' : 'Turn sound off'}
          onPress={onMute}
          style={styles.pill}
        >
          <Text style={styles.pillLabel}>{muted ? '🔇' : '🔊'}</Text>
        </Pressable>
      </View>

      <Lighter size={110} />
      <Text style={[common.title, styles.title]}>Pass The Lighter</Text>
      <Text style={[common.muted, common.center]}>
        One phone is the lighter. Pass it on, ask secret questions, and find out what everyone really thinks.
      </Text>

      <Text style={common.heading}>Who's playing?</Text>
      <View style={styles.grid}>
        {profiles.map((profile) => (
          <Avatar
            key={profile.id}
            player={profile}
            size={60}
            selected={selected.includes(profile.id)}
            dimmed={!selected.includes(profile.id)}
            onPress={() => onToggle(profile.id)}
          />
        ))}
        <Pressable accessibilityRole="button" onPress={() => setAdding(true)} style={styles.add}>
          <View style={styles.addCircle}>
            <Text style={styles.addPlus}>+</Text>
          </View>
          <Text style={styles.addLabel}>New player</Text>
        </Pressable>
      </View>
      {profiles.length > 0 && <Text style={[common.muted, common.center]}>Tap players to add or remove them from this game.</Text>}

      <NewPlayerSheet
        visible={adding}
        takenNames={profiles.map((p) => p.name)}
        onClose={() => setAdding(false)}
        onSave={(profile) => {
          setAdding(false);
          onCreate(profile);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillLabel: {
    fontFamily: fonts.bold,
    color: colors.text,
    fontSize: 14,
  },
  title: {
    fontSize: 42,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  add: {
    alignItems: 'center',
    gap: 4,
  },
  addCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPlus: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.muted,
  },
  addLabel: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.muted,
  },
});
