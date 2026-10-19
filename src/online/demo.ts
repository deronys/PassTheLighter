// A pretend server for the demo: you play with computer-controlled friends who
// answer invitations and pass the lighter on their own after a few seconds.
// Everything is plain data plus a `tick` that moves the bots, so it can be
// tested and saved on the phone. A real server replaces this later.
import { QUESTIONS } from '../data/questions.ts';
import {
  type Game,
  type User,
  canStart,
  createGame,
  passAndAsk,
  players,
  respond,
  startGame,
} from './rules.ts';

export type Settings = { sound: boolean; notifications: boolean };

export type DemoState = {
  me: User | null;
  friends: User[];
  games: Game[];
  seq: number;
  seenTutorial: boolean;
  settings: Settings;
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
].map((name, i) => ({ id: `f${i + 1}`, name, color: COLORS[i % COLORS.length] }));

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
// Bots answer within seconds, so a demo game moves fast enough to follow.
const movesAt = (g: Game) => g.lastMoveAt + 2000 + chance(`${g.id}:${g.passes.length}:delay`) * 2000;

export function newDemo(): DemoState {
  return { me: null, friends: DEMO_FRIENDS, games: [], seq: 1, seenTutorial: false, settings: { sound: true, notifications: true } };
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

  return { ...state, me, games: [friday, { ...secrets, startsAt: now + 2 * minute }, late], seq: 4 };
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
    if (g.status === 'active' && g.holder && isBot(state, g.holder) && now >= movesAt(g)) {
      const key = `${g.id}:${g.passes.length}`;
      const others = players(g).filter((p) => p !== g.holder);
      const to = others[Math.floor(chance(`${key}:to`) * others.length)];
      g = passAndAsk(g, g.holder, to, QUESTIONS[Math.floor(chance(`${key}:q`) * QUESTIONS.length)], now);
    }
    if (g !== game) changed = true;
    return g;
  });
  return changed ? { ...state, games } : state;
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
