// A pretend server for the demo: you play with computer-controlled friends who
// answer invitations and pass the lighter on their own after a few seconds.
// Everything is plain data plus a `tick` that moves the bots, so it can be
// tested and saved on the phone. A real server replaces this later.
import { VOTE_CATEGORY_IDS } from '../data/awards.ts';
import { DEMO_PHOTOS } from '../data/demoPhotos.ts';
import { QUESTIONS } from '../data/questions.ts';
import {
  type Game,
  type User,
  addComment,
  canStart,
  castVotes,
  createGame,
  everyoneVoted,
  passAndAsk,
  players,
  respond,
  results,
  sendChat,
  startGame,
  toggleReaction,
  REACTIONS,
  MORE_REACTIONS,
} from './rules.ts';

// manualBots is for development: bots only pass the lighter when you tap
// their "make them play" button, so you can look at each screen calmly.
export type Settings = { sound: boolean; notifications: boolean; manualBots: boolean };

export type DemoState = {
  me: User | null;
  friends: User[];
  games: Game[];
  seq: number;
  seenTutorial: boolean;
  settings: Settings;
  // How many chat messages you have seen in each game, for the unread count.
  chatSeen: Record<string, number>;
  // Games whose "game over" intro screen you have already seen.
  endSeen: Record<string, boolean>;
  // The full picture behind your profile photo, so you can crop it again later.
  photoSource?: string;
};

const COLORS = ['#E8452C', '#F2B705', '#2A9D8F', '#8E44AD', '#3A86FF', '#FF6F91', '#43AA8B', '#F3722C'];

export const DEMO_FRIENDS: User[] = [
  'Dimitris Papadopoulos',
  'Scarlet Jones',
  'Claire Danes',
  'Kristen Miller',
  'Shea Collins',
  'Maria Georgiou',
  'Nikos Alexiou',
  'Eleni Kosta',
  'Alex Turner',
  'Bella Rossi',
  'Giorgos Nikolaou',
  'Hannah Lee',
  'Katerina Pappa',
  'Leo Martin',
  'Sofia Ioannou',
  'Yannis Petrou',
].map((name, i) => ({ id: `f${i + 1}`, name, color: COLORS[i % COLORS.length], photo: DEMO_PHOTOS[`f${i + 1}`] }));

export const firstName = (user: Pick<User, 'name'>) => user.name.split(' ')[0];

// A stable pseudo-random number in [0, 1) for a key, so bots behave the same
// way on every tick and after a reload.
export function chance(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619);
  return ((h >>> 0) % 100000) / 100000;
}

const isBot = (state: DemoState, id: string) => id !== state.me?.id;

// When a bot answers an invitation, and whether it says yes.
const answerAt = (g: Game, bot: string) => g.createdAt + 1000 + chance(`${g.id}:${bot}:answer`) * 2000;
const accepts = (g: Game, bot: string) => chance(`${g.id}:${bot}:yes`) < 0.85;
// Bots pass the lighter a fixed time after the last move.
// John asked for exactly 10 seconds, to have time to look at every screen.
const BOT_MOVE_MS = 10_000;
const movesAt = (g: Game) => g.lastMoveAt + BOT_MOVE_MS;

export function newDemo(): DemoState {
  return { me: null, friends: DEMO_FRIENDS, games: [], seq: 1, seenTutorial: false, settings: { sound: true, notifications: true, manualBots: true }, chatSeen: {}, endSeen: {} };
}

