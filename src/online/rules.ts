// The rules of the online game, as pure functions over plain data, so the same
// code can run on a phone, in the demo server or on a real server later.
//
// A game: the host invites friends. Once enough accept, the host starts it and
// holds the lighter first. Whoever holds the lighter passes it to a friend and
// asks them a question. Picking that friend is also the answer to the question
// the holder was asked. The receiver sees the question asked to them, but not
// the one they were the answer to; they can burn it (by watching an ad) to
// find out why they got the lighter.

export const MIN_PLAYERS = 4;
export const MAX_PLAYERS = 12;
// How long invitations stay open in the waiting room.
export const INVITE_WINDOW_MS = 2 * 60 * 1000;
// The last passer can take the lighter back if the receiver hasn't played for this long.
export const TAKE_BACK_AFTER_MS = 60 * 60 * 1000;

export type User = {
  id: string;
  name: string;
  color: string;
};

export type InviteStatus = 'invited' | 'accepted' | 'declined';

export type Seat = {
  userId: string;
  status: InviteStatus;
};

export type Pass = {
  from: string;
  to: string;
  // Asked by `from` to `to`. `to` answers it by passing the lighter on.
  question: string;
  at: number;
};

export type GameStatus = 'waiting' | 'active' | 'finished';

export type Game = {
  id: string;
  name: string;
  hostId: string;
  createdAt: number;
  // When the invitations close.
  startsAt: number;
  status: GameStatus;
  seats: Seat[];
  // Who holds the lighter, once the game has started.
  holder: string | null;
  passes: Pass[];
  // Pass indexes whose question each user has burned to reveal.
  burned: Record<string, number[]>;
  lastMoveAt: number;
  // Users who removed the game from their list.
  hiddenFor: string[];
};

// What a user sees when they open a game.
export type Role =
  | 'invited' // 07b: answer the invitation
  | 'waiting' // 07: waiting room
  | 'starter' // 08: the host's first move
  | 'holder' // 10: you have the lighter
  | 'lastPasser' // 10b: you passed it last
  | 'watcher' // 10a: everyone else
  | 'finished';

export function createGame(id: string, name: string, host: string, invited: string[], now: number): Game {
  const unique = [...new Set(invited.filter((u) => u !== host))];
  if (unique.length + 1 > MAX_PLAYERS) throw new Error(`At most ${MAX_PLAYERS} players`);
  return {
    id,
    name,
    hostId: host,
    createdAt: now,
    startsAt: now + INVITE_WINDOW_MS,
    status: 'waiting',
    seats: [{ userId: host, status: 'accepted' }, ...unique.map((userId) => ({ userId, status: 'invited' as const }))],
    holder: null,
    passes: [],
    burned: {},
    lastMoveAt: now,
    hiddenFor: [],
  };
}

export function respond(game: Game, user: string, accept: boolean, now: number): Game {
  if (game.status !== 'waiting') throw new Error('The game has already started');
  const seat = game.seats.find((s) => s.userId === user);
  if (!seat || seat.status !== 'invited') throw new Error('No open invitation');
  return {
    ...game,
    seats: game.seats.map((s) => (s.userId === user ? { ...s, status: accept ? 'accepted' : 'declined' } : s)),
    hiddenFor: accept ? game.hiddenFor : [...game.hiddenFor, user],
    lastMoveAt: now,
  };
}

export const players = (game: Game) => game.seats.filter((s) => s.status === 'accepted').map((s) => s.userId);

export const canStart = (game: Game) => game.status === 'waiting' && players(game).length >= MIN_PLAYERS;

export function startGame(game: Game, user: string, now: number): Game {
  if (user !== game.hostId) throw new Error('Only the host can start the game');
  if (!canStart(game)) throw new Error(`At least ${MIN_PLAYERS} players must accept`);
  return {
    ...game,
    status: 'active',
    // Anyone who didn't answer in time is out.
    seats: game.seats.filter((s) => s.status === 'accepted'),
    holder: game.hostId,
    lastMoveAt: now,
  };
}

