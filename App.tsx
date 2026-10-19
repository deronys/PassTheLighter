import { LuckiestGuy_400Regular } from '@expo-google-fonts/luckiest-guy';
import { Nunito_600SemiBold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { GameHeader } from './src/components/GameHeader';
import { HistorySheet } from './src/components/HistorySheet';
import { PlayerBar } from './src/components/PlayerBar';
import { QUESTIONS } from './src/data/questions';
import { type Deck, draw, newDeck } from './src/deck';
import { setMuted } from './src/feedback';
import {
  type GameState,
  addComment,
  answerLast,
  beginTurn,
  beginVote,
  castVotes,
  finishCeremony,
  passLighter,
  react,
  showRecap,
  startGame,
  resumeState,
  startVoting,
  type Player,
} from './src/game';
import { type SavedGame, newSavedGame, removeGame, sortGames, upsertGame } from './src/games';
import { type Profile, recordGame } from './src/profiles';
import { awardResults, pickVotedCategories, playerStats } from './src/results';
import { CeremonyScreen } from './src/screens/CeremonyScreen';
import { FinalScreen } from './src/screens/FinalScreen';
import { GameOverScreen } from './src/screens/GameOverScreen';
import { HandoffScreen } from './src/screens/HandoffScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { NewGameScreen } from './src/screens/NewGameScreen';
import { ProfilesScreen } from './src/screens/ProfilesScreen';
import { RecapScreen } from './src/screens/RecapScreen';
import { TurnScreen } from './src/screens/TurnScreen';
import { VoteScreen } from './src/screens/VoteScreen';
import { loadGames, loadSaved, saveDeck, saveGames, saveMuted, saveProfiles } from './src/storage';
import { colors } from './src/theme';

const SUGGESTIONS_PER_TURN = 5;

export default function App() {
  const [fontsLoaded] = useFonts({ LuckiestGuy_400Regular, Nunito_600SemiBold, Nunito_800ExtraBold });
  const [loaded, setLoaded] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [games, setGames] = useState<SavedGame[]>([]);
  const [muted, setMutedState] = useState(false);
  const deck = useRef<Deck>(newDeck(QUESTIONS.length));

  const [view, setView] = useState<'home' | 'new' | 'profiles' | 'game'>('home');
  const [selected, setSelected] = useState<string[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    Promise.all([loadSaved(), loadGames()]).then(([saved, savedGames]) => {
      setProfiles(saved.profiles);
      setGames(sortGames(savedGames));
      deck.current = saved.deck;
      setMutedState(saved.muted);
      setMuted(saved.muted);
      setLoaded(true);
    });
  }, []);

  const current = games.find((g) => g.id === currentId) ?? null;

  const updateProfiles = (next: Profile[]) => {
    setProfiles(next);
    saveProfiles(next);
  };

  const storeGame = (game: SavedGame) => {
    setGames((list) => {
      const next = upsertGame(list, game);
      saveGames(next);
      return next;
    });
  };

  const setGame = (state: GameState, unlocked: string[][] | null = current?.unlocked ?? null) => {
    if (current) storeGame({ ...current, state, unlocked, updatedAt: Date.now() });
  };

  const drawSuggestions = () => {
    const result = draw(deck.current, SUGGESTIONS_PER_TURN, QUESTIONS.length);
    deck.current = result.deck;
    saveDeck(result.deck);
    setSuggestions(result.picks.map((i) => QUESTIONS[i]));
  };

  const start = (players: Player[]) => {
    const saved = newSavedGame(startGame(players, Math.floor(Math.random() * players.length)));
    storeGame(saved);
    setCurrentId(saved.id);
    setView('game');
  };

  const startWithProfiles = (ids: string[]) =>
    start(
      ids
        .map((id) => profiles.find((p) => p.id === id))
        .filter((p): p is Profile => p !== undefined)
        .map(({ id, name, avatar, color }) => ({ id, name, avatar, color })),
    );

  const open = (id: string) => {
    const game = games.find((g) => g.id === id);
    if (!game) return;
    const resumed = resumeState(game.state);
    if (resumed !== game.state) storeGame({ ...game, state: resumed });
    setCurrentId(id);
    setView('game');
  };

  const goHome = () => {
    setHistoryOpen(false);
    if (current) {
      const resumed = resumeState(current.state);
      if (resumed !== current.state) setGame(resumed);
    }
    setCurrentId(null);
    setView('home');
  };

  const toggleMute = () => {
    setMutedState(!muted);
    setMuted(!muted);
    saveMuted(!muted);
  };

  const vote = (state: GameState, picks: Record<string, number>) => {
    const next = castVotes(state, picks);
    if (next.phase !== 'ceremony') return setGame(next);
    const update = recordGame(profiles, next, playerStats(next), awardResults(next));
    updateProfiles(update.profiles);
    setGame(next, update.unlocked);
  };

  if (!fontsLoaded || !loaded) {
    return <View style={styles.loading} />;
  }

  let screen;
  if (view === 'profiles') {
    screen = <ProfilesScreen profiles={profiles} onBack={() => setView('home')} />;
  } else if (view === 'new') {
    screen = (
      <NewGameScreen
        profiles={profiles}
        selected={selected}
        onToggle={(id) => setSelected(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id])}
        onCreate={(profile) => {
          updateProfiles([...profiles, profile]);
          setSelected([...selected, profile.id]);
        }}
        onBack={() => setView('home')}
        onStart={() => startWithProfiles(selected)}
      />
    );
  } else if (view === 'home' || !current) {
    screen = (
      <HomeScreen
        games={games}
        muted={muted}
        onOpen={open}
        onDelete={(id) =>
          setGames((list) => {
            const next = removeGame(list, id);
            saveGames(next);
            return next;
          })
        }
        onNewGame={() => setView('new')}
        onProfiles={() => setView('profiles')}
        onMute={toggleMute}
      />
    );
  } else {
    const game = current.state;
    const bar = <PlayerBar state={game} />;
    const comment = (i: number, author: number, text: string) => setGame(addComment(game, i, author, text));
    const reactTo = (i: number, emoji: string) => setGame(react(game, i, emoji));
    let inner;

    switch (game.phase) {
      case 'handoff':
        inner = (
          <HandoffScreen
            player={game.players[game.holder]}
            lead={game.passes.length === 0 ? 'The lighter starts with' : 'Pass the lighter to'}
            top={bar}
            onReady={() => {
              drawSuggestions();
              setGame(beginTurn(game));
            }}
          />
        );
        break;
      case 'turn':
        inner = (
          <TurnScreen
            // A fresh key per turn clears the previous player's picks.
            key={`${current.id}-${game.passes.length}`}
            state={game}
            suggestions={suggestions}
            top={bar}
            onShuffle={drawSuggestions}
            onPass={(to, question) => setGame(passLighter(game, to, question))}
            onAnswerLast={(answer) => setGame(answerLast(game, answer))}
          />
        );
        break;
      case 'gameover':
        inner = <GameOverScreen state={game} onReveal={() => setGame(showRecap(game))} />;
        break;
      case 'recap':
        inner = (
          <RecapScreen
            state={game}
            onComment={comment}
            onReact={reactTo}
            onVote={() => setGame(startVoting(game, pickVotedCategories()))}
          />
        );
        break;
      case 'vote-handoff':
        inner = (
          <HandoffScreen
            player={game.players[game.voter]}
            lead={`Voter ${game.voter + 1} of ${game.players.length}`}
            onReady={() => setGame(beginVote(game))}
          />
        );
        break;
      case 'vote':
        inner = (
          <VoteScreen
            key={`${current.id}-${game.voter}`}
            state={game}
            onHistory={() => setHistoryOpen(true)}
            onSubmit={(picks) => vote(game, picks)}
          />
        );
        break;
      case 'ceremony':
        inner = (
          <CeremonyScreen state={game} results={awardResults(game)} onDone={() => setGame(finishCeremony(game))} />
        );
        break;
      case 'final':
        inner = (
          <FinalScreen
            state={game}
            results={awardResults(game)}
            stats={playerStats(game)}
            unlocked={current.unlocked ?? []}
            onComment={comment}
            onReact={reactTo}
            onPlayAgain={() => start(game.players)}
            onHome={goHome}
          />
        );
        break;
    }
    screen = (
      <View style={styles.fill}>
        <GameHeader state={game} onHome={goHome} onHistory={() => setHistoryOpen(true)} />
        {inner}
        <HistorySheet state={game} visible={historyOpen} onClose={() => setHistoryOpen(false)} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {screen}
        </KeyboardAvoidingView>
      </SafeAreaView>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.night,
  },
  safe: {
    flex: 1,
    backgroundColor: colors.night,
  },
  fill: {
    flex: 1,
  },
});
