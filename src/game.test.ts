/// <reference types="node" />

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { QUESTIONS, QUESTION_CATEGORIES, QUESTIONS_PER_CATEGORY, categoryOf } from './data/questions.ts';
import { draw, newDeck } from './deck.ts';
import {
  type Player,
  addComment,
  answerLast,
  beginTurn,
  beginVote,
  canStart,
  gameStatus,
  resumeState,
  castVotes,
  incomingPass,
  isLastTurn,
  passLighter,
  react,
  showRecap,
  startGame,
  startVoting,
} from './game.ts';
import { FINISHED_TO_KEEP, type SavedGame, newSavedGame, removeGame, upsertGame } from './games.ts';
import { recordGame } from './profiles.ts';
import { awardResults, pickVotedCategories, playerStats } from './results.ts';

const PLAYERS: Player[] = ['Anna', 'Babis', 'Chris', 'Dora'].map((name, i) => ({
  id: `p${i}`,
  name,
  avatar: '🦊',
  color: '#fff',
}));

// Anna and Babis keep passing to each other until Babis gets it a third time,
// then Babis answers the last question with Dora.
function finishedGame() {
  let game = beginTurn(startGame(PLAYERS, 0));
  for (let i = 0; i < 5; i++) game = beginTurn(passLighter(game, game.holder === 0 ? 1 : 0, `Q${i}`));
  return answerLast(game, 3);
}

test('needs at least four different players', () => {
  assert.equal(canStart(PLAYERS.slice(0, 3)), false);
  assert.equal(canStart([...PLAYERS.slice(0, 3), PLAYERS[0]]), false);
  assert.equal(canStart(PLAYERS), true);
});

test('first holder has no question to answer', () => {
  const game = beginTurn(startGame(PLAYERS, 0));
  assert.equal(incomingPass(game), undefined);
  assert.equal(isLastTurn(game), false);
});

test('passing answers the incoming question and hands the lighter on', () => {
  let game = beginTurn(startGame(PLAYERS, 0));
  game = beginTurn(passLighter(game, 1, '  Who snores?  '));
  assert.equal(incomingPass(game)?.question, 'Who snores?');
  game = passLighter(game, 2, 'Who is late?');
  assert.equal(game.passes[0].answer, 2);
  assert.equal(game.holder, 2);
  assert.deepEqual(game.receives, [0, 1, 1, 0]);
  assert.equal(game.phase, 'handoff');
});

test('cannot pass to yourself', () => {
  const game = beginTurn(startGame(PLAYERS, 0));
  assert.throws(() => passLighter(game, 0, 'Q'));
});

test('third receive is the last turn and its answer ends the game', () => {
  const game = finishedGame();
  assert.equal(game.phase, 'gameover');
  assert.equal(game.holder, 1);
  assert.equal(game.passes.length, 5);
  assert.ok(game.passes.every((p) => p.answer !== undefined));
  assert.equal(game.passes[4].answer, 3);
});

test('comments and reactions attach to one pass', () => {
  let game = showRecap(finishedGame());
  game = addComment(game, 2, 3, '  Busted!  ');
  game = addComment(game, 2, 0, '   ');
  game = react(react(game, 2, '😂'), 2, '😂');
  assert.deepEqual(game.passes[2].comments, [{ author: 3, text: 'Busted!' }]);
  assert.deepEqual(game.passes[2].reactions, { '😂': 2 });
  assert.deepEqual(game.passes[1].comments, []);
});

test('every player votes in the same categories, then the ceremony starts', () => {
  let game = startVoting(showRecap(finishedGame()), ['mvp', 'liar']);
  for (let voter = 0; voter < PLAYERS.length; voter++) {
    assert.equal(game.phase, 'vote-handoff');
    assert.equal(game.voter, voter);
    game = beginVote(game);
    assert.throws(() => castVotes(game, { mvp: voter, liar: (voter + 1) % 4 }));
    game = castVotes(game, { mvp: voter === 2 ? 3 : 2, liar: (voter + 1) % 4 });
  }
  assert.equal(game.phase, 'ceremony');
  const results = awardResults(game);
  assert.deepEqual(
    results.map((r) => [r.category.id, r.winners, r.score]),
    [
      ['champion', [1], 3],
      ['mvp', [2], 3],
      ['liar', [0, 1, 2, 3], 1],
    ],
  );
});

test('picks five different voted categories', () => {
  const picked = pickVotedCategories();
  assert.equal(picked.length, 5);
  assert.equal(new Set(picked).size, 5);
  assert.ok(!picked.includes('champion'));
});

