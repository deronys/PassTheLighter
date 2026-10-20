// The end of a game: every secret revealed, comments, award votes and the champion.
import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

import { findCategory } from '../data/awards';
import { play } from '../feedback';
import { useNav } from '../nav';
import { firstName } from '../online/demo';
import { type Game, MAX_COMMENT, REACTIONS, everyoneVoted, lastHolder, players, results } from '../online/rules';
import { useStore } from '../online/store';
import { colors, comicShadow, fonts } from '../theme';
import { Avatar, BubbleText, ComicButton, Panel, PassBanner, LighterIcon, Screen, SpeechBubble, Title, art } from '../ui/kit';
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

// Shown once before the reveal: the game is over and the secrets are coming out.
export function EndIntro({ game }: { game: Game }) {
  const nav = useNav();
  const { seeEnd } = useStore();
  const bar = useGameBar(game);
  const name = useName();
  const ender = lastHolder(game);
  // A quick double tap on the final pass must not skip this screen.
  const ready = useRef(false);
  useEffect(() => {
    const t = setTimeout(() => (ready.current = true), 800);
    return () => clearTimeout(t);
  }, []);
  return (
    <Screen
      title="GAME OVER"
      onBack={nav.back}
      {...bar}
      onChat={undefined}
      footer={<ComicButton label="REVEAL THE SECRETS!" sound="pop" onPress={() => ready.current && seeEnd(game.id)} />}
    >
      <Text style={styles.gameName}>{game.name.toUpperCase()}</Text>
      <Image source={art.handLighter} style={styles.introArt} resizeMode="contain" />
      <Title size={34} style={styles.center}>
        THE LIGHTER WENT OUT!
      </Title>
      <Text style={styles.introText}>
        {ender ? `${name(ender)} got the lighter 3 times, so the game is over.` : 'The host ended the game.'} Now every secret comes out!
      </Text>
      <Panel style={styles.introSteps}>
        <IntroStep icon="🔍" text="See who passed the lighter to whom, and why" />
        <IntroStep icon="😂" text="React with emojis and comment on every move" />
        <IntroStep icon="🏆" text="Vote for the awards and crown the Lighter Champion" />
      </Panel>
    </Screen>
  );
}

function IntroStep({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.introStep}>
      <Text style={styles.introIcon}>{icon}</Text>
      <Text style={styles.introStepText}>{text}</Text>
    </View>
  );
}

