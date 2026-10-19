// Keeps the demo server's state, saves it on the phone, moves the bots every
// second and gives the screens one set of actions. A real online backend would
// sit behind the same actions.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, type ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { setMuted } from '../feedback';
import { type DemoState, type Settings, firstName, newDemo, newlyPassedToYou, nextId, signIn, tick } from './demo';
import { type Game, type User, burn, createGame, passAndAsk, removeFor, respond, startGame } from './rules';

const KEY = 'ptl.demo.v1';

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
};

const Context = createContext<Store | null>(null);

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
        if (raw) setState({ ...newDemo(), ...JSON.parse(raw) });
      })
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => undefined);
    setMuted(!state.settings.sound);
  }, [state, ready]);

  // The bots' clock.
  useEffect(() => {
    if (!ready) return;
    const timer = setInterval(() => {
      const t = Date.now();
      setNow(t);
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
    }, 1000);
    return () => clearInterval(timer);
  }, [ready]);

  const store = useMemo<Store>(() => {
    const update = (fn: (s: DemoState) => DemoState) => setState((s) => fn(s));
    const onGame = (id: string, fn: (g: Game, me: string) => Game) =>
      update((s) => ({ ...s, games: s.games.map((g) => (g.id === id ? fn(g, s.me!.id) : g)) }));
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
    };
  }, [state, ready, now, toast]);

  return <Context.Provider value={store}>{children}</Context.Provider>;
}

export function useStore(): Store {
  const store = useContext(Context);
  if (!store) throw new Error('useStore outside StoreProvider');
  return store;
}
