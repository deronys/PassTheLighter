import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { Screen } from '../components/Screen';
import { ACHIEVEMENTS } from '../data/achievements';
import { AWARD_CATEGORIES } from '../data/awards';
import type { Profile } from '../profiles';
import { colors, common, fonts } from '../theme';

type Props = {
  profiles: Profile[];
  onBack: () => void;
};

export function ProfilesScreen({ profiles, onBack }: Props) {
  const [open, setOpen] = useState<string | null>(profiles[0]?.id ?? null);

  return (
    <Screen footer={<Button label="Back" variant="secondary" onPress={onBack} />}>
      <Text style={common.title}>Player profiles</Text>
      {profiles.length === 0 && (
        <Text style={[common.muted, common.center]}>Add players on the home screen. Their stats and trophies show up here after a game.</Text>
      )}
      {profiles.map((profile) => {
        const expanded = open === profile.id;
        const { stats } = profile;
        return (
          <Pressable
            key={profile.id}
            accessibilityRole="button"
            accessibilityState={{ expanded }}
            onPress={() => setOpen(expanded ? null : profile.id)}
            style={common.card}
          >
            <View style={styles.header}>
              <Avatar player={profile} size={52} showName={false} />
              <View style={styles.headerText}>
                <Text style={common.heading}>{profile.name}</Text>
                <Text style={common.muted}>
                  {stats.games} games · {profile.achievements.length}/{ACHIEVEMENTS.length} achievements
                </Text>
              </View>
            </View>
            <View style={styles.stats}>
              <Stat value={stats.received} label="lighters got" />
              <Stat value={stats.questionsAsked} label="questions" />
              <Stat value={stats.awards} label="awards" />
              <Stat value={stats.comments} label="comments" />
            </View>
            {expanded && (
              <View style={styles.details}>
                <Text style={styles.section}>Achievements</Text>
                {ACHIEVEMENTS.map((a) => {
                  const has = profile.achievements.includes(a.id);
                  return (
                    <View key={a.id} style={[styles.line, !has && styles.locked]}>
                      <Text style={styles.emoji}>{has ? a.emoji : '🔒'}</Text>
                      <View style={styles.lineText}>
                        <Text style={styles.lineTitle}>{a.title}</Text>
                        <Text style={common.muted}>{a.description}</Text>
                      </View>
                    </View>
                  );
                })}
                {stats.awards > 0 && <Text style={styles.section}>Trophies</Text>}
                {AWARD_CATEGORIES.filter((c) => stats.awardsByCategory[c.id]).map((c) => (
                  <View key={c.id} style={styles.line}>
                    <Text style={styles.emoji}>{c.emoji}</Text>
                    <Text style={[styles.lineTitle, styles.lineText]}>{c.title}</Text>
                    <Text style={styles.count}>×{stats.awardsByCategory[c.id]}</Text>
                  </View>
                ))}
              </View>
            )}
          </Pressable>
        );
      })}
    </Screen>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.flame,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.muted,
  },
  details: {
    gap: 10,
    paddingTop: 6,
  },
  section: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.text,
    letterSpacing: 0.5,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locked: {
    opacity: 0.45,
  },
  emoji: {
    fontSize: 24,
    width: 32,
    textAlign: 'center',
  },
  lineText: {
    flex: 1,
  },
  lineTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.text,
  },
  count: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.gold,
  },
});
