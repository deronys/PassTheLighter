// Keeps the demo server's state, saves it on the phone, moves the bots every
// second and gives the screens one set of actions. A real online backend would
// sit behind the same actions.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, type ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { setMuted } from '../feedback';
import { type DemoState, type Settings, firstName, newDemo, newlyPassedToYou, nextId, signIn, tick } from './demo';
import { type Game, type User, addComment, toggleReaction, burn, castVotes, createGame, passAndAsk, removeFor, respond, sendChat, startGame } from './rules';

// v2 started everyone's demo over (John asked for fresh test games in v0.10.0).
const KEY = 'ptl.demo.v2';

type Store = {
  ready: boolean;
  state: DemoState;
  now: number;
  me: User;
  user: (id: string) => User;
  game: (id: string) => Game;
  // A banner like a push notification, such as "Dimitris passed you the lighter!".
  toast: { text: string; gameId: string } | null;
  dismissToast: () => void;
  signIn: (name: string) => void;
  signOut: () => void;
  finishTutorial: () => void;
  setSettings: (settings: Settings) => void;
  resetDemo: () => void;
  create: (name: string, invited: string[]) => string;
  respond: (gameId: string, accept: boolean) => void;
  start: (gameId: string) => void;
  pass: (gameId: string, to: string, question: string) => void;
  burn: (gameId: string, passIndex: number) => void;
  remove: (gameId: string) => void;
  chat: (gameId: string, text: string) => void;
  // Marks a game's chat as read.
  seeChat: (gameId: string) => void;
  comment: (gameId: string, passIndex: number, text: string) => void;
  vote: (gameId: string, picks: Record<string, string>) => void;
  // The cropped photo, and the full picture it was cut from.
  setPhoto: (photo: string | undefined, source?: string) => void;
  react: (gameId: string, passIndex: number, emoji: string) => void;
  seeEnd: (gameId: string) => void;
};

const Context = createContext<Store | null>(null);

// Saved games from older versions get the fields added since.
function upgrade(saved: Partial<DemoState>): DemoState {
  const base = newDemo();
  const empty = { chat: [], comments: [], reactions: [], categories: [], votes: {} };
  return { ...base, ...saved, games: (saved.games ?? []).map((g) => ({ ...empty, ...g })) };
}

const UNKNOWN: User = { id: '?', name: 'Someone', color: '#666666' };

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(newDemo);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [toast, setToast] = useState<Store['toast']>(null);
  const latest = useRef(state);
  latest.current = state;

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) setState(upgrade(JSON.parse(raw)));
      })
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => undefined);
    setMuted(!state.settings.sound);
  }, [state, ready]);

  // The bots' clock. It checks often so a bot moves right on time, but only
  // redraws the countdowns once a second.
  useEffect(() => {
    if (!ready) return;
    let second = 0;
    const timer = setInterval(() => {
      const t = Date.now();
      if (Math.floor(t / 1000) !== second) {
        second = Math.floor(t / 1000);
        setNow(t);
      }
      const before = latest.current;
      const after = tick(before, t);
      if (after !== before) {
        const passed = newlyPassedToYou(before, after);
        if (passed.length && after.settings.notifications) {
          const g = passed[0];
          const from = after.friends.find((f) => f.id === g.passes[g.passes.length - 1].from);
          setToast({ text: `${from ? firstName(from) : 'Someone'} passed you the lighter in ${g.name}!`, gameId: g.id });
        }
        setState(after);
      }
    }, 100);
    return () => clearInterval(timer);
  }, [ready]);

  const store = useMemo<Store>(() => {
    const update = (fn: (s: DemoState) => DemoState) => setState((s) => fn(s));
    // A move the rules refuse (a double tap, a game that just ended) leaves the
    // game as it was instead of crashing the app.
    const onGame = (id: string, fn: (g: Game, me: string) => Game) =>
      update((s) => ({
        ...s,
        games: s.games.map((g) => {
          if (g.id !== id) return g;
          try {
            return fn(g, s.me!.id);
          } catch {
            return g;
          }
        }),
      }));
    const me = state.me ?? UNKNOWN;
    return {
      ready,
      state,
      now,
      me,
      user: (id) => (id === me.id ? me : state.friends.find((f) => f.id === id) ?? UNKNOWN),
      game: (id) => state.games.find((g) => g.id === id)!,
      toast,
      dismissToast: () => setToast(null),
      signIn: (name) => update((s) => signIn(s, name, Date.now())),
      signOut: () => update((s) => ({ ...newDemo(), seenTutorial: s.seenTutorial, settings: s.settings })),
      finishTutorial: () => update((s) => ({ ...s, seenTutorial: true })),
      setSettings: (settings) => update((s) => ({ ...s, settings })),
      resetDemo: () => setState(newDemo()),
      create: (name, invited) => {
        const [id] = nextId(latest.current);
        update((s) => {
          const [gid, next] = nextId(s);
          return { ...next, games: [createGame(gid, name, s.me!.id, invited, Date.now()), ...next.games] };
        });
        return id;
      },
      respond: (id, accept) => onGame(id, (g, u) => respond(g, u, accept, Date.now())),
      start: (id) => onGame(id, (g, u) => startGame(g, u, Date.now())),
      pass: (id, to, question) => onGame(id, (g, u) => passAndAsk(g, u, to, question, Date.now())),
      burn: (id, index) => onGame(id, (g, u) => burn(g, index, u)),
      remove: (id) => onGame(id, (g, u) => removeFor(g, u, Date.now())),
      chat: (id, text) => onGame(id, (g, u) => sendChat(g, u, text, Date.now())),
      seeChat: (id) =>
        update((s) => {
          const n = s.games.find((g) => g.id === id)?.chat.length ?? 0;
          return s.chatSeen[id] === n ? s : { ...s, chatSeen: { ...s.chatSeen, [id]: n } };
        }),
      comment: (id, index, text) => onGame(id, (g, u) => addComment(g, u, index, text, Date.now())),
      vote: (id, picks) => onGame(id, (g, u) => castVotes(g, u, picks)),
      setPhoto: (photo, source) =>
        update((s) => (s.me ? { ...s, me: { ...s.me, photo }, photoSource: photo ? (source ?? s.photoSource) : undefined } : s)),
      react: (id, index, emoji) => onGame(id, (g, u) => toggleReaction(g, u, index, emoji)),
      seeEnd: (id) => update((s) => (s.endSeen[id] ? s : { ...s, endSeen: { ...s.endSeen, [id]: true } })),
    };
  }, [state, ready, now, toast]);

  return <Context.Provider value={store}>{children}</Context.Provider>;
}

export function useStore(): Store {
  const store = useContext(Context);
  if (!store) throw new Error('useStore outside StoreProvider');
  return store;
}
