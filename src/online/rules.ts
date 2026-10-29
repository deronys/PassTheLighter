// The rules of the online game, as pure functions over plain data, so the same
// code can run on a phone, in the demo server or on a real server later.
//
// A game: the host invites friends. Once enough accept, the host starts it and
// holds the lighter first. Whoever holds the lighter passes it to a friend and
// asks them a question. Picking that friend is also the answer to the question
// the holder was asked. The receiver sees the question asked to them, but not
// the one they were the answer to; they can burn it (by watching an ad) to
// find out why they got the lighter. The game ends when someone gets the
// lighter for the last time (3 times, or up to 6 if the host chose so): every
// question is revealed, players comment on them and vote in 5 award
// categories, and the most voted player is champion.

import { VOTE_CATEGORY_IDS } from '../data/awards.ts';

export const MIN_PLAYERS = 4;
export const MAX_PLAYERS = 12;
// The game ends when someone gets the lighter this many times. The host can
// pick anything from 3 to 6 when creating the game.
export const LIGHTERS_TO_END = 3;
export const MIN_LIGHTERS_TO_END = 3;
export const MAX_LIGHTERS_TO_END = 6;
// Award categories voted on at the end of each game.
export const CATEGORIES_PER_GAME = 5;
// How long invitations stay open in the waiting room.
export const INVITE_WINDOW_MS = 2 * 60 * 1000;
// Longest question, chat message and comment a player can write.
export const MAX_QUESTION = 140;
export const MAX_CHAT = 200;
export const MAX_COMMENT = 140;

