// 11 Burn the question, 12 Game progress and 13 the advertisement.
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Polygon } from 'react-native-svg';

import { buzz, play } from '../feedback';
import { useNav } from '../nav';
import { firstName } from '../online/demo';
import { type Game, canSee } from '../online/rules';
import { useStore } from '../online/store';
import { useGameBar } from './gameBar';
import { colors, comicShadow, fonts, nativeDriver } from '../theme';
import { Avatar, BubbleText, ComicButton, HiddenTicket, LighterIcon, Panel, PassBanner, QuestionCoin, Screen, SpeechBubble, Title, art } from '../ui/kit';

const AD_MS = 5000;
// How often the demo pretends no ad could be loaded.
const NO_AD_CHANCE = 0.1;

type BurnProps = { id: string; index: number; revealed?: boolean; missed?: boolean };

// 11: see who passed the lighter, and burn the question that made them do it.
export function BurnQuestion({ id, index, revealed, missed }: BurnProps) {
  const nav = useNav();
  const { game, me, user } = useStore();
  const bar = useGameBar(game(id));
  const [noAd, setNoAd] = useState(false);
  const [popup, setPopup] = useState(!!revealed);
  useEffect(() => setPopup(!!revealed), [revealed]);

  const g = game(id);
  const q = g?.passes[index];
  if (!g || !q) {
    return (
      <Screen title="BURN A QUESTION" onBack={nav.back}>
        <Text style={styles.hint}>This question is gone.</Text>
      </Screen>
    );
  }
  const next = g.passes[index + 1];
  const seen = canSee(g, index, me.id);
  const name = (uid: string) => (uid === me.id ? 'You' : firstName(user(uid)));
  const asker = user(q.from);

  const burnIt = () => {
    setNoAd(false);
    if (Math.random() < NO_AD_CHANCE) setNoAd(true);
    else nav.push({ name: 'ad', id, index });
  };

  const footer = seen ? (
    <ComicButton label="BACK" color="yellow" onPress={nav.back} />
  ) : (
    <View style={styles.row}>
      <ComicButton label="BACK" color="yellow" onPress={nav.back} style={styles.grow} />
      <ComicButton label="BURN IT!" sound={null} onPress={burnIt} style={styles.grow} />
    </View>
  );

  return (
    <Screen title="BURN A QUESTION" onBack={nav.back} footer={footer} {...bar}>
      {next ? (
        <PassBanner left={<Avatar user={user(next.from)} size={70} label={name(next.from)} />}>
          <Title size={22} color={colors.white}>
            {next.to === me.id ? 'PASSED YOU THE LIGHTER' : `PASSED THE LIGHTER TO ${name(next.to).toUpperCase()}`}
          </Title>
        </PassBanner>
      ) : (
        <PassBanner left={<Avatar user={user(q.to)} size={70} lighter label={name(q.to)} />}>
          <Title size={22} color={colors.white}>
            GOT THE LIGHTER
          </Title>
        </PassBanner>
      )}
      <View style={styles.because}>
        <Title size={24}>BECAUSE...</Title>
        <Avatar user={asker} size={64} label={name(q.from)} />
        <Title size={24}>ASKED {q.to === me.id ? 'YOU' : 'THEM'}</Title>
      </View>
      {seen ? (
        <SpeechBubble tail="top" coin={<QuestionCoin size={46} />}>
          <BubbleText>{q.question}</BubbleText>
        </SpeechBubble>
      ) : (
        <HiddenTicket onPress={burnIt} />
      )}
      {!seen && (
        <Panel style={styles.note}>
          <Image source={art.flame} style={styles.noteFlame} resizeMode="contain" />
          <Text style={styles.noteText}>
            {noAd
              ? 'No ad is available right now. Try again in a moment.'
              : missed
                ? 'The ad was closed early, so the question is still hidden. Watch it to the end to burn it.'
                : 'Watch a short ad to burn the question and find out why.'}
          </Text>
        </Panel>
      )}
      <RevealPopup
        visible={popup && seen}
        onClose={() => setPopup(false)}
        asker={name(q.from)}
        target={name(q.to)}
        question={q.question}
      />
    </Screen>
  );
}