// Signing in creates your profile and a few games so the demo isn't empty.
export function signIn(state: DemoState, name: string, now: number): DemoState {
  const me: User = { id: 'me', name, color: '#E8452C' };
  const [dimitris, scarlet, claire, kristen, shea] = DEMO_FRIENDS.map((f) => f.id);
  const q = (i: number) => QUESTIONS[i];
  const minute = 60 * 1000;

  // You hold the lighter: Dimitris passed it to you, because Claire asked him something.
  let friday = startGame(
    acceptAll(createGame('g1', 'Friday Quizzz', dimitris, [me.id, scarlet, claire, kristen], now - 50 * minute)),
    dimitris,
    now - 48 * minute,
  );
  friday = passAndAsk(friday, dimitris, scarlet, q(12), now - 46 * minute);
  friday = passAndAsk(friday, scarlet, me.id, q(40), now - 40 * minute);
  friday = passAndAsk(friday, me.id, claire, q(61), now - 30 * minute);
  friday = passAndAsk(friday, claire, dimitris, q(3), now - 20 * minute);
  friday = passAndAsk(friday, dimitris, me.id, q(88), now - 3 * minute);
  friday = sendChat(friday, claire, 'Who has the lighter now? 👀', now - 2 * minute);
  friday = sendChat(friday, dimitris, 'Not telling 😏', now - minute);

  // Claire invites you.
  const secrets = respond(
    respond(createGame('g2', 'Dirty Secrets', claire, [me.id, scarlet, kristen, shea, dimitris], now), scarlet, true, now),
    shea,
    false,
    now,
  );

  // Someone else has the lighter; the bots keep it moving.
  let late = startGame(acceptAll(createGame('g3', 'Late Night Truths', kristen, [me.id, shea, scarlet, dimitris], now - 9 * minute)), kristen, now - 8 * minute);
  late = passAndAsk(late, kristen, me.id, q(150), now - 7 * minute);
  late = passAndAsk(late, me.id, shea, q(23), now - 5 * minute);
  late = passAndAsk(late, shea, scarlet, q(101), now);

  // A game that just ended, so the reveal, comments and voting can be tried right away.
  let weekend = startGame(acceptAll(createGame('g4', 'Weekend Vibes', me.id, [scarlet, claire, kristen, shea], now - 30 * minute)), me.id, now - 29 * minute);
  const moves: [string, string, number][] = [
    [me.id, claire, 7],
    [claire, kristen, 45],
    [kristen, me.id, 66],
    [me.id, scarlet, 120],
    [scarlet, claire, 9],
    [claire, shea, 140],
    [shea, me.id, 33],
  ];
  moves.forEach(([from, to, qi], i) => (weekend = passAndAsk(weekend, from, to, q(qi), now - (25 - i * 3) * minute)));
  weekend = sendChat(weekend, kristen, 'That last one was brutal 😂', now - 2 * minute);

  return { ...state, me, games: [friday, { ...secrets, startsAt: now + 2 * minute }, late, weekend], seq: 5 };
}

function acceptAll(game: Game): Game {
  return { ...game, seats: game.seats.map((s) => ({ ...s, status: 'accepted' })) };
}

export function nextId(state: DemoState): [string, DemoState] {
  return [`g${state.seq}`, { ...state, seq: state.seq + 1 }];
}

// Moves every bot whose turn has come. Returns the same object when nothing changed.
export function tick(state: DemoState, now: number): DemoState {
  if (!state.me) return state;
  let changed = false;
  const games = state.games.map((game) => {
    let g = game;
    if (g.status === 'waiting') {
      for (const seat of g.seats) {
        if (seat.status === 'invited' && isBot(state, seat.userId) && now >= answerAt(g, seat.userId)) {
          g = respond(g, seat.userId, accepts(g, seat.userId), now);
        }
      }
      // A bot host starts once everyone has answered (or time is up) and there are enough players.
      const everyoneAnswered = g.seats.every((s) => s.status !== 'invited');
      if (isBot(state, g.hostId) && canStart(g) && (everyoneAnswered || now >= g.startsAt)) {
        g = startGame(g, g.hostId, now);
      } else if (now >= g.startsAt + 5 * 60 * 1000 && !canStart(g)) {
        g = { ...g, status: 'finished' };
      }
    }
    if (botHolds(state, g) && !state.settings.manualBots && now >= movesAt(g)) g = botPass(g, now);
    g = botChat(state, g, now);
    if (g.status === 'finished' && g.endedAt) g = botWrapUp(g, state, now);
    if (g !== game) changed = true;
    return g;
  });
  return changed ? { ...state, games } : state;
}

// Whether a bot has the lighter in this game, so it is their move.
export const botHolds = (state: DemoState, g: Game) => g.status === 'active' && !!g.holder && isBot(state, g.holder);

// The bot holding the lighter passes it on, with a question from the deck.
export function botPass(g: Game, now: number): Game {
  const key = `${g.id}:${g.passes.length}`;
  const others = players(g).filter((p) => p !== g.holder);
  const to = others[Math.floor(chance(`${key}:to`) * others.length)];
  return passAndAsk(g, g.holder!, to, QUESTIONS[Math.floor(chance(`${key}:q`) * QUESTIONS.length)], now);
}

