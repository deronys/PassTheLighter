import { LuckiestGuy_400Regular } from '@expo-google-fonts/luckiest-guy';
import { Nunito_600SemiBold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

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
  startVoting,
} from './src/game';
import { type Profile, recordGame } from './src/profiles';
import { type AwardResult, type PlayerStats, awardResults, pickVotedCategories, playerStats } from './src/results';
import { CeremonyScreen } from './src/screens/CeremonyScreen';
import { FinalScreen } from './src/screens/FinalScreen';
import { GameOverScreen } from './src/screens/GameOverScreen';
import { HandoffScreen } from './src/screens/HandoffScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { ProfilesScreen } from './src/screens/ProfilesScreen';
import { RecapScreen } from './src/screens/RecapScreen';
import { TurnScreen } from './src/screens/TurnScreen';
import { VoteScreen } from './src/screens/VoteScreen';
import { loadSaved, saveDeck, saveMuted, saveProfiles } from './src/storage';
import { colors } from './src/theme';

const SUGGESTIONS_PER_TURN = 5;

type Outcome = {
  results: AwardResult[];
  stats: PlayerStats[];
  unlocked: string[][];
};

export default function App() {
  const [fontsLoaded] = useFonts({ LuckiestGuy_400Regular, Nunito_600SemiBold, Nunito_800ExtraBold });
  const [loaded, setLoaded] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [muted, setMutedState] = useState(false);
  const deck = useRef<Deck>(newDeck(QUESTIONS.length));

  const [view, setView] = useState<'home' | 'profiles' | 'game'>('home');
  const [selected, setSelected] = useState<string[]>([]);
  const [game, setGame] = useState<GameState | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    loadSaved().then((saved) => {
      setProfiles(saved.profiles);
      deck.current = saved.deck;
      setMutedState(saved.muted);
      setMuted(saved.muted);
      setLoaded(true);
    });
  }, []);

  const updateProfiles = (next: Profile[]) => {
    setProfiles(next);
    saveProfiles(next);
  };

  const drawSuggestions = () => {
    const result = draw(deck.current, SUGGESTIONS_PER_TURN, QUESTIONS.length);
    deck.current = result.deck;
    saveDeck(result.deck);
    setSuggestions(result.picks.map((i) => QUESTIONS[i]));
  };

  const start = (ids: string[]) => {
    const players = ids
      .map((id) => profiles.find((p) => p.id === id))
      .filter((p): p is Profile => p !== undefined)
      .map(({ id, name, avatar, color }) => ({ id, name, avatar, color }));
    setOutcome(null);
    setGame(startGame(players, Math.floor(Math.random() * players.length)));
    setView('game');
  };

  const toggleMute = () => {
    setMutedState(!muted);
    setMuted(!muted);
    saveMuted(!muted);
  };

  const vote = (state: GameState, picks: Record<string, number>) => {
    const next = castVotes(state, picks);
    if (next.phase === 'ceremony') {
      const results = awardResults(next);
      const stats = playerStats(next);
      const update = recordGame(profiles, next, stats, results);
      updateProfiles(update.profiles);
      setOutcome({ results, stats, unlocked: update.unlocked });
    }
    setGame(next);
  };

  if (!fontsLoaded || !loaded) {
    return <View style={styles.loading} />;
  }

  let screen;
  if (view === 'profiles') {
    screen = <ProfilesScreen profiles={profiles} onBack={() => setView('home')} />;
  } else if (view === 'home' || !game) {
    screen = (
      <HomeScreen
        profiles={profiles}
        selected={selected}
        muted={muted}
        onToggle={(id) => setSelected(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id])}
        onCreate={(profile) => {
          updateProfiles([...profiles, profile]);
          setSelected([...selected, profile.id]);
        }}
        onProfiles={() => setView('profiles')}
        onMute={toggleMute}
        onStart={() => start(selected)}
      />
    );
  } else {
    const bar = <PlayerBar state={game} onHistory={() => setHistoryOpen(true)} />;
    const comment = (i: number, author: number, text: string) => setGame(addComment(game, i, author, text));
    const reactTo = (i: number, emoji: string) => setGame(react(game, i, emoji));

    switch (game.phase) {
      case 'handoff':
        screen = (
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
        screen = (
          <TurnScreen
            // A fresh key per turn clears the previous player's picks.
            key={game.passes.length}
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
        screen = <GameOverScreen state={game} onReveal={() => setGame(showRecap(game))} />;
        break;
      case 'recap':
        screen = (
          <RecapScreen
            state={game}
            onComment={comment}
            onReact={reactTo}
            onVote={() => setGame(startVoting(game, pickVotedCategories()))}
          />
        );
        break;
      case 'vote-handoff':
        screen = (
          <HandoffScreen
            player={game.players[game.voter]}
            lead={`Voter ${game.voter + 1} of ${game.players.length}`}
            onReady={() => setGame(beginVote(game))}
          />
        );
        break;
      case 'vote':
        screen = <VoteScreen key={game.voter} state={game} onSubmit={(picks) => vote(game, picks)} />;
        break;
      case 'ceremony':
        screen = outcome && (
          <CeremonyScreen state={game} results={outcome.results} onDone={() => setGame(finishCeremony(game))} />
        );
        break;
      case 'final':
        screen = outcome && (
          <FinalScreen
            state={game}
            results={outcome.results}
            stats={playerStats(game)}
            unlocked={outcome.unlocked}
            onComment={comment}
            onReact={reactTo}
            onPlayAgain={() => start(game.players.map((p) => p.id))}
            onHome={() => {
              setGame(null);
              setView('home');
            }}
          />
        );
        break;
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {screen}
        </KeyboardAvoidingView>
        {game && <HistorySheet state={game} visible={historyOpen} onClose={() => setHistoryOpen(false)} />}
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
