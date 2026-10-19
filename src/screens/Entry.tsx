// 01 Welcome, 02 Learn the game, 03 Login and 04 Main menu.
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { useNav } from '../nav';
import { useStore } from '../online/store';
import { colors, comicShadow, fonts, nativeDriver } from '../theme';
import { ComicButton, Panel, Screen, Title, art } from '../ui/kit';

const SPLASH_MS = 1800;

export function Splash() {
  const { state, ready } = useStore();
  const nav = useNav();
  const progress = useRef(new Animated.Value(0)).current;
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const id = progress.addListener(({ value }) => setPercent(Math.round(value * 100)));
    Animated.timing(progress, { toValue: 1, duration: SPLASH_MS, easing: Easing.out(Easing.quad), useNativeDriver: false }).start();
    return () => progress.removeListener(id);
  }, [progress]);

  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => {
      if (!state.seenTutorial) nav.reset({ name: 'tutorial' });
      else if (!state.me) nav.reset({ name: 'login' });
      else nav.reset({ name: 'menu' });
    }, SPLASH_MS + 200);
    return () => clearTimeout(timer);
    // Decide once, when the saved state has loaded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return (
    <Screen scroll={false}>
      <View style={styles.splash}>
        <Image source={art.logo} style={styles.logo} resizeMode="contain" accessibilityLabel="Pass The Lighter" />
        <Title size={34} color={colors.white}>
          LOADING...
        </Title>
        <View style={styles.bar}>
          <Animated.View style={[styles.barFill, { width }]}>
            <LinearGradient colors={['#FF4A36', '#FFC400']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
          </Animated.View>
          <Text style={styles.barLabel}>{percent}%</Text>
        </View>
        <Image source={art.handLighter} style={styles.hand} resizeMode="contain" />
      </View>
    </Screen>
  );
}

const TUTORIAL = [
  { title: 'GRAB THE LIGHTER', text: 'Start a game with your friends. The host holds the lighter first.' },
  { title: 'PASS AND ASK', text: 'Pass the lighter to a friend and ask them a secret question. Only they can read it.' },
  { title: 'ANSWER WITH THE LIGHTER', text: 'To answer your question, pass the lighter to the friend who is your answer, and ask them a new one. Never say why!' },
  { title: 'BURN THE QUESTION', text: 'Got the lighter and dying to know why? Burn the hidden question to reveal it.' },
];

export function Tutorial({ fromMenu }: { fromMenu?: boolean }) {
  const nav = useNav();
  const { finishTutorial, state } = useStore();
  const [page, setPage] = useState(0);
  const done = () => {
    finishTutorial();
    if (fromMenu) nav.back();
    else nav.reset(state.me ? { name: 'menu' } : { name: 'login' });
  };
  const last = page === TUTORIAL.length - 1;
  const step = TUTORIAL[page];

  return (
    <Screen
      title="HOW TO PLAY"
      onBack={fromMenu ? nav.back : undefined}
      footer={
        <View style={styles.row}>
          <ComicButton label={page === 0 ? 'SKIP' : 'BACK'} color="yellow" onPress={page === 0 ? done : () => setPage(page - 1)} style={styles.half} />
          <ComicButton label={last ? 'DONE' : 'NEXT'} onPress={last ? done : () => setPage(page + 1)} style={styles.half} />
        </View>
      }
    >
      <Image source={page % 2 ? art.handLighter : art.logo} style={styles.tutorialArt} resizeMode="contain" />
      <Panel style={styles.tutorialPanel}>
        <Title size={30}>{step.title}</Title>
        <Text style={styles.tutorialText}>{step.text}</Text>
      </Panel>
      <View style={styles.dots}>
        {TUTORIAL.map((_, i) => (
          <View key={i} style={[styles.dot, i === page && styles.dotOn]} />
        ))}
      </View>
    </Screen>
  );
}