// The flame grows, the ticket burns away and the question appears.
function RevealPopup({ visible, onClose, asker, target, question }: { visible: boolean; onClose: () => void; asker: string; target: string; question: string }) {
  const flame = useRef(new Animated.Value(0)).current;
  const text = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!visible) return;
    flame.setValue(0);
    text.setValue(0);
    play('boom');
    buzz('success');
    Animated.sequence([
      Animated.timing(flame, { toValue: 1, duration: 700, easing: Easing.out(Easing.back(2)), useNativeDriver: nativeDriver }),
      Animated.timing(text, { toValue: 1, duration: 400, useNativeDriver: nativeDriver }),
    ]).start();
  }, [visible, flame, text]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBack} onPress={onClose} accessibilityLabel="Close">
        <Panel style={styles.popup}>
          <Animated.Image
            source={art.flame}
            resizeMode="contain"
            style={[styles.popupFlame, { transform: [{ scale: flame.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }) }], opacity: flame }]}
          />
          <Title size={34} style={styles.centerText}>
            BURNED!
          </Title>
          <Animated.View style={[styles.popupBody, { opacity: text }]}>
            <Text style={styles.popupLine}>
              {asker} asked {target === 'You' ? 'you' : target}:
            </Text>
            <SpeechBubble tail="top">
              <BubbleText>{question}</BubbleText>
            </SpeechBubble>
          </Animated.View>
          <ComicButton label="GOT IT" color="yellow" onPress={onClose} />
        </Panel>
      </Pressable>
    </Modal>
  );
}

// 12: every pass so far, newest first. Hidden questions can be burned.
export function GameProgress({ id }: { id: string }) {
  const nav = useNav();
  const { game, me, user } = useStore();
  const bar = useGameBar(game(id));
  const g = game(id);
  if (!g) {
    return (
      <Screen title="GAME PROGRESS" onBack={nav.back}>
        <Text style={styles.hint}>This game is no longer available.</Text>
      </Screen>
    );
  }
  const counts = runningCounts(g);
  const holder = g.holder ? user(g.holder) : undefined;
  const rows = g.passes.map((p, i) => ({ p, i })).reverse();

  return (
    <Screen title="GAME PROGRESS" onBack={nav.back} {...bar} onLighters={undefined}>
      <Text style={styles.gameName}>{g.name.toUpperCase()}</Text>
      {holder?.id === me.id ? (
        // To the game screen, where you choose who gets the lighter.
        <Pressable accessibilityRole="button" accessibilityLabel="You have the lighter. Click to pass it" onPress={() => {
            const prev = nav.previous;
            if (prev?.name === 'game' && prev.id === id) nav.back();
            else nav.replace({ name: 'game', id });
          }}>
          <PassBanner left={<Avatar user={holder} size={70} lighter />}>
            <Title size={22} color={colors.white}>
              YOU HAVE THE LIGHTER.
            </Title>
            <Text style={styles.passIt}>CLICK TO PASS IT ▶</Text>
          </PassBanner>
        </Pressable>
      ) : holder ? (
        <PassBanner left={<Avatar user={holder} size={70} lighter />}>
          <Text style={styles.bannerName}>{firstName(holder)}</Text>
          <Title size={22} color={colors.white}>
            HAS THE LIGHTER!
          </Title>
        </PassBanner>
      ) : (
        <PassBanner>
          <Title size={24} color={colors.white}>
            THE GAME IS OVER
          </Title>
        </PassBanner>
      )}
      {rows.length === 0 && <Text style={styles.hint}>No passes yet.</Text>}
      {rows.map(({ p, i }) => {
        const seen = canSee(g, i, me.id);
        return (
          <View key={i} style={styles.progressRow}>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>{i + 1}</Text>
            </View>
            <View style={styles.progressQuestion}>
              {seen ? (
                <View style={[styles.miniBubble, !p.question && styles.miniFinal]}>
                  <Text style={[styles.miniText, !p.question && styles.miniFinalText]} numberOfLines={4}>
                    {p.question || '🔥 3rd lighter. Game over!'}
                  </Text>
                </View>
              ) : (
                <HiddenTicket small onPress={() => nav.push({ name: 'burn', id, index: i })} />
              )}
            </View>
            <Avatar user={user(p.from)} size={56} label={p.from === me.id ? 'You' : firstName(user(p.from))} />
            <View style={styles.moveArrow} accessibilityLabel="passed the lighter to">
              <LighterIcon size={26} />
              <Svg width={22} height={26} viewBox="0 0 26 30">
                <Polygon points="2,2 24,15 2,28" fill="none" stroke={colors.yellow} strokeWidth={3.5} strokeLinejoin="round" />
              </Svg>
            </View>
            <Avatar user={user(p.to)} size={56} count={counts[i]} label={p.to === me.id ? 'You' : firstName(user(p.to))} />
          </View>
        );
      })}
    </Screen>
  );
}

