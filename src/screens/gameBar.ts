import type { ComponentProps } from 'react';

import { useNav } from '../nav';
import { type Game, receives } from '../online/rules';
import { useStore } from '../online/store';
import type { Screen } from '../ui/kit';

type Bar = Pick<ComponentProps<typeof Screen>, 'lighters' | 'onLighters' | 'onChat' | 'unread'>;

// What every game screen shows around its content: your lighter count in the
// corner (tap for the full history) and the game's chat button.
export function useGameBar(game: Game | undefined): Bar {
  const nav = useNav();
  const { me, state } = useStore();
  if (!game) return {};
  return {
    lighters: receives(game)[me.id] ?? 0,
    onLighters: () => nav.push({ name: 'progress', id: game.id }),
    onChat: () => nav.push({ name: 'chat', id: game.id }),
    unread: Math.max(0, game.chat.length - (state.chatSeen[game.id] ?? 0)),
  };
}