// The reveal: every move in order, who passed the lighter to whom and the
// question that made them do it, with reactions and comments.
export function GameOver({ game }: { game: Game }) {
  const nav = useNav();
  const { state, me, user, react } = useStore();
  const bar = useGameBar(game);
  const name = useName();
  const ender = lastHolder(game);
  const voted = !!game.votes[me.id];
  const isPlayer = players(game).includes(me.id);
  if (!state.endSeen[game.id]) return <EndIntro game={game} />;

  const footer = isPlayer ? (
    voted || everyoneVoted(game) ? (
      <ComicButton label="VOTING RESULTS" color="yellow" onPress={() => nav.push({ name: 'results', id: game.id })} />
    ) : (
      <ComicButton label="VOTE NOW!" sound={null} onPress={() => nav.push({ name: 'vote', id: game.id })} />
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
      <Panel style={styles.tip}>
        <Text style={styles.tipText}>
          Tap an emoji to react, or <Text style={styles.tipStrong}>💬 COMMENT</Text> to say what you think about each move!
        </Text>
      </Panel>
      {game.passes.map((p, i) => {
        const comments = game.comments.filter((c) => c.passIndex === i);
        const latest = comments[comments.length - 1];
        return (
          <Panel key={i} style={styles.secret}>
            <Move game={game} index={i} />
            <View style={styles.reactions}>
              {REACTIONS.map((emoji) => {
                const who = game.reactions.filter((r) => r.passIndex === i && r.emoji === emoji);
                const mine = who.some((r) => r.from === me.id);
                return (
                  <Pressable
                    key={emoji}
                    accessibilityRole="button"
                    accessibilityLabel={`React ${emoji} to move ${i + 1}`}
                    accessibilityState={{ selected: mine }}
                    disabled={!isPlayer}
                    onPress={() => {
                      play('pop');
                      react(game.id, i, emoji);
                    }}
                    style={[styles.reaction, mine && styles.reactionMine]}
                  >
                    <Text style={styles.reactionEmoji}>{emoji}</Text>
                    {who.length > 0 && <Text style={styles.reactionCount}>{who.length}</Text>}
                  </Pressable>
                );
              })}
            </View>
            {latest && (
              <Text style={styles.latest} numberOfLines={1}>
                <Text style={styles.latestName}>{name(latest.from)}: </Text>
                {latest.text}
              </Text>
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Comments on move ${i + 1}`}
              onPress={() => nav.push({ name: 'comments', id: game.id, index: i })}
              style={styles.commentButton}
            >
              <Text style={styles.commentButtonLabel}>
                💬 {comments.length ? `${comments.length} ${comments.length === 1 ? 'COMMENT' : 'COMMENTS'}` : 'COMMENT'}
              </Text>
            </Pressable>
          </Panel>
        );
      })}
    </Screen>
  );
}

// One move of the reveal: who gave the lighter to whom, and the question they
// were answering by doing it (the one they had been asked).
function Move({ game, index, size = 48 }: { game: Game; index: number; size?: number }) {
  const { user, me } = useStore();
  const name = useName();
  const p = game.passes[index];
  const reason = game.passes[index - 1];
  const final = index === game.passes.length - 1 && lastHolder(game) === p.to;
  return (
    <View style={styles.move}>
      <View style={styles.secretHead}>
        <Step n={index + 1} />
        <Avatar user={user(p.from)} size={size} label={name(p.from)} />
        <View style={styles.moveArrow}>
          <View accessibilityLabel="passed the lighter to">
            <LighterIcon size={30} />
          </View>
          <Arrow />
        </View>
        <Avatar user={user(p.to)} size={size} label={name(p.to)} />
      </View>
      {reason ? (
        <>
          <Text style={styles.asked}>
            BECAUSE {name(reason.from).toUpperCase()} ASKED {reason.to === me.id ? 'YOU' : name(reason.to).toUpperCase()}:
          </Text>
          <SpeechBubble tail="top">
            <BubbleText>{reason.question}</BubbleText>
          </SpeechBubble>
        </>
      ) : (
        <Text style={styles.asked}>THE HOST STARTED THE GAME</Text>
      )}
      {final && <FinalPass name={name(p.to)} />}
    </View>
  );
}

// The last pass: no question, it just ends the game.
export function FinalPass({ name }: { name: string }) {
  return (
    <View style={styles.final}>
      <Text style={styles.finalText}>🔥 {name === 'You' ? 'Your' : `${name}'s`} 3rd lighter. Game over!</Text>
    </View>
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

// Comments on one revealed move.
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
              maxLength={MAX_COMMENT}
              onSubmitEditing={() => send(text)}
            />
            <ComicButton label="SEND" small disabled={!text.trim()} onPress={() => send(text)} sound={null} />
          </View>
        </View>
      }
    >
      <Panel style={styles.secret}>
        <Move game={g} index={index} size={56} />
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
          sound={null}
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
                  <View style={[styles.pickBox, picks[c] === p && styles.pickBoxOn]}>
                    <Avatar user={user(p)} size={54} selected={picks[c] === p} selectedColor={colors.green} label={firstName(user(p))} labelColor={picks[c] === p ? colors.green : colors.cyan} />
                    {picks[c] === p && (
                      <View style={styles.pickCheck}>
                        <Text style={styles.pickCheckMark}>✓</Text>
                      </View>
                    )}
                  </View>
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
  const [showVotes, setShowVotes] = useState(false);
  const g = game(id);
  if (!g) return <Missing title="VOTING RESULTS" />;
  const all = players(g);

  if (!everyoneVoted(g)) {
    return (
      <Screen title="VOTING RESULTS" onBack={nav.back} {...bar}>
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
    <Screen title="VOTING RESULTS" onBack={nav.back} {...bar}>
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
      <ComicButton label={showVotes ? 'HIDE WHO VOTED' : 'SEE WHO VOTED FOR WHO'} color="yellow" onPress={() => setShowVotes((v) => !v)} />
      {showVotes &&
        g.categories.map((c) => {
          const cat = findCategory(c);
          return (
            <Panel key={c} style={styles.ballots}>
              <Text style={styles.awardTitle}>
                {cat.emoji} {cat.title}
              </Text>
              {all.map((voter) => {
                const pick = g.votes[voter]?.[c];
                if (!pick) return null;
                return (
                  <View key={voter} style={styles.ballot}>
                    <Avatar user={user(voter)} size={32} />
                    <Text style={styles.ballotName}>{name(voter)}</Text>
                    <Text style={styles.ballotArrow}>→</Text>
                    <Avatar user={user(pick)} size={32} />
                    <Text style={styles.ballotName}>{name(pick)}</Text>
                  </View>
                );
              })}
            </Panel>
          );
        })}
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
  move: {
    gap: 8,
  },
  moveArrow: {
    alignItems: 'center',
  },
  introArt: {
    width: '100%',
    height: 190,
  },
  introText: {
    fontFamily: fonts.body,
    fontSize: 19,
    lineHeight: 26,
    color: colors.white,
    textAlign: 'center',
  },
  introSteps: {
    gap: 14,
  },
  introStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  introIcon: {
    fontSize: 30,
  },
  introStepText: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.white,
  },
  tip: {
    borderWidth: 2,
    borderColor: colors.yellow,
  },
  tipText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
  },
  tipStrong: {
    fontFamily: fonts.bold,
    color: colors.yellow,
  },
  reactions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  reaction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  reactionMine: {
    borderColor: colors.yellow,
    backgroundColor: 'rgba(255,210,31,0.25)',
  },
  reactionEmoji: {
    fontSize: 20,
  },
  reactionCount: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.white,
  },
  commentButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.yellow,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  commentButtonLabel: {
    fontFamily: fonts.comic,
    fontSize: 15,
    color: colors.ink,
    marginTop: 2,
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
  pickBox: {
    padding: 4,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  pickBoxOn: {
    borderColor: colors.green,
    backgroundColor: 'rgba(139,224,78,0.2)',
  },
  pickCheck: {
    position: 'absolute',
    top: -6,
    left: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.green,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickCheckMark: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.white,
  },
  ballots: {
    gap: 8,
  },
  ballot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ballotName: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.white,
  },
  ballotArrow: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.yellow,
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
