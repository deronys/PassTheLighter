// 08 Pass the lighter, 10 You got it, 09 Ask a question, 10a Game status,
// 10b Player status and the finished game.
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { QUESTIONS } from '../data/questions';
import { play } from '../feedback';
import { useNav } from '../nav';
import { DEMO_TAKE_BACK_MS, firstName } from '../online/demo';
import { type Game, canSee, lastPass, players, reasonIndex, receives, roleOf, takeBackAt } from '../online/rules';
import { useStore } from '../online/store';
import { colors, comicShadow, fonts } from '../theme';
import { PlayerPicker } from '../ui/PlayerPicker';
import { Avatar, BubbleText, ComicButton, HiddenTicket, PassBanner, QuestionCoin, Screen, SpeechBubble, Tag, Title } from '../ui/kit';
import { WaitingRoom, useFlames } from './Lobby';

// Picks the screen for a game from where you stand in it.
export function GameScreen({ id }: { id: string }) {
  const { game, me } = useStore();
  const g = game(id);
  if (!g) return <Gone />;
  switch (roleOf(g, me.id)) {
    case 'invited':
    case 'waiting':
      return <WaitingRoom game={g} />;
    case 'starter':
    case 'holder':
      return <HolderScreen game={g} />;
    case 'lastPasser':
      return <PlayerStatus game={g} />;
    case 'watcher':
      return <GameStatus game={g} />;
    default:
      return <Finished game={g} />;
  }
}

function Gone() {
  const nav = useNav();
  return (
    <Screen title="GAME" onBack={nav.back}>
      <Text style={styles.hint}>This game is no longer available.</Text>
    </Screen>
  );
}

// Banner text: a small cyan name over a painted line, like "Dimitris / PASSED YOU THE LIGHTER".
function BannerText({ name, line, size = 22 }: { name?: string; line: string; size?: number }) {
  return (
    <View>
      {name !== undefined && <Text style={styles.bannerName}>{name}</Text>}
      <Title size={size} color={colors.white}>
        {line}
      </Title>
    </View>
  );
}

// 08 and 10: you hold the lighter. Choose who gets it next.
function HolderScreen({ game }: { game: Game }) {
  const nav = useNav();
  const { me, user } = useStore();
  const flames = useFlames();
  const others = players(game).filter((p) => p !== me.id).map(user);
  const [selected, setSelected] = useState(0);
  const last = lastPass(game);
  const counts = receives(game);
  const reason = last ? reasonIndex(game, game.passes.length - 1) : undefined;

  const footer = (
    <ComicButton label="PASS AND ASK!" sound="flick" onPress={() => nav.push({ name: 'ask', id: game.id, to: others[selected].id })} />
  );

  return (
    <Screen title={last ? 'YOU GOT IT!' : 'PASS THE LIGHTER'} onBack={nav.back} flames={flames} footer={footer}>
      <Text style={styles.gameName}>{game.name.toUpperCase()}</Text>
      {last ? (
        <>
          <PassBanner
            left={<Avatar user={user(last.from)} size={70} />}
            tag={reason !== undefined ? <Tag label="LEARN WHY" onPress={() => nav.push({ name: 'burn', id: game.id, index: reason })} /> : undefined}
          >
            <BannerText name={firstName(user(last.from))} line="PASSED YOU THE LIGHTER" />
          </PassBanner>
          <Title size={24} style={styles.section}>
            AND ASKED YOU
          </Title>
          <SpeechBubble tail="top" coin={<QuestionCoin size={46} />}>
            <BubbleText>{last.question}</BubbleText>
          </SpeechBubble>
          <Text style={styles.hint}>Answer by passing the lighter to that person. Never say why!</Text>
        </>
      ) : (
        <PassBanner>
          <Title size={34} color={colors.white}>
            YOU HAVE{'\n'}THE <Text style={{ color: colors.title }}>LIGHTER!</Text>
          </Title>
        </PassBanner>
      )}
      <View style={styles.picker}>
        <PlayerPicker users={others} counts={counts} selected={selected} onSelect={setSelected} />
      </View>
    </Screen>
  );
}

// 09: write the question for the friend you picked.
export function AskQuestion({ id, to }: { id: string; to: string }) {
  const nav = useNav();
  const { game, me, user, pass } = useStore();
  const flames = useFlames();
  const [question, setQuestion] = useState('');
  const target = user(to);
  const g = game(id);
  if (!g) return <Gone />;

  const suggest = () => {
    play('pop');
    let next = question;
    while (next === question) next = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
    setQuestion(next);
  };
  const send = () => {
    pass(id, to, question.trim());
    nav.back();
  };

  return (
    <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen
        title="ASK A QUESTION"
        onBack={nav.back}
        flames={flames}
        footer={<ComicButton label="ASK A QUESTION" sound="pass" disabled={!question.trim()} onPress={send} />}
      >
        <PassBanner left={<Avatar user={me} size={70} label="You" />} right={<Avatar user={target} size={70} lighter label={firstName(target)} />} burst={false}>
          <BannerText line="YOU PASS THE LIGHTER TO" size={20} />
        </PassBanner>
        <Title size={24} style={styles.section}>
          AND YOU ASK {firstName(target).toUpperCase()}
        </Title>
        <View style={styles.askRow}>
          <Avatar user={me} size={64} />
          <View style={styles.grow}>
            <SpeechBubble coin={<QuestionCoin size={46} onPress={suggest} label="Suggest a question" />}>
              <TextInput
                value={question}
                onChangeText={setQuestion}
                placeholder="TYPE YOUR QUESTION"
                placeholderTextColor="#9A9A9A"
                multiline
                maxLength={140}
                style={styles.input}
                autoFocus
              />
            </SpeechBubble>
          </View>
        </View>
        <Text style={styles.hint}>Write your own, or tap the ? for an idea. Only {firstName(target)} will see it.</Text>
      </Screen>
    </KeyboardAvoidingView>
  );
}

