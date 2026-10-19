// A small screen stack: each screen is a route, Back pops it.
import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';

export type Route =
  | { name: 'splash' }
  | { name: 'tutorial'; fromMenu?: boolean }
  | { name: 'login' }
  | { name: 'menu' }
  | { name: 'games' }
  | { name: 'invite' }
  | { name: 'game'; id: string }
  | { name: 'ask'; id: string; to: string }
  | { name: 'burn'; id: string; index: number; revealed?: boolean; missed?: boolean }
  | { name: 'progress'; id: string }
  | { name: 'ad'; id: string; index: number }
  | { name: 'settings' }
  | { name: 'friends' };

type Nav = {
  route: Route;
  push: (route: Route) => void;
  replace: (route: Route) => void;
  back: () => void;
  // Goes back and updates the screen you land on, e.g. after an ad.
  backWith: (patch: Record<string, unknown>) => void;
  reset: (...routes: Route[]) => void;
};

const Context = createContext<Nav | null>(null);

export function NavProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<Route[]>([{ name: 'splash' }]);
  const nav = useMemo<Nav>(
    () => ({
      route: stack[stack.length - 1],
      push: (route) => setStack((s) => [...s, route]),
      replace: (route) => setStack((s) => [...s.slice(0, -1), route]),
      back: () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
      backWith: (patch) =>
        setStack((s) => {
          const rest = s.slice(0, -1);
          return [...rest.slice(0, -1), { ...rest[rest.length - 1], ...patch } as Route];
        }),
      reset: (...routes) => setStack(routes),
    }),
    [stack],
  );
  return <Context.Provider value={nav}>{children}</Context.Provider>;
}

export function useNav(): Nav {
  const nav = useContext(Context);
  if (!nav) throw new Error('useNav outside NavProvider');
  return nav;
}
