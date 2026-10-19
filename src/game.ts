// Pass The Lighter rules, kept free of UI code so they can be tested on their own.
//
// The phone is the lighter. The holder picks who gets it next and writes them a
// secret question. The new holder reads it and answers by picking who gets the
// lighter next (without saying why), then writes that player a new question.
// When a player receives the lighter for the third time, they answer the last
// question and the game ends. Then every question is revealed, players comment
// on the passes, vote for awards and watch the awards ceremony.

export const MIN_PLAYERS = 4;
export const RECEIVES_TO_END = 3;
export const REACTIONS = ['😂', '🔥', '😱', '👀', '💀'];

export type Player = {
  id: string;
  name: string;
  avatar: string;
  color: string;
};

export type Comment = {
  author: number;
  text: string;
};

export type Pass = {
  from: number;
  to: number;
  question: string;
  // The player `to` picked as the answer to `question`, set on their turn.
  answer?: number;
  comments: Comment[];
  reactions: Record<string, number>;
};

export type Vote = {
  voter: number;
  category: string;
  nominee: number;
};

export type Phase =
  // The phone is being handed to `holder`; the screen hides everything.
  | 'handoff'
  // `holder` is answering and/or writing the next question.
  | 'turn'
  // Someone got the lighter for the third time and answered the last question.
  | 'gameover'
  // All questions are revealed and players comment on the passes.
  | 'recap'
  // The phone is being handed to `voter`.
  | 'vote-handoff'
  // `voter` is voting in every category.
  | 'vote'
  | 'ceremony'
  | 'final';

export type GameState = {
  players: Player[];
  holder: number;
  receives: number[];
  passes: Pass[];
  phase: Phase;
  // The voted award categories picked for this game.
  categories: string[];
  voter: number;
  votes: Vote[];
};

export function canStart(players: Player[]): boolean {
  return players.length >= MIN_PLAYERS && new Set(players.map((p) => p.id)).size === players.length;
}

export function startGame(players: Player[], firstHolder: number): GameState {
  return {
    players,
    holder: firstHolder,
    receives: players.map(() => 0),
    passes: [],
    phase: 'handoff',
    categories: [],
    voter: 0,
    votes: [],
  };
}

// The question the current holder has to answer, if any.
export function incomingPass(state: GameState): Pass | undefined {
  const last = state.passes[state.passes.length - 1];
  return last && last.to === state.holder && last.answer === undefined ? last : undefined;
}

// The holder only answers, without passing on, when this is their final receive.
export function isLastTurn(state: GameState): boolean {
  return state.receives[state.holder] >= RECEIVES_TO_END;
}

export function beginTurn(state: GameState): GameState {
  return { ...state, phase: 'turn' };
}

// The holder passes the lighter to `to`. Picking `to` is also the answer to the
// question the holder received, if there was one.
export function passLighter(state: GameState, to: number, question: string): GameState {
  if (to === state.holder) throw new Error('A player cannot pass the lighter to themselves');
  const passes = answerIncoming(state, to);
  passes.push({ from: state.holder, to, question: question.trim(), comments: [], reactions: {} });
  const receives = state.receives.map((count, i) => (i === to ? count + 1 : count));
  return { ...state, holder: to, receives, passes, phase: 'handoff' };
}

// On the last turn the holder only answers; nothing is passed on.
export function answerLast(state: GameState, answer: number): GameState {
  if (answer === state.holder) throw new Error('A player cannot pick themselves');
  return { ...state, passes: answerIncoming(state, answer), phase: 'gameover' };
}

function answerIncoming(state: GameState, answer: number): Pass[] {
  const incoming = incomingPass(state);
  return state.passes.map((p) => (p === incoming ? { ...p, answer } : p));
}

export function showRecap(state: GameState): GameState {
  return { ...state, phase: 'recap' };
}

export function addComment(state: GameState, passIndex: number, author: number, text: string): GameState {
  const trimmed = text.trim();
  if (trimmed.length === 0) return state;
  return updatePass(state, passIndex, (p) => ({ ...p, comments: [...p.comments, { author, text: trimmed }] }));
}

export function react(state: GameState, passIndex: number, emoji: string): GameState {
  return updatePass(state, passIndex, (p) => ({
    ...p,
    reactions: { ...p.reactions, [emoji]: (p.reactions[emoji] ?? 0) + 1 },
  }));
}

function updatePass(state: GameState, passIndex: number, change: (pass: Pass) => Pass): GameState {
  return { ...state, passes: state.passes.map((p, i) => (i === passIndex ? change(p) : p)) };
}

export function startVoting(state: GameState, categories: string[]): GameState {
  return { ...state, categories, voter: 0, votes: [], phase: 'vote-handoff' };
}

export function beginVote(state: GameState): GameState {
  return { ...state, phase: 'vote' };
}

// The current voter's pick in each category. The ceremony starts after the last voter.
export function castVotes(state: GameState, picks: Record<string, number>): GameState {
  const votes = [...state.votes];
  for (const category of state.categories) {
    const nominee = picks[category];
    if (nominee === undefined) throw new Error(`Missing vote for ${category}`);
    if (nominee === state.voter) throw new Error('A player cannot vote for themselves');
    votes.push({ voter: state.voter, category, nominee });
  }
  const lastVoter = state.voter === state.players.length - 1;
  return {
    ...state,
    votes,
    voter: lastVoter ? state.voter : state.voter + 1,
    phase: lastVoter ? 'ceremony' : 'vote-handoff',
  };
}

export function finishCeremony(state: GameState): GameState {
  return { ...state, phase: 'final' };
}
