import { Fredoka_500Medium } from '@expo-google-fonts/fredoka/500Medium';
import { Fredoka_600SemiBold } from '@expo-google-fonts/fredoka/600SemiBold';
import { LuckiestGuy_400Regular } from '@expo-google-fonts/luckiest-guy/400Regular';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { NavProvider, type Route, useNav } from './src/nav';
import { StoreProvider, useStore } from './src/online/store';
import { Chat } from './src/screens/Chat';
import { Comments, Results, Vote } from './src/screens/End';
import { Login, MainMenu, Splash, Tutorial } from './src/screens/Entry';
import { Friends, Settings } from './src/screens/Extras';
import { GameList, InviteFriends } from './src/screens/Lobby';
import { PhotoCrop } from './src/screens/PhotoCrop';
import { AskQuestion, GameScreen } from './src/screens/Play';
import { Advertisement, BurnQuestion, GameProgress } from './src/screens/Reveal';
import { colors, fonts } from './src/theme';

const TOAST_MS = 5000;

export default function App() {
  const [fontsLoaded] = useFonts({ LuckiestGuy_400Regular, Fredoka_500Medium, Fredoka_600SemiBold });
  return (
    <SafeAreaProvider>
      <View style={styles.fill}>
        {fontsLoaded && (
          <StoreProvider>
            <NavProvider>
              <Router />
              <Toast />
            </NavProvider>
          </StoreProvider>
        )}
      </View>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}

function Router() {
  const { route } = useNav();
  return <View style={styles.fill}>{render(route)}</View>;
}

function render(route: Route) {
  switch (route.name) {
    case 'splash':
      return <Splash />;
    case 'tutorial':
      return <Tutorial fromMenu={route.fromMenu} />;
    case 'login':
      return <Login />;
    case 'menu':
      return <MainMenu />;
    case 'games':
      return <GameList />;
    case 'invite':
      return <InviteFriends />;
    case 'game':
      return <GameScreen key={route.id} id={route.id} />;
    case 'ask':
      return <AskQuestion id={route.id} to={route.to} />;
    case 'burn':
      return <BurnQuestion id={route.id} index={route.index} revealed={route.revealed} missed={route.missed} />;
    case 'progress':
      return <GameProgress id={route.id} />;
    case 'ad':
      return <Advertisement id={route.id} index={route.index} />;
    case 'settings':
      return <Settings />;
    case 'friends':
      return <Friends />;
    case 'chat':
      return <Chat id={route.id} />;
    case 'comments':
      return <Comments id={route.id} index={route.index} />;
    case 'vote':
      return <Vote id={route.id} />;
    case 'results':
      return <Results id={route.id} />;
    case 'photo':
      return <PhotoCrop source={route.source} />;
  }
}

// Stands in for a push notification while the app is open.
function Toast() {
  const { toast, dismissToast } = useStore();
  const nav = useNav();
  const insets = useSafeAreaInsets();
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(dismissToast, TOAST_MS);
    return () => clearTimeout(timer);
    // The store hands out a new dismissToast every second; only a new toast restarts the timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);
  if (!toast || nav.route.name === 'ad') return null;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        dismissToast();
        nav.push({ name: 'game', id: toast.gameId });
      }}
      style={[styles.toast, { top: insets.top + 8 }]}
    >
      <Text style={styles.toastText}>🔥 {toast.text}</Text>
      <Text style={styles.toastOpen}>OPEN</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Clipped so nothing makes the whole page scroll on a phone browser; lists scroll inside their screens.
  fill: {
    flex: 1,
    backgroundColor: colors.teal,
    overflow: 'hidden',
  },
  toast: {
    position: 'absolute',
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(20,20,24,0.95)',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: colors.yellow,
  },
  toastText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.white,
  },
  toastOpen: {
    fontFamily: fonts.comic,
    fontSize: 18,
    color: colors.yellow,
  },
});
