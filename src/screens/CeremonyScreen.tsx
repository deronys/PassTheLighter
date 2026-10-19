import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { Confetti } from '../components/Confetti';
import { Screen } from '../components/Screen';
import { Trophy } from '../components/Trophy';
import { buzz, play } from '../feedback';
import type { GameState } from '../game';
import type { AwardResult } from '../results';
import { colors, common, fonts, nativeDriver } from '../theme';

type Props = {
  state: GameState;
  results: AwardResult[];
  onDone: () => void;
};

const DRUMROLL_MS = 1700;

// One award at a time: a drumroll, then the trophy drops and confetti flies.
export function CeremonyScreen({ state, results, onDone }: Props) {
  const [step, setStep] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [burst, setBurst] = useState(0);
  const drop = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;

  const result = results[step];
  const last = step === results.length - 1;

  useEffect(() => {
    setRevealed(false);
    drop.setValue(0);
    play('drumroll');
    const wobble = Animated.loop(
      Animated.sequence([
        Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: nativeDriver }),
        Animated.timing(shake, { toValue: -1, duration: 60, useNativeDriver: nativeDriver }),
      ]),
    );
    wobble.start();
    const timer = setTimeout(() => {
      wobble.stop();
      shake.setValue(0);
      setRevealed(true);
      setBurst((b) => b + 1);
      play('fanfare');
      buzz('success');
      Animated.timing(drop, { toValue: 1, duration: 700, easing: Easing.out(Easing.bounce), useNativeDriver: nativeDriver }).start();
    }, DRUMROLL_MS);
    return () => {
      clearTimeout(timer);
      wobble.stop();
    };
  }, [step, drop, shake]);

  const translateY = drop.interpolate({ inputRange: [0, 1], outputRange: [-260, 0] });
  const rotate = shake.interpolate({ inputRange: [-1, 1], outputRange: ['-6deg', '6deg'] });
  const winners = result.winners.map((i) => state.players[i]);

  return (
    <View style={styles.fill}>
      <Screen
        footer={
          <Button
            label={last ? 'See the full recap' : 'Next award'}
            disabled={!revealed}
            onPress={() => (last ? onDone() : setStep(step + 1))}
          />
        }
      >
        <Text style={styles.counter}>
          Award {step + 1} of {results.length}
        </Text>
        <Text style={[common.title, styles.title]}>
          {result.category.emoji} {result.category.title}
        </Text>
        <Text style={[common.muted, common.center]}>{result.category.description}</Text>

        <View style={styles.stage}>
          {revealed ? (
            <Animated.View style={{ transform: [{ translateY }] }}>
              <Trophy emoji={result.category.emoji} />
            </Animated.View>
          ) : (
            <Animated.Text style={[styles.drum, { transform: [{ rotate }] }]}>🥁</Animated.Text>
          )}
        </View>

        {revealed ? (
          <View style={styles.winners}>
            <Text style={[common.muted, common.center]}>
              {winners.length > 1 ? 'It\'s a tie! The award goes to' : 'The award goes to'}
            </Text>
            <View style={styles.winnerRow}>
              {winners.map((p) => (
                <Avatar key={p.id} player={p} size={80} highlighted />
              ))}
            </View>
            <Text style={[common.body, common.center]}>
              {result.category.kind === 'auto'
                ? `Got the lighter ${result.score} ${result.score === 1 ? 'time' : 'times'}`
                : `${result.score} ${result.score === 1 ? 'vote' : 'votes'}`}
            </Text>
          </View>
        ) : (
          <Text style={[common.heading, common.center]}>And the award goes to…</Text>
        )}
      </Screen>
      <Confetti burst={burst} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  counter: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 30,
    color: colors.gold,
  },
  stage: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drum: {
    fontSize: 96,
  },
  winners: {
    gap: 12,
    alignItems: 'center',
  },
  winnerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 18,
  },
});
