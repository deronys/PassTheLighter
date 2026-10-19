// The list of games kept on the phone, so several can be in progress at once.
import { type GameState, isFinished } from './game.ts';

export type SavedGame = {
  id: string;
  createdAt: number;
  updatedAt: number;
  state: GameState;
  // Achievements unlocked by each player, set once the votes are in.
  unlocked: string[][] | null;
};

// Finished games are kept for their recap, up to this many.
export const FINISHED_TO_KEEP = 20;

export function newSavedGame(state: GameState, now: number = Date.now()): SavedGame {
  return { id: `${now}-${Math.random().toString(36).slice(2, 8)}`, createdAt: now, updatedAt: now, state, unlocked: null };
}

// Puts the game in the list (replacing its older copy) and drops the oldest finished games.
export function upsertGame(games: SavedGame[], game: SavedGame): SavedGame[] {
  const others = games.filter((g) => g.id !== game.id);
  const sorted = sortGames([game, ...others]);
  let finished = 0;
  return sorted.filter((g) => !isFinished(g.state) || ++finished <= FINISHED_TO_KEEP);
}

export function removeGame(games: SavedGame[], id: string): SavedGame[] {
  return games.filter((g) => g.id !== id);
}

// Games in progress first, then finished ones; most recently played first in each.
export function sortGames(games: SavedGame[]): SavedGame[] {
  return [...games].sort(
    (a, b) => Number(isFinished(a.state)) - Number(isFinished(b.state)) || b.updatedAt - a.updatedAt,
  );
}