// 10b: you just passed the lighter. You can take it back if they sit on it.
function PlayerStatus({ game }: { game: Game }) {
  const nav = useNav();
  const { me, user, now, takeBack } = useStore();
  const flames = useFlames();
  const last = lastPass(game)!;
  const to = user(last.to);
  const at = takeBackAt(game, me.id, DEMO_TAKE_BACK_MS) ?? 0;
  const wait = at - now;

  return (
    <Screen
      title="GAME STATUS"
      onBack={nav.back}
      flames={flames}
      footer={<ComicButton label="HISTORY" color="yellow" onPress={() => nav.push({ name: 'progress', id: game.id })} />}
    >
      <Text style={styles.gameName}>{game.name.toUpperCase()}</Text>
      <PassBanner left={<Avatar user={me} size={70} label="You" />} right={<Avatar user={to} size={70} lighter label={firstName(to)} />}>
        <BannerText line="YOU PASSED THE LIGHTER TO" size={20} />
      </PassBanner>
      <View style={styles.center}>
        <ComicButton label="TAKE IT BACK" disabled={wait > 0} onPress={() => takeBack(game.id)} style={styles.takeBack} />
        <Text style={styles.hint}>
          {wait > 0 ? `If ${firstName(to)} doesn't move, you can take it back in ${Math.ceil(wait / 1000)}s.` : `${firstName(to)} is taking a while. You can take the lighter back.`}
        </Text>
      </View>
      <Title size={24} style={styles.section}>
        AND YOU ASKED
      </Title>
      <SpeechBubble tail="top" coin={<QuestionCoin size={46} />}>
        <BubbleText>{last.question}</BubbleText>
      </SpeechBubble>
    </Screen>
  );
}

// 10a: someone else has the lighter. The question is hidden unless you burn it.
function GameStatus({ game }: { game: Game }) {
  const nav = useNav();
  const { me, user } = useStore();
  const flames = useFlames();
  const index = game.passes.length - 1;
  const last = game.passes[index];

  return (
    <Screen
      title="GAME STATUS"
      onBack={nav.back}
      flames={flames}
      footer={<ComicButton label="HISTORY" color="yellow" onPress={() => nav.push({ name: 'progress', id: game.id })} />}
    >
      <Text style={styles.gameName}>{game.name.toUpperCase()}</Text>
      {last ? (
        <>
          <PassBanner
            left={<Avatar user={user(last.from)} size={70} label={firstName(user(last.from))} />}
            right={<Avatar user={user(last.to)} size={70} lighter label={firstName(user(last.to))} />}
          >
            <BannerText line="PASSED THE LIGHTER TO" size={20} />
          </PassBanner>
          <Title size={24} style={styles.section}>
            AND ASKED
          </Title>
          {canSee(game, index, me.id) ? (
            <SpeechBubble tail="top" coin={<QuestionCoin size={46} />}>
              <BubbleText>{last.question}</BubbleText>
            </SpeechBubble>
          ) : (
            <HiddenTicket onPress={() => nav.push({ name: 'burn', id: game.id, index })} />
          )}
        </>
      ) : (
        <PassBanner left={<Avatar user={user(game.holder!)} size={70} lighter />}>
          <BannerText name={firstName(user(game.holder!))} line="HAS THE LIGHTER!" />
        </PassBanner>
      )}
      <Text style={styles.hint}>Waiting for {firstName(user(game.holder!))} to pass the lighter.</Text>
    </Screen>
  );
}

function Finished({ game }: { game: Game }) {
  const nav = useNav();
  const { user } = useStore();
  const counts = receives(game);
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return (
    <Screen
      title="GAME OVER"
      onBack={nav.back}
      footer={<ComicButton label="HISTORY" color="yellow" onPress={() => nav.push({ name: 'progress', id: game.id })} />}
    >
      <Text style={styles.gameName}>{game.name.toUpperCase()}</Text>
      <PassBanner>
        <BannerText line={`THE LIGHTER WENT OUT AFTER ${game.passes.length} PASSES`} size={22} />
      </PassBanner>
      {top && (
        <View style={styles.center}>
          <Title size={24} style={styles.section}>
            MOST WANTED
          </Title>
          <Avatar user={user(top[0])} size={100} count={top[1]} selected label={user(top[0]).name} labelColor={colors.title} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  grow: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
    gap: 8,
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
  section: {
    marginTop: 8,
    marginLeft: 6,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.muted,
    textAlign: 'center',
  },
  picker: {
    marginTop: 18,
  },
  askRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  input: {
    fontFamily: fonts.body,
    fontSize: 20,
    color: colors.bubbleText,
    minHeight: 80,
    textAlignVertical: 'top',
    padding: 0,
    outlineStyle: 'none',
  } as object,
  takeBack: {
    minWidth: 240,
    marginTop: 10,
  },
});