test('player stats count passes, questions and comments', () => {
  const game = addComment(showRecap(finishedGame()), 0, 2, 'ha');
  const stats = playerStats(game);
  assert.deepEqual(stats[0], { received: 2, passed: 3, questionsAsked: 3, comments: 0, reactionsOnPasses: 0 });
  assert.equal(stats[1].received, 3);
  assert.equal(stats[2].comments, 1);
});

test('the question pool has 200 different questions', () => {
  assert.equal(QUESTIONS.length, 200);
  assert.equal(new Set(QUESTIONS).size, 200);
});

test('suggestions do not repeat until the whole pool has been shown', () => {
  let deck = newDeck(QUESTIONS.length);
  const seen: number[] = [];
  for (let i = 0; i < 40; i++) {
    const result = draw(deck, 5, QUESTIONS.length);
    seen.push(...result.picks);
    deck = result.deck;
  }
  assert.equal(new Set(seen).size, 200);
  // The next draw reshuffles and still gives 5 different questions.
  const next = draw(deck, 5, QUESTIONS.length);
  assert.equal(new Set(next.picks).size, 5);
  // A draw that runs out halfway never repeats a question within itself.
  const partial = draw({ remaining: [7, 8] }, 5, 10);
  assert.equal(new Set(partial.picks).size, 5);
  assert.deepEqual(partial.picks.slice(0, 2), [7, 8]);
});

test('finished games add up in player profiles and unlock achievements', () => {
  let game = startVoting(showRecap(finishedGame()), ['mvp']);
  for (let voter = 0; voter < 4; voter++) game = castVotes(beginVote(game), { mvp: voter === 1 ? 0 : 1 });
  const first = recordGame([], game, playerStats(game), awardResults(game));
  const babis = first.profiles.find((p) => p.id === 'p1')!;
  assert.equal(babis.stats.games, 1);
  assert.equal(babis.stats.received, 3);
  assert.equal(babis.stats.awards, 2);
  assert.deepEqual(first.unlocked[1], ['spark', 'hot-seat', 'trophy-hunter']);
  assert.deepEqual(first.unlocked[3], ['spark', 'fireproof']);

  const second = recordGame(first.profiles, game, playerStats(game), awardResults(game));
  assert.equal(second.profiles.length, 4);
  assert.equal(second.profiles.find((p) => p.id === 'p1')!.stats.games, 2);
  assert.deepEqual(second.unlocked[1], []);
});

test('resuming a game hides private screens behind a hand-off', () => {
  const turn = beginTurn(startGame(PLAYERS, 2));
  assert.equal(resumeState(turn).phase, 'handoff');
  const voting = beginVote(startVoting(showRecap(finishedGame()), ['mvp']));
  assert.equal(resumeState(voting).phase, 'vote-handoff');
  assert.equal(resumeState(finishedGame()).phase, 'gameover');
});

test('game status describes each stage for the home screen', () => {
  let game = startGame(PLAYERS, 2);
  assert.equal(gameStatus(game), 'Starting with Chris');
  game = passLighter(beginTurn(game), 0, 'Q');
  assert.equal(gameStatus(game), 'Anna has the lighter · 1 pass');
  game = startVoting(showRecap(finishedGame()), ['mvp']);
  game = castVotes(beginVote(game), { mvp: 1 });
  assert.equal(gameStatus(game), 'Voting · 1 of 4 voted');
});

test('saved games list keeps games in progress first and trims old finished games', () => {
  const active = { ...newSavedGame(startGame(PLAYERS, 0), 1), id: 'active' };
  let games: SavedGame[] = [active];
  const finished = { ...finishedGame(), phase: 'final' as const };
  for (let i = 0; i < FINISHED_TO_KEEP + 3; i++) {
    games = upsertGame(games, { ...newSavedGame(finished, 100 + i), id: `done${i}` });
  }
  assert.equal(games[0].id, 'active');
  assert.equal(games.length, FINISHED_TO_KEEP + 1);
  assert.equal(games[1].id, `done${FINISHED_TO_KEEP + 2}`);
  games = upsertGame(games, { ...active, updatedAt: 999, state: passLighter(beginTurn(active.state), 1, 'Q') });
  assert.equal(games.filter((g) => g.id === 'active').length, 1);
  assert.equal(removeGame(games, 'active').length, FINISHED_TO_KEEP);
});

test('every question belongs to a card category', () => {
  assert.equal(QUESTION_CATEGORIES.length * QUESTIONS_PER_CATEGORY, QUESTIONS.length);
  assert.equal(categoryOf(0).name, 'Secrets');
  assert.equal(categoryOf(199).name, 'Spicy');
});
