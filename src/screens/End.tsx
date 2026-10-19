// The end of a game: every secret revealed, comments, award votes and the champion.
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

import { findCategory } from '../data/awards';
import { play } from '../feedback';
import { useNav } from '../nav';
import { firstName } from '../online/demo';
import { type Game, everyoneVoted, lastHolder, players, results } from '../online/rules';
import { useStore } from '../online/store';
import { colors, comicShadow, fonts } from '../theme';
import { Avatar, BubbleText, ComicButton, Panel, PassBanner, Screen, SpeechBubble, Title } from '../ui/kit';
import { useGameBar } from './gameBar';

const ROASTS = ['😂 No way!', '🎯 Called it', '💀 Busted', '🙈 Awkward...', '🔥 Savage', '🤥 Liar!'];

function useName() {
  const { me, user } = useStore();
  return (id: string) => (id === me.id ? 'You' : firstName(user(id)));
}

function Missing({ title }: { title: string }) {
  const nav = useNav();
  return (
    <Screen title={title} onBack={nav.back}>
      <Text style={styles.hint}>This game is no longer available.</Text>
    </Screen>
  );
}

// The game is over: all questions revealed, in order, ready to comment on.
export function GameOver({ game }: { game: Game }) {
  const nav = useNav();
  const { me, user } = useStore();
  const bar = useGameBar(game);
  const name = useName();
  const ender = lastHolder(game);
  const voted = !!game.votes[me.id];
  const isPlayer = players(game).includes(me.id);

  const footer = isPlayer ? (
    voted || everyoneVoted(game) ? (
      <ComicButton label="RESULTS" color="yellow" onPress={() => nav.push({ name: 'results', id: game.id })} />
    ) : (
      <ComicButton label="VOTE NOW!" sound="flick" onPress={() => nav.push({ name: 'vote', id: game.id })} />
    )
  ) : undefined;

  return (
    <Screen title="GAME OVER" onBack={nav.back} footer={footer} {...bar}>
      <Text style={styles.gameName}>{game.name.toUpperCase()}</Text>
      {ender ? (
        <PassBanner left={<Avatar user={user(ender)} size={70} lighter />}>
          <Text style={styles.bannerName}>{name(ender)}</Text>
          <Title size={21} color={colors.white}>
            GOT THE LIGHTER 3 TIMES!
          </Title>
        </PassBanner>
      ) : (
        <PassBanner>
          <Title size={22} color={colors.white}>
            THE HOST ENDED THE GAME
          </Title>
        </PassBanner>
      )}
      <Title size={26} style={styles.center}>
        ALL SECRETS REVEALED!
      </Title>
      <Text style={styles.hint}>Tap a question to comment on it.</Text>
      {game.passes.map((p, i) => {
        const comments = game.comments.filter((c) => c.passIndex === i);
        const latest = comments[comments.length - 1];
        return (
          <Pressable key={i} accessibilityRole="button" accessibilityLabel={`Comments on question ${i + 1}`} onPress={() => nav.push({ name: 'comments', id: game.id, index: i })}>
            <Panel style={styles.secret}>
              <View style={styles.secretHead}>
                <Step n={i + 1} />
                <Avatar user={user(p.from)} size={48} label={name(p.from)} />
                <Arrow />
                <Avatar user={user(p.to)} size={48} label={name(p.to)} />
                <View style={styles.grow} />
                <View style={styles.commentCount}>
                  <Text style={styles.commentCountLabel}>💬 {comments.length}</Text>
                </View>
              </View>
              <SpeechBubble tail="top">
                <BubbleText>{p.question}</BubbleText>
              </SpeechBubble>
              {latest && (
                <Text style={styles.latest} numberOfLines={1}>
                  <Text style={styles.latestName}>{name(latest.from)}: </Text>
                  {latest.text}
                </Text>
              )}
            </Panel>
          </Pressable>
        );
      })}
    </Screen>
  );
}

