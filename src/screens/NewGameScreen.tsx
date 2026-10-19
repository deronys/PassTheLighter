import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { Screen } from '../components/Screen';
import { MIN_PLAYERS } from '../game';
import type { Profile } from '../profiles';
import { colors, common, fonts } from '../theme';
import { NewPlayerSheet } from './NewPlayerSheet';

type Props = {
  profiles: Profile[];
  selected: string[];
  onToggle: (id: string) => void;
  onCreate: (profile: Profile) => void;
  onBack: () => void;
  onStart: () => void;
};

export function NewGameScreen({ profiles, selected, onToggle, onCreate, onBack, onStart }: Props) {
  const [adding, setAdding] = useState(false);
  const missing = MIN_PLAYERS - selected.length;

  return (
    <Screen
      footer={
        <>
          <Button
            label={missing > 0 ? `Pick ${missing} more` : `Start · ${selected.length} players`}
            disabled={missing > 0}
            sound="flick"
            onPress={onStart}
          />
          <Button label="Back" variant="secondary" onPress={onBack} />
        </>
      }
    >
      <Text style={common.title}>New game</Text>
      <Text style={[common.muted, common.center]}>Pick at least {MIN_PLAYERS} players. One phone is the lighter.</Text>

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
