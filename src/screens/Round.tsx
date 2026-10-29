// One round of a game, top to bottom: who asked whom, the question, and who
// that person gave the lighter to as their answer. Used by Game Progress, the
// reveal at the end and the comments.
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

import { useNav } from '../nav';
import { firstName } from '../online/demo';
import { type Game, canBurn, canSee, lastHolder, lightersToEnd, ordinal } from '../online/rules';
import { useStore } from '../online/store';
import { colors, comicShadow, fonts } from '../theme';
import { Avatar, HiddenTicket, LighterIcon, QuestionCoin } from '../ui/kit';

// The passes that carried a question, oldest first. Each one is a round; the
// final pass has no question, it only answers the round before it.
export const roundIndexes = (game: Game) => game.passes.flatMap((p, i) => (p.question ? [i] : []));

// How many times the receiver had got the lighter by each pass. The host's start counts as one.
export function runningCounts(game: Game): number[] {
  const seen: Record<string, number> = { [game.hostId]: 1 };
  return game.passes.map((p) => (seen[p.to] = (seen[p.to] ?? 0) + 1));
}

export function Round({ game, index, n, size = 44, counts }: { game: Game; index: number; n: number; size?: number; counts?: number[] }) {
  const nav = useNav();
  const { me, user } = useStore();
  const name = (id: string) => (id === me.id ? 'You' : firstName(user(id)));
  const NAME = (id: string) => name(id).toUpperCase();
  const asked = game.passes[index];
  const answer = game.passes[index + 1];
  const seen = canSee(game, index, me.id);
  const final = !!answer && index + 1 === game.passes.length - 1 && lastHolder(game) === answer.to;

  return (
    <View style={styles.round}>
      <View style={styles.head}>
        <View style={styles.step}>
          <Text style={styles.stepNumber}>{n}</Text>
        </View>
        <Text style={[styles.caption, styles.grow]}>
          {index === 0 ? `${NAME(asked.from)} STARTED THE GAME AND ASKED ${NAME(asked.to)}` : `${NAME(asked.from)} ASKED ${NAME(asked.to)}`}
        </Text>
      </View>
      <View style={styles.pair}>
        <Avatar user={user(asked.from)} size={size} label={name(asked.from)} />
        <View style={styles.arrow} accessibilityLabel="asked">
          <QuestionCoin size={22} />
          <Arrow />
        </View>
        <Avatar user={user(asked.to)} size={size} count={counts?.[index]} label={name(asked.to)} />
        {/* The question sits next to the two players, not under them. */}
        <View style={styles.question}>
          {seen ? (
            <View style={styles.bubble}>
              <Text style={styles.bubbleText}>{asked.question}</Text>
            </View>
          ) : (
            <HiddenTicket small onPress={canBurn(game, index, me.id) ? () => nav.push({ name: 'burn', id: game.id, index }) : undefined} />
          )}
        </View>
      </View>
      {answer ? (
        <>
          <Text style={styles.caption}>
            {answer.from === me.id ? 'YOU' : NAME(answer.from)} GAVE THE LIGHTER TO {answer.to === me.id ? 'YOU' : NAME(answer.to)}
          </Text>
          <View style={styles.pair}>
            <Avatar user={user(answer.from)} size={size} label={name(answer.from)} />
            <View style={styles.arrow} accessibilityLabel="passed the lighter to">
              <LighterIcon size={30} />
              <Arrow />
            </View>
            <Avatar user={user(answer.to)} size={size} count={counts?.[index + 1]} label={name(answer.to)} />
          </View>
          {final && <FinalPass name={name(answer.to)} n={lightersToEnd(game)} />}
        </>
      ) : (
        <Text style={styles.waiting}>
          {game.status === 'finished'
            ? 'The game ended before this was answered.'
            : asked.to === me.id
              ? 'Your turn: pass the lighter to answer.'
              : `Waiting for ${name(asked.to)} to pass the lighter...`}
        </Text>
      )}
    </View>
  );
}

// The last pass: no question, it just ends the game.
export function FinalPass({ name, n }: { name: string; n: number }) {
  return (
    <View style={styles.final}>
      <Text style={styles.finalText}>
        🔥 {name === 'You' ? 'Your' : `${name}'s`} {ordinal(n)} lighter. Game over!
      </Text>
    </View>
  );
}

function Arrow() {
  return (
    <Svg width={22} height={26} viewBox="0 0 26 30">
      <Polygon points="2,2 24,15 2,28" fill="none" stroke={colors.yellow} strokeWidth={3.5} strokeLinejoin="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  grow: {
    flex: 1,
  },
  round: {
    gap: 8,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  step: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.red,
    borderWidth: 3,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontFamily: fonts.comic,
    fontSize: 16,
    color: colors.white,
    marginTop: 2,
  },
  caption: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.cyan,
  },
  pair: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  question: {
    flex: 1,
    minWidth: 0,
  },
  bubble: {
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  bubbleText: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 18,
    color: colors.bubbleText,
  },
  arrow: {
    alignItems: 'center',
    gap: 2,
  },
  waiting: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.muted,
  },
  final: {
    backgroundColor: colors.red,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: colors.yellow,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  finalText: {
    fontFamily: fonts.comic,
    fontSize: 18,
    color: colors.white,
    textAlign: 'center',
    ...comicShadow,
  },
});