export type User = {
  id: string;
  name: string;
  color: string;
  // A profile picture as a URI (a small JPEG data URI in the demo).
  photo?: string;
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

export type ChatMessage = {
  from: string;
  text: string;
  at: number;
};

// A comment on a revealed pass, once the game is over.
export type Comment = {
  from: string;
  passIndex: number;
  text: string;
  at: number;
};

// An emoji reaction on a revealed move, once the game is over.
export type Reaction = {
  from: string;
  passIndex: number;
  emoji: string;
};

// The quick reactions under each round, and the extra ones behind the + button.
export const REACTIONS = ['😂', '😱', '🔥', '🙈', '💀', '❤️'];
export const MORE_REACTIONS = [
  '🤣', '😅', '😏', '😳', '🥵', '🥶', '🤯', '😬', '🤔', '🧐', '😇', '😈',
  '🤡', '👀', '🤭', '🫢', '😮', '😍', '🥰', '😘', '😢', '😭', '😤', '😡',
  '🤬', '🤮', '🤐', '🫣', '🙄', '😴', '👏', '🙌', '👍', '👎', '💯', '🎯',
  '🍆', '🍑', '🌶️', '💋', '💔', '🫶', '🎉', '🍻', '🤷', '🐍', '🐔', '🚩',
];

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
  // The game's chat, open in every phase.
  chat: ChatMessage[];
  // When the game ended, and what happens after: comments and award votes.
  endedAt?: number;
  comments: Comment[];
  reactions: Reaction[];
  // The award categories to vote on, picked when the game ends.
  categories: string[];
  // voter -> category -> who they voted for.
  votes: Record<string, Record<string, string>>;
  // How many lighters end this game. Older saved games have none: they use 3.
  lightersToEnd?: number;
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

export function createGame(id: string, name: string, host: string, invited: string[], now: number, ending = LIGHTERS_TO_END): Game {
  const unique = [...new Set(invited.filter((u) => u !== host))];
  if (unique.length + 1 > MAX_PLAYERS) throw new Error(`At most ${MAX_PLAYERS} players`);
  if (!Number.isInteger(ending) || ending < MIN_LIGHTERS_TO_END || ending > MAX_LIGHTERS_TO_END) {
    throw new Error(`The game ends after ${MIN_LIGHTERS_TO_END} to ${MAX_LIGHTERS_TO_END} lighters`);
  }
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
    lightersToEnd: ending,
    chat: [],
    comments: [],
    reactions: [],
    categories: [],
    votes: {},
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
  // The pass that gives someone their last lighter ends the game, so it carries no question.
  const text = isFinalPass(game, to) ? '' : question.trim();
  if (!text && !isFinalPass(game, to)) throw new Error('Write a question first');
  if (text.length > MAX_QUESTION) throw new Error('That question is too long');
  const next = { ...game, holder: to, passes: [...game.passes, { from, to, question: text, at: now }], lastMoveAt: now };
  return receives(next)[to] >= lightersToEnd(game) ? finish(next, now) : next;
}

// Whether passing to this player gives them their last lighter and ends the game.
export const isFinalPass = (game: Game, to: string) => (receives(game)[to] ?? 0) + 1 >= lightersToEnd(game);

// How many lighters end this game.
export const lightersToEnd = (game: Game) => game.lightersToEnd ?? LIGHTERS_TO_END;

// 3 -> '3rd', 4 -> '4th': for "Claire's 4th lighter".
export const ordinal = (n: number) => `${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'}`;

// Ends the game: every question is revealed and voting opens.
function finish(game: Game, now: number): Game {
  return { ...game, status: 'finished', holder: null, endedAt: now, lastMoveAt: now, categories: pickCategories(game.id, VOTE_CATEGORY_IDS) };
}

// Who got the lighter for the last time, if the game ended that way.
export function lastHolder(game: Game): string | undefined {
  const last = lastPass(game);
  return game.status === 'finished' && last && receives(game)[last.to] >= lightersToEnd(game) ? last.to : undefined;
}

// The same categories for every player in a game: a shuffle seeded by the game id.
export function pickCategories(seed: string, ids: string[], count = CATEGORIES_PER_GAME): string[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const random = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    return (h % 100000) / 100000;
  };
  const pool = [...ids];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

export const lastPass = (game: Game): Pass | undefined => game.passes[game.passes.length - 1];

export function roleOf(game: Game, user: string): Role {
  if (game.status === 'finished') return 'finished';
  const seat = game.seats.find((s) => s.userId === user);
  if (game.status === 'waiting') return seat?.status === 'invited' ? 'invited' : 'waiting';
  if (game.holder === user) return game.passes.length === 0 ? 'starter' : 'holder';
  if (lastPass(game)?.from === user) return 'lastPasser';
  return 'watcher';
}

// You see a question if you asked it, it was asked to you, or you burned it.
// When the game is over, everything is revealed.
export function canSee(game: Game, passIndex: number, user: string): boolean {
  const pass = game.passes[passIndex];
  if (!pass) return false;
  return game.status === 'finished' || pass.from === user || pass.to === user || (game.burned[user] ?? []).includes(passIndex);
}

// The question the holder was the answer to: the one asked before the pass
// that gave them the lighter. The host's first pass answers nothing.
export function reasonIndex(game: Game, passIndex: number): number | undefined {
  return passIndex >= 1 ? passIndex - 1 : undefined;
}

// You can only burn a question that got you the lighter: the one asked to the
// player who then passed it to you. Other players' secrets stay hidden until
// the end.
export function canBurn(game: Game, passIndex: number, user: string): boolean {
  return !!game.passes[passIndex] && game.passes[passIndex + 1]?.to === user && !canSee(game, passIndex, user);
}

export function burn(game: Game, passIndex: number, user: string): Game {
  if (!game.passes[passIndex]) throw new Error('No such question');
  if (canSee(game, passIndex, user)) return game;
  if (!canBurn(game, passIndex, user)) throw new Error('You can only burn the question that got you the lighter');
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
  return finish(game, now);
}

const isPlayer = (game: Game, user: string) => players(game).includes(user);

export function sendChat(game: Game, from: string, text: string, now: number): Game {
  const t = text.trim();
  if (!t) return game;
  if (!isPlayer(game, from)) throw new Error('Only players can chat');
  if (t.length > MAX_CHAT) throw new Error('That message is too long');
  return { ...game, chat: [...game.chat, { from, text: t, at: now }] };
}

export function addComment(game: Game, from: string, passIndex: number, text: string, now: number): Game {
  const t = text.trim();
  if (game.status !== 'finished') throw new Error('Comments open when the game is over');
  if (!game.passes[passIndex]?.question) throw new Error('No such question');
  if (!isPlayer(game, from)) throw new Error('Only players can comment');
  if (t.length > MAX_COMMENT) throw new Error('That comment is too long');
  if (!t) return game;
  return { ...game, comments: [...game.comments, { from, passIndex, text: t, at: now }] };
}

// Tapping an emoji adds your reaction to a move; tapping it again takes it back.
export function toggleReaction(game: Game, from: string, passIndex: number, emoji: string): Game {
  if (game.status !== 'finished') throw new Error('Reactions open when the game is over');
  if (!game.passes[passIndex]?.question) throw new Error('No such question');
  if (!REACTIONS.includes(emoji) && !MORE_REACTIONS.includes(emoji)) throw new Error('No such reaction');
  if (!isPlayer(game, from)) throw new Error('Only players can react');
  const mine = (r: Reaction) => r.from === from && r.passIndex === passIndex && r.emoji === emoji;
  return game.reactions.some(mine)
    ? { ...game, reactions: game.reactions.filter((r) => !mine(r)) }
    : { ...game, reactions: [...game.reactions, { from, passIndex, emoji }] };
}

// One vote per category. Nobody can vote for themselves.
export function castVotes(game: Game, voter: string, picks: Record<string, string>): Game {
  if (game.status !== 'finished') throw new Error('Voting opens when the game is over');
  if (!isPlayer(game, voter)) throw new Error('Only players can vote');
  if (game.votes[voter]) throw new Error('You have already voted');
  for (const c of game.categories) {
    const pick = picks[c];
    if (!pick) throw new Error('Vote in every category');
    if (pick === voter) throw new Error("You can't vote for yourself");
    if (!isPlayer(game, pick)) throw new Error('That player is not in the game');
  }
  return { ...game, votes: { ...game.votes, [voter]: Object.fromEntries(game.categories.map((c) => [c, picks[c]])) } };
}

export const everyoneVoted = (game: Game) => players(game).every((p) => game.votes[p]);

export type Results = {
  // category -> player -> votes
  byCategory: Record<string, Record<string, number>>;
  // category -> winners (ties share it)
  winners: Record<string, string[]>;
  // player -> votes over all categories
  totals: Record<string, number>;
  // The Lighter Champion: most votes in total, even without winning a category. Ties share it.
  champions: string[];
};

export function results(game: Game): Results {
  const byCategory: Results['byCategory'] = {};
  const totals: Results['totals'] = Object.fromEntries(players(game).map((p) => [p, 0]));
  for (const c of game.categories) byCategory[c] = {};
  for (const picks of Object.values(game.votes)) {
    for (const c of game.categories) {
      const p = picks[c];
      if (!p) continue;
      byCategory[c][p] = (byCategory[c][p] ?? 0) + 1;
      totals[p] = (totals[p] ?? 0) + 1;
    }
  }
  const top = (counts: Record<string, number>) => {
    const max = Math.max(0, ...Object.values(counts));
    return max === 0 ? [] : Object.keys(counts).filter((p) => counts[p] === max);
  };
  const winners = Object.fromEntries(game.categories.map((c) => [c, top(byCategory[c])]));
  return { byCategory, winners, totals, champions: top(totals) };
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