// How many times the receiver had got the lighter by each pass. The host's start counts as one.
function runningCounts(game: Game): number[] {
  const seen: Record<string, number> = { [game.hostId]: 1 };
  return game.passes.map((p) => (seen[p.to] = (seen[p.to] ?? 0) + 1));
}

// 13: a pretend full-screen ad. Watching to the end burns the question.
export function Advertisement({ id, index }: { id: string; index: number }) {
  const nav = useNav();
  const { burn } = useStore();
  const [left, setLeft] = useState(AD_MS);
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const started = Date.now();
    const timer = setInterval(() => setLeft(Math.max(0, AD_MS - (Date.now() - started))), 200);
    Animated.loop(Animated.timing(spin, { toValue: 1, duration: 2400, easing: Easing.linear, useNativeDriver: nativeDriver })).start();
    return () => clearInterval(timer);
  }, [spin]);

  const done = left <= 0;
  const close = () => {
    if (done) {
      burn(id, index);
      nav.backWith({ revealed: true, missed: false });
    } else {
      nav.backWith({ revealed: false, missed: true });
    }
  };

  return (
    <View style={styles.ad}>
      <View style={styles.adTop}>
        <Text style={styles.adTag}>AD · DEMO</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={done ? 'Close ad' : 'Close ad early'} onPress={close} hitSlop={12} style={styles.adClose}>
          {done ? (
            <Svg width={30} height={30} viewBox="0 0 30 30">
              <Path d="M7 7 L23 23 M23 7 L7 23" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" />
            </Svg>
          ) : (
            <Text style={styles.adCount}>{Math.ceil(left / 1000)}</Text>
          )}
        </Pressable>
      </View>
      <View style={styles.adBody}>
        <Animated.View style={{ transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }}>
          <Image source={art.burst} style={styles.adArt} resizeMode="contain" />
        </Animated.View>
        <Text style={styles.adTitle}>YOUR AD HERE</Text>
        <Text style={styles.adText}>In the real game a short video ad plays here. Watch it to the end to burn the question.</Text>
      </View>
      <Text style={styles.adFoot}>{done ? 'Reward earned! Close the ad to reveal the question.' : `Reward in ${Math.ceil(left / 1000)} seconds`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grow: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.muted,
    textAlign: 'center',
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
  because: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 8,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  noteFlame: {
    width: 36,
    height: 38,
  },
  noteText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 17,
    lineHeight: 23,
    color: colors.white,
  },
  modalBack: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  popup: {
    gap: 14,
    alignItems: 'stretch',
  },
  popupFlame: {
    width: 110,
    height: 116,
    alignSelf: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  popupBody: {
    gap: 10,
  },
  popupLine: {
    fontFamily: fonts.bold,
    fontSize: 19,
    color: colors.cyan,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  passIt: {
    fontFamily: fonts.comic,
    fontSize: 20,
    color: colors.yellow,
    marginTop: 4,
    ...comicShadow,
  },
  // The step's place in the game, oldest first.
  step: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.red,
    borderWidth: 3,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontFamily: fonts.comic,
    fontSize: 17,
    color: colors.white,
    marginTop: 2,
  },
  moveArrow: {
    alignItems: 'center',
  },
  progressQuestion: {
    flex: 1,
  },
  miniBubble: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 10,
    minHeight: 70,
    justifyContent: 'center',
  },
  miniFinal: {
    backgroundColor: colors.red,
    borderWidth: 2,
    borderColor: colors.yellow,
  },
  miniFinalText: {
    fontFamily: fonts.comic,
    color: colors.white,
  },
  miniText: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 18,
    color: colors.bubbleText,
  },
  ad: {
    flex: 1,
    backgroundColor: '#111318',
    padding: 20,
  },
  adTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  adTag: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.muted,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  adClose: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adCount: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.white,
  },
  adBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  adArt: {
    width: 180,
    height: 220,
  },
  adTitle: {
    fontFamily: fonts.comic,
    fontSize: 40,
    color: colors.yellow,
    ...comicShadow,
  },
  adText: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 25,
  },
  adFoot: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.cyan,
    textAlign: 'center',
    marginBottom: 20,
  },
});
