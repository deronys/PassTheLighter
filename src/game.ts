// Pass The Lighter rules, kept free of UI code so they can be tested on their own.
//
// The phone is the lighter. The holder picks who gets it next and writes them a
// secret question. The new holder reads it and answers by picking who gets the
// lighter next (without saying why), then writes that player a new question.
// When a player receives the lighter for the third time, they answer the last
// question and every question and answer is revealed.

export const MIN_PLAYERS = 4;
export const RECEIVES_TO_END = 3;

export type Pass = {
  from: number;
  to: number;
  question: string;
  // The player `to` picked as the answer to `question`, set on their turn.
  answer?: number;
};

export type GameState = {
  players: string[];
  holder: number;
  receives: number[];
  passes: Pass[];
  // 'handoff': the phone is being handed to `holder`, the screen hides everything.
  // 'turn': `holder` is answering and/or writing the next question.
  // 'reveal': the game is over.
  phase: 'handoff' | 'turn' | 'reveal';
};

export function cleanNames(names: string[]): string[] {
  return names.map((n) => n.trim()).filter((n) => n.length > 0);
}

export function canStart(names: string[]): boolean {
  const cleaned = cleanNames(names);
  const unique = new Set(cleaned.map((n) => n.toLowerCase()));
  return cleaned.length >= MIN_PLAYERS && unique.size === cleaned.length;
}

export function startGame(names: string[], firstHolder: number): GameState {
  const players = cleanNames(names);
  return {
    players,
    holder: firstHolder,
    receives: players.map(() => 0),
    passes: [],
    phase: 'handoff',
  };
}

// The question the current holder has to answer, if any.
export function incomingPass(state: GameState): Pass | undefined {
  const last = state.passes[state.passes.length - 1];
  return last && last.to === state.holder && last.answer === undefined ? last : undefined;
}

// The holder must answer with their last pick when this is their final receive.
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
  passes.push({ from: state.holder, to, question: question.trim() });
  const receives = state.receives.map((count, i) => (i === to ? count + 1 : count));
  return { ...state, holder: to, receives, passes, phase: 'handoff' };
}

// On the last turn the holder only answers; nothing is passed on.
export function answerLast(state: GameState, answer: number): GameState {
  if (answer === state.holder) throw new Error('A player cannot pick themselves');
  return { ...state, passes: answerIncoming(state, answer), phase: 'reveal' };
}

function answerIncoming(state: GameState, answer: number): Pass[] {
  const incoming = incomingPass(state);
  return state.passes.map((p) => (p === incoming ? { ...p, answer } : p));
}

export const SAMPLE_QUESTIONS = [
  'Who do you think has a secret crush on you?',
  'Who here would survive longest on a desert island?',
  'Who would you call at 3am if you were in trouble?',
  'Who is most likely to become famous?',
  'Who here keeps the best secrets?',
  'Who would you trust with your phone unlocked?',
  'Who is the worst liar in this group?',
  'Who would you most like to switch lives with for a day?',
];
