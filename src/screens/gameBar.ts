import type { ComponentProps } from 'react';

import { useNav } from '../nav';
import { firstName } from '../online/demo';
import { type Game, receives } from '../online/rules';
import { useStore } from '../online/store';
import type { Screen } from '../ui/kit';

type Bar = Pick<ComponentProps<typeof Screen>, 'lighters' | 'onLighters' | 'onChat' | 'unread'>;

// How a player is named in game text: "You" for yourself, otherwise their first name.
export function useDisplayName(): (id: string) => string {
  const { me, user } = useStore();
  return (id) => (id === me.id ? 'You' : firstName(user(id)));
}

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