export function Login() {
  const nav = useNav();
  const { signIn } = useStore();
  // The demo can't reach Facebook or Google, so it asks for the name they would give.
  const [provider, setProvider] = useState<'facebook' | 'google' | null>(null);
  const [name, setName] = useState('John');
  const go = () => {
    signIn(name.trim() || 'John');
    nav.reset({ name: 'menu' });
  };

  return (
    <Screen scroll>
      <Image source={art.logo} style={styles.logoLogin} resizeMode="contain" accessibilityLabel="Pass The Lighter" />
      {provider === null ? (
        <View style={styles.loginButtons}>
          <Pressable accessibilityRole="button" onPress={() => setProvider('facebook')} style={[styles.social, styles.facebook]}>
            <Svg width={44} height={50} viewBox="0 0 44 50">
              <Path d="M10 22 V14 a12 12 0 0 1 24 0 V22" stroke="#3B3B3B" strokeWidth={6} fill="none" />
              <Path d="M4 22 h36 a3 3 0 0 1 3 3 v20 a3 3 0 0 1 -3 3 h-36 a3 3 0 0 1 -3 -3 v-20 a3 3 0 0 1 3 -3 z" fill={colors.yellow} stroke="#5A2A00" strokeWidth={2} />
              <Circle cx={22} cy={33} r={4} fill="#3B2200" />
              <Path d="M20 34 h4 l1 8 h-6 z" fill="#3B2200" />
            </Svg>
            <Text style={styles.socialLabel}>
              login with <Text style={styles.socialBold}>facebook</Text>
            </Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => setProvider('google')} style={[styles.social, styles.google]}>
            <Text style={styles.googleG}>
              <Text style={{ color: '#4285F4' }}>G</Text>
            </Text>
            <Text style={[styles.socialLabel, styles.googleLabel]}>Sign in with Google</Text>
          </Pressable>
          <Text style={styles.demoNote}>Demo version: signing in is pretend, nothing is sent anywhere.</Text>
        </View>
      ) : (
        <Panel style={styles.namePanel}>
          <Title size={24}>{provider === 'facebook' ? 'FACEBOOK' : 'GOOGLE'} (DEMO)</Title>
          <Text style={styles.tutorialText}>What name should your friends see?</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.nameInput}
            placeholder="Your name"
            placeholderTextColor="#888"
            maxLength={24}
            autoFocus
          />
          <ComicButton label="CONTINUE" onPress={go} disabled={!name.trim()} />
          <ComicButton label="CANCEL" color="yellow" small onPress={() => setProvider(null)} />
        </Panel>
      )}
    </Screen>
  );
}

export function MainMenu() {
  const nav = useNav();
  return (
    <Screen>
      <View style={styles.menuTop}>
        <Pressable accessibilityRole="button" accessibilityLabel="Settings" onPress={() => nav.push({ name: 'settings' })} hitSlop={10}>
          <Gear />
        </Pressable>
      </View>
      <Image source={art.logo} style={styles.logoMenu} resizeMode="contain" accessibilityLabel="Pass The Lighter" />
      <View style={styles.menuButtons}>
        <ComicButton label="PLAY" sound="flick" onPress={() => nav.push({ name: 'games' })} />
        <ComicButton label="FRIENDS" color="yellow" onPress={() => nav.push({ name: 'friends' })} />
        <ComicButton label="HOW TO PLAY" color="yellow" onPress={() => nav.push({ name: 'tutorial', fromMenu: true })} />
      </View>
    </Screen>
  );
}

function Gear() {
  const teeth = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4;
    const x = 26 + Math.cos(a) * 19;
    const y = 26 + Math.sin(a) * 19;
    return <Circle key={i} cx={x} cy={y} r={6.5} fill={colors.yellow} />;
  });
  return (
    <Svg width={52} height={52}>
      {teeth}
      <Circle cx={26} cy={26} r={18} fill={colors.yellow} />
      <Circle cx={26} cy={26} r={7} fill={colors.teal} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingTop: 30,
  },
  logo: {
    width: '100%',
    height: 260,
  },
  bar: {
    width: '92%',
    height: 52,
    borderRadius: 26,
    borderWidth: 4,
    borderColor: colors.white,
    backgroundColor: 'rgba(0,0,0,0.3)',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  barFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  barLabel: {
    textAlign: 'center',
    fontFamily: fonts.comic,
    fontSize: 30,
    color: colors.yellow,
    marginTop: 4,
    ...comicShadow,
  },
  hand: {
    width: 260,
    height: 230,
    marginTop: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
  tutorialArt: {
    width: '100%',
    height: 200,
  },
  tutorialPanel: {
    gap: 12,
  },
  tutorialText: {
    fontFamily: fonts.body,
    fontSize: 19,
    lineHeight: 26,
    color: colors.white,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dotOn: {
    backgroundColor: colors.yellow,
    width: 28,
  },
  logoLogin: {
    width: '100%',
    height: 280,
    marginTop: 30,
  },
  loginButtons: {
    gap: 22,
    marginTop: 30,
  },
  social: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  facebook: {
    backgroundColor: '#3B4E8C',
    borderBottomWidth: 5,
    borderBottomColor: '#26346A',
  },
  google: {
    backgroundColor: colors.white,
    borderBottomWidth: 5,
    borderBottomColor: '#C9C9C9',
  },
  socialLabel: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 24,
    color: colors.white,
  },
  socialBold: {
    fontFamily: fonts.bold,
  },
  googleG: {
    width: 44,
    textAlign: 'center',
    fontFamily: fonts.bold,
    fontSize: 38,
  },
  googleLabel: {
    color: '#555',
  },
  demoNote: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
  },
  namePanel: {
    gap: 14,
    marginTop: 24,
  },
  nameInput: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 20,
    color: colors.bubbleText,
  },
  menuTop: {
    alignItems: 'flex-end',
  },
  logoMenu: {
    width: '100%',
    height: 270,
    marginTop: -20,
  },
  menuButtons: {
    gap: 18,
    paddingHorizontal: 24,
    marginTop: 10,
  },
});