const CHAT_LINES = ['😂😂😂', 'No way!', 'I knew it 👀', 'Who asked that??', 'Hurry up with the lighter 🔥', "I'm not saying anything 🤐", 'This game is getting spicy 🌶️', 'Ok who wrote that question 😅'];
const ROASTS = ['😂 No way!', '🎯 Called it', '💀 Busted', '🙈 Awkward...', '🔥 Savage', '🤥 Liar!'];

// A bot answers when you write in the chat.
function botChat(state: DemoState, g: Game, now: number): Game {
  const last = g.chat[g.chat.length - 1];
  if (!last || isBot(state, last.from)) return g;
  const key = `${g.id}:chat:${g.chat.length}`;
  if (now < last.at + 2000 + chance(key) * 2000) return g;
  const bots = players(g).filter((p) => isBot(state, p));
  if (!bots.length) return g;
  const bot = bots[Math.floor(chance(`${key}:who`) * bots.length)];
  return sendChat(g, bot, CHAT_LINES[Math.floor(chance(`${key}:line`) * CHAT_LINES.length)], now);
}

// After the game: bots comment on some revealed questions and vote.
function botWrapUp(g: Game, state: DemoState, now: number): Game {
  const ended = g.endedAt!;
  const bots = players(g).filter((p) => isBot(state, p));
  // Only passes that carried a question have a round to comment on or react to.
  const rounds = g.passes.flatMap((p, i) => (p.question ? [i] : []));
  rounds.forEach((i) => {
    const key = `${g.id}:comment:${i}`;
    if (chance(key) > 0.5 || now < ended + 3000 + i * 1500) return;
    const bot = bots[Math.floor(chance(`${key}:who`) * bots.length)];
    if (!bot || g.comments.some((c) => c.passIndex === i && c.from === bot)) return;
    g = addComment(g, bot, i, ROASTS[Math.floor(chance(`${key}:text`) * ROASTS.length)], now);
  });
  rounds.forEach((i) => {
    for (const bot of bots) {
      const key = `${g.id}:react:${i}:${bot}`;
      if (chance(key) > 0.35 || now < ended + 2500 + chance(`${key}:at`) * 6000) continue;
      // Mostly the quick reactions, sometimes one of the extra emoji.
      const pool = chance(`${key}:more`) < 0.25 ? MORE_REACTIONS : REACTIONS;
      const emoji = pool[Math.floor(chance(`${key}:emoji`) * pool.length)];
      if (!g.reactions.some((r) => r.from === bot && r.passIndex === i)) g = toggleReaction(g, bot, i, emoji);
    }
  });
  for (const bot of bots) {
    if (g.votes[bot] || now < ended + 2000 + chance(`${g.id}:${bot}:vote`) * 4000) continue;
    const others = players(g).filter((p) => p !== bot);
    const picks = Object.fromEntries(g.categories.map((c) => [c, others[Math.floor(chance(`${g.id}:${bot}:${c}`) * others.length)]]));
    g = castVotes(g, bot, picks);
  }
  return g;
}

// For a notification: games where a bot just passed you the lighter.
export function newlyPassedToYou(before: DemoState, after: DemoState): Game[] {
  const me = after.me?.id;
  if (!me) return [];
  return after.games.filter((g) => {
    const old = before.games.find((o) => o.id === g.id);
    return g.holder === me && old && old.holder !== me && g.passes.length > old.passes.length;
  });
}

export type PlayerStats = { games: number; champion: number; awards: Record<string, number> };

// A player's record: finished games, Lighter Champion titles and award wins.
// Demo friends come with games played before you joined; the finished games
// in this demo add to that.
export function playerStats(state: DemoState, id: string): PlayerStats {
  const stats: PlayerStats = { games: 0, champion: 0, awards: {} };
  if (isBot(state, id)) {
    stats.games = 4 + Math.floor(chance(`${id}:games`) * 22);
    stats.champion = Math.floor(chance(`${id}:champion`) * (stats.games / 3));
    for (const c of VOTE_CATEGORY_IDS) {
      if (chance(`${id}:${c}`) < 0.45) stats.awards[c] = 1 + Math.floor(chance(`${id}:${c}:wins`) * (stats.games / 4));
    }
  }
  for (const g of state.games) {
    if (g.status !== 'finished' || !players(g).includes(id)) continue;
    stats.games++;
    if (!everyoneVoted(g)) continue;
    const r = results(g);
    if (r.champions.includes(id)) stats.champion++;
    for (const c of g.categories) if (r.winners[c].includes(id)) stats.awards[c] = (stats.awards[c] ?? 0) + 1;
  }
  return stats;
}
