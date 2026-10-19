import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { MomentCard } from '../components/MomentCard';
import { Screen } from '../components/Screen';
import { ACHIEVEMENTS } from '../data/achievements';
import type { GameState } from '../game';
import type { AwardResult, PlayerStats } from '../results';
import { colors, common, fonts } from '../theme';

type Tab = 'awards' | 'moments' | 'stats';

type Props = {
  state: GameState;
  results: AwardResult[];
  stats: PlayerStats[];
  unlocked: string[][];
  onComment: (passIndex: number, author: number, text: string) => void;
  onReact: (passIndex: number, emoji: string) => void;
  onPlayAgain: () => void;
  onHome: () => void;
};

export function FinalScreen({ state, results, stats, unlocked, onComment, onReact, onPlayAgain, onHome }: Props) {
  const [tab, setTab] = useState<Tab>('awards');
  const { players } = state;

  return (
    <Screen
      footer={
        <>
          <Button label="Play again" sound="flick" onPress={onPlayAgain} />
          <Button label="Home" variant="secondary" onPress={onHome} />
        </>
      }
    >
      <Text style={common.title}>Tonight's recap</Text>
      <View style={styles.tabs} accessibilityRole="tablist">
        {(['awards', 'moments', 'stats'] as Tab[]).map((t) => (
          <Pressable
            key={t}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === t }}
            onPress={() => setTab(t)}
            style={[styles.tab, tab === t && styles.tabActive]}
          >
            <Text style={[styles.tabLabel, tab === t && styles.tabLabelActive]}>
              {t === 'awards' ? '🏆 Awards' : t === 'moments' ? '💬 Moments' : '📊 Stats'}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === 'awards' &&
        results.map((r) => (
          <View key={r.category.id} style={[common.card, styles.awardRow]}>
            <Text style={styles.awardEmoji}>{r.category.emoji}</Text>
            <View style={styles.awardText}>
              <Text style={styles.awardTitle}>{r.category.title}</Text>
              <Text style={common.body}>{r.winners.map((i) => `${players[i].avatar} ${players[i].name}`).join(', ')}</Text>
            </View>
          </View>
        ))}

      {tab === 'moments' &&
        state.passes.map((_, index) => (
          <MomentCard
            key={index}
            state={state}
            index={index}
            onComment={(author, text) => onComment(index, author, text)}
            onReact={(emoji) => onReact(index, emoji)}
          />
        ))}

      {tab === 'stats' &&
        players.map((player, i) => {
          const s = stats[i];
          const won = results.filter((r) => r.winners.includes(i));
          return (
            <View key={player.id} style={common.card}>
              <View style={styles.statHeader}>
                <Avatar player={player} size={48} showName={false} />
                <Text style={[common.heading, styles.statName]}>{player.name}</Text>
                <Text style={styles.trophies}>{won.map((r) => r.category.emoji).join(' ')}</Text>
              </View>
              <View style={styles.statRow}>
                <Stat value={s.received} label="got the lighter" />
                <Stat value={s.passed} label="passed it" />
                <Stat value={s.comments} label="comments" />
                <Stat value={s.reactionsOnPasses} label="reactions" />
              </View>
              {unlocked[i]?.map((id) => {
                const a = ACHIEVEMENTS.find((x) => x.id === id);
                return a ? (
                  <Text key={id} style={styles.unlocked}>
                    {a.emoji} New achievement: {a.title}
                  </Text>
                ) : null;
              })}
            </View>
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.flame,
  },
  tabLabel: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.muted,
  },
  tabLabelActive: {
    color: colors.onFlame,
  },
  awardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  awardEmoji: {
    fontSize: 34,
  },
  awardText: {
    flex: 1,
    gap: 2,
  },
  awardTitle: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.gold,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statName: {
    flex: 1,
  },
  trophies: {
    fontSize: 20,
  },
  statRow: {
    flexDirection: 'row',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.flame,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.muted,
    textAlign: 'center',
  },
  unlocked: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.ember,
  },
});