// Pass the lighter and ask the receiver a question.
export function passAndAsk(game: Game, from: string, to: string, question: string, now: number): Game {
  if (game.status !== 'active') throw new Error('The game is not running');
  if (game.holder !== from) throw new Error('Only the holder can pass the lighter');
  if (to === from) throw new Error("You can't pass the lighter to yourself");
  if (!players(game).includes(to)) throw new Error('That player is not in the game');
  const text = question.trim();
  if (!text) throw new Error('Write a question first');
  return {
    ...game,
    holder: to,
    passes: [...game.passes, { from, to, question: text, at: now }],
    lastMoveAt: now,
  };
}

export const lastPass = (game: Game): Pass | undefined => game.passes[game.passes.length - 1];

// When the last passer may take the lighter back, or undefined if they never can.
export function takeBackAt(game: Game, user: string, after = TAKE_BACK_AFTER_MS): number | undefined {
  const last = lastPass(game);
  if (game.status !== 'active' || !last || last.from !== user || game.holder !== last.to) return undefined;
  return last.at + after;
}

export function canTakeBack(game: Game, user: string, now: number, after = TAKE_BACK_AFTER_MS): boolean {
  const at = takeBackAt(game, user, after);
  return at !== undefined && now >= at;
}

// The receiver didn't play for a long time: the last passer takes the lighter back.
export function takeBack(game: Game, user: string, now: number, after = TAKE_BACK_AFTER_MS): Game {
  if (!canTakeBack(game, user, now, after)) throw new Error("You can't take the lighter back yet");
  return { ...game, holder: user, passes: game.passes.slice(0, -1), lastMoveAt: now };
}

export function roleOf(game: Game, user: string): Role {
  if (game.status === 'finished') return 'finished';
  const seat = game.seats.find((s) => s.userId === user);
  if (game.status === 'waiting') return seat?.status === 'invited' ? 'invited' : 'waiting';
  if (game.holder === user) return game.passes.length === 0 ? 'starter' : 'holder';
  if (lastPass(game)?.from === user) return 'lastPasser';
  return 'watcher';
}

// You see a question if you asked it, it was asked to you, or you burned it.
export function canSee(game: Game, passIndex: number, user: string): boolean {
  const pass = game.passes[passIndex];
  if (!pass) return false;
  return pass.from === user || pass.to === user || (game.burned[user] ?? []).includes(passIndex);
}

// The question the holder was the answer to: the one asked before the pass
// that gave them the lighter. The host's first pass answers nothing.
export function reasonIndex(game: Game, passIndex: number): number | undefined {
  return passIndex >= 1 ? passIndex - 1 : undefined;
}

export function burn(game: Game, passIndex: number, user: string): Game {
  if (!game.passes[passIndex]) throw new Error('No such question');
  if (canSee(game, passIndex, user)) return game;
  return { ...game, burned: { ...game.burned, [user]: [...(game.burned[user] ?? []), passIndex] } };
}

// How many times each player has had the lighter (the host's start counts).
export function receives(game: Game): Record<string, number> {
  const counts: Record<string, number> = Object.fromEntries(players(game).map((p) => [p, 0]));
  if (game.status !== 'waiting') counts[game.hostId] = (counts[game.hostId] ?? 0) + 1;
  for (const p of game.passes) counts[p.to] = (counts[p.to] ?? 0) + 1;
  return counts;
}

export function endGame(game: Game, user: string, now: number): Game {
  if (user !== game.hostId) throw new Error('Only the host can end the game');
  return { ...game, status: 'finished', holder: null, lastMoveAt: now };
}

// Removing a game from your list. The host's X ends the game for everyone.
export function removeFor(game: Game, user: string, now: number): Game {
  const ended = user === game.hostId && game.status !== 'finished' ? endGame(game, user, now) : game;
  return { ...ended, hiddenFor: [...new Set([...ended.hiddenFor, user])] };
}

export const visibleTo = (games: Game[], user: string) =>
  games
    .filter((g) => g.seats.some((s) => s.userId === user && s.status !== 'declined') && !g.hiddenFor.includes(user))
    .sort((a, b) => b.lastMoveAt - a.lastMoveAt);
