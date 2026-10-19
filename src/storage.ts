// Everything the app keeps on the phone between games.
import AsyncStorage from '@react-native-async-storage/async-storage';

import { QUESTIONS } from './data/questions';
import { type Deck, newDeck } from './deck';
import type { SavedGame } from './games';
import type { Profile } from './profiles';

const KEYS = {
  profiles: 'ptl.profiles.v1',
  deck: 'ptl.deck.v1',
  muted: 'ptl.muted.v1',
};

async function read<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});
}

export type Saved = {
  profiles: Profile[];
  deck: Deck;
  muted: boolean;
};

export async function loadSaved(): Promise<Saved> {
  const [profiles, deck, muted] = await Promise.all([
    read<Profile[]>(KEYS.profiles, []),
    read<Deck>(KEYS.deck, newDeck(QUESTIONS.length)),
    read<boolean>(KEYS.muted, false),
  ]);
  return { profiles, deck, muted };
}

export const saveProfiles = (profiles: Profile[]) => write(KEYS.profiles, profiles);
export const saveDeck = (deck: Deck) => write(KEYS.deck, deck);
export const saveMuted = (muted: boolean) => write(KEYS.muted, muted);

const GAMES_KEY = 'ptl.games.v1';
export const loadGames = () => read<SavedGame[]>(GAMES_KEY, []);
export const saveGames = (games: SavedGame[]) => write(GAMES_KEY, games);