function Step({ n }: { n: number }) {
  return (
    <View style={styles.step}>
      <Text style={styles.stepNumber}>{n}</Text>
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

// Comments on one revealed question.
export function Comments({ id, index }: { id: string; index: number }) {
  const nav = useNav();
  const { game, me, user, comment } = useStore();
  const bar = useGameBar(game(id));
  const name = useName();
  const [text, setText] = useState('');
  const g = game(id);
  const p = g?.passes[index];
  if (!g || !p) return <Missing title="COMMENTS" />;
  const list = g.comments.filter((c) => c.passIndex === index);
  const send = (t: string) => {
    if (!t.trim()) return;
    play('pop');
    comment(id, index, t);
    setText('');
  };

  return (
    <Screen
      title="COMMENTS"
      onBack={nav.back}
      {...bar}
      onChat={undefined}
      footer={
        <View style={styles.composer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roasts} keyboardShouldPersistTaps="handled">
            {ROASTS.map((r) => (
              <Pressable key={r} accessibilityRole="button" onPress={() => send(r)} style={styles.roast}>
                <Text style={styles.roastLabel}>{r}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <View style={styles.inputRow}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Write a comment"
              placeholderTextColor="#8A8A8A"
              style={styles.input}
              maxLength={140}
              onSubmitEditing={() => send(text)}
            />
            <ComicButton label="SEND" small disabled={!text.trim()} onPress={() => send(text)} sound={null} />
          </View>
        </View>
      }
    >
      <Panel style={styles.secret}>
        <View style={styles.secretHead}>
          <Step n={index + 1} />
          <Avatar user={user(p.from)} size={56} label={name(p.from)} />
          <Arrow />
          <Avatar user={user(p.to)} size={56} label={name(p.to)} />
        </View>
        <Text style={styles.asked}>
          {name(p.from)} asked {p.to === me.id ? 'you' : name(p.to)}:
        </Text>
        <SpeechBubble tail="top">
          <BubbleText>{p.question}</BubbleText>
        </SpeechBubble>
        {g.passes[index + 1] && (
          <Text style={styles.answer}>
            {name(p.to)} answered: <Text style={styles.answerName}>{name(g.passes[index + 1].to)}</Text>
          </Text>
        )}
      </Panel>
      {list.length === 0 && <Text style={styles.hint}>No comments yet. Be the first!</Text>}
      {list.map((c, i) => (
        <View key={i} style={styles.commentRow}>
          <Avatar user={user(c.from)} size={44} />
          <View style={styles.grow}>
            <Text style={styles.commentName}>{name(c.from)}</Text>
            <View style={styles.commentBubble}>
              <Text style={styles.commentText}>{c.text}</Text>
            </View>
          </View>
        </View>
      ))}
    </Screen>
  );
}

// Vote in this game's 5 award categories. Nobody can vote for themselves.
export function Vote({ id }: { id: string }) {
  const nav = useNav();
  const { game, me, user, vote } = useStore();
  const bar = useGameBar(game(id));
  const [picks, setPicks] = useState<Record<string, string>>({});
  const g = game(id);
  if (!g) return <Missing title="VOTE" />;
  const others = players(g).filter((p) => p !== me.id);
  const done = g.categories.every((c) => picks[c]);

  return (
    <Screen
      title="VOTE"
      onBack={nav.back}
      {...bar}
      footer={
        <ComicButton
          label={done ? 'SEND MY VOTES' : `${Object.keys(picks).length} OF ${g.categories.length} PICKED`}
          sound="flick"
          disabled={!done}
          onPress={() => {
            vote(id, picks);
            nav.replace({ name: 'results', id });
          }}
        />
      }
    >
      <Text style={styles.hint}>Pick one player for each award. You can't vote for yourself.</Text>
      {g.categories.map((c) => {
        const cat = findCategory(c);
        return (
          <Panel key={c} style={styles.category}>
            <View style={styles.categoryHead}>
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <View style={styles.grow}>
                <Title size={20}>{cat.title.toUpperCase()}</Title>
                <Text style={styles.small}>{cat.description}</Text>
              </View>
            </View>
            <View style={styles.choices}>
              {others.map((p) => (
                <Pressable
                  key={p}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: picks[c] === p }}
                  accessibilityLabel={`${cat.title}: ${user(p).name}`}
                  onPress={() => {
                    play('tap');
                    setPicks((x) => ({ ...x, [c]: p }));
                  }}
                  style={[styles.choice, picks[c] && picks[c] !== p && styles.dim]}
                >
                  <Avatar user={user(p)} size={54} selected={picks[c] === p} label={firstName(user(p))} labelColor={picks[c] === p ? colors.yellow : colors.cyan} />
                </Pressable>
              ))}
            </View>
          </Panel>
        );
      })}
    </Screen>
  );
}

// The awards: a winner per category and the Lighter Champion, who got the most votes in total.
export function Results({ id }: { id: string }) {
  const nav = useNav();
  const { game, me, user } = useStore();
  const bar = useGameBar(game(id));
  const name = useName();
  const g = game(id);
  if (!g) return <Missing title="RESULTS" />;
  const all = players(g);

  if (!everyoneVoted(g)) {
    return (
      <Screen title="RESULTS" onBack={nav.back} {...bar}>
        <Title size={26} style={styles.center}>
          WAITING FOR VOTES...
        </Title>
        <Text style={styles.hint}>The awards are revealed when everyone has voted.</Text>
        <View style={styles.choices}>
          {all.map((p) => (
            <View key={p} style={[styles.choice, !g.votes[p] && styles.dim]}>
              <Avatar user={user(p)} size={60} label={g.votes[p] ? `${name(p)} ✓` : name(p)} labelColor={g.votes[p] ? colors.green : colors.cyan} />
            </View>
          ))}
        </View>
        {!g.votes[me.id] && all.includes(me.id) && <ComicButton label="VOTE NOW!" onPress={() => nav.replace({ name: 'vote', id })} />}
      </Screen>
    );
  }

  const r = results(g);
  const ranking = [...all].sort((a, b) => (r.totals[b] ?? 0) - (r.totals[a] ?? 0));
  return (
    <Screen title="RESULTS" onBack={nav.back} {...bar}>
      <Panel style={styles.champion}>
        <Text style={styles.trophy}>🏆</Text>
        <Title size={30} style={styles.center}>
          LIGHTER CHAMPION
        </Title>
        <View style={styles.choices}>
          {r.champions.map((p) => (
            <Avatar key={p} user={user(p)} size={96} selected label={user(p).name} labelColor={colors.title} />
          ))}
        </View>
        <Text style={styles.championVotes}>{r.totals[r.champions[0]] ?? 0} votes in total</Text>
      </Panel>
      {g.categories.map((c) => {
        const cat = findCategory(c);
        const winners = r.winners[c];
        return (
          <Panel key={c} style={styles.award}>
            <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
            <View style={styles.grow}>
              <Text style={styles.awardTitle}>{cat.title}</Text>
              <Text style={styles.awardWinner}>
                {winners.map(name).join(' & ')}{' '}
                <Text style={styles.small}>
                  ({r.byCategory[c][winners[0]] ?? 0} {r.byCategory[c][winners[0]] === 1 ? 'vote' : 'votes'})
                </Text>
              </Text>
            </View>
            <View style={styles.winnerAvatars}>
              {winners.slice(0, 2).map((p) => (
                <Avatar key={p} user={user(p)} size={46} />
              ))}
            </View>
          </Panel>
        );
      })}
      <Title size={22} style={styles.center}>
        TOTAL VOTES
      </Title>
      {ranking.map((p, i) => (
        <View key={p} style={styles.rankRow}>
          <Text style={styles.rank}>{i + 1}</Text>
          <Avatar user={user(p)} size={40} />
          <Text style={[styles.rankName, styles.grow]}>{name(p)}</Text>
          <Text style={styles.rankVotes}>{r.totals[p] ?? 0}</Text>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  grow: {
    flex: 1,
  },
  center: {
    textAlign: 'center',
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.muted,
    textAlign: 'center',
  },
  small: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.muted,
  },
  gameName: {
    fontFamily: fonts.comic,
    fontSize: 18,
    color: colors.cyan,
    textAlign: 'center',
    ...comicShadow,
  },
  bannerName: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.cyan,
  },
  secret: {
    gap: 10,
  },
  secretHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  commentCount: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  commentCountLabel: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.white,
  },
  latest: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.white,
  },
  latestName: {
    fontFamily: fonts.bold,
    color: colors.cyan,
  },
  asked: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.cyan,
  },
  answer: {
    fontFamily: fonts.body,
    fontSize: 17,
    color: colors.white,
  },
  answerName: {
    fontFamily: fonts.comic,
    color: colors.yellow,
  },
  commentRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  commentName: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.cyan,
    marginBottom: 2,
  },
  commentBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  commentText: {
    fontFamily: fonts.body,
    fontSize: 17,
    color: colors.bubbleText,
  },
  composer: {
    gap: 8,
  },
  roasts: {
    gap: 8,
  },
  roast: {
    backgroundColor: colors.panel,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.yellow,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  roastLabel: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.white,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontFamily: fonts.body,
    fontSize: 17,
    color: colors.bubbleText,
  },
  category: {
    gap: 12,
  },
  categoryHead: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 36,
  },
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  choice: {
    alignItems: 'center',
  },
  dim: {
    opacity: 0.45,
  },
  champion: {
    alignItems: 'center',
    gap: 8,
    borderWidth: 3,
    borderColor: colors.yellow,
  },
  trophy: {
    fontSize: 64,
  },
  championVotes: {
    fontFamily: fonts.comic,
    fontSize: 20,
    color: colors.yellow,
    ...comicShadow,
  },
  award: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  awardTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.cyan,
  },
  awardWinner: {
    fontFamily: fonts.comic,
    fontSize: 20,
    color: colors.white,
    ...comicShadow,
  },
  winnerAvatars: {
    flexDirection: 'row',
    gap: 4,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.panel,
    borderRadius: 16,
    padding: 8,
  },
  rank: {
    width: 26,
    textAlign: 'center',
    fontFamily: fonts.comic,
    fontSize: 20,
    color: colors.yellow,
  },
  rankName: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.white,
  },
  rankVotes: {
    fontFamily: fonts.comic,
    fontSize: 22,
    color: colors.yellow,
    marginRight: 8,
  },
});
