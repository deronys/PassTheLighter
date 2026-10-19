/// <reference types="node" />

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { answerLast, beginTurn, canStart, incomingPass, isLastTurn, passLighter, startGame } from './game.ts';

const NAMES = ['Anna', 'Babis', 'Chris', 'Dora'];

test('needs at least four distinct names', () => {
  assert.equal(canStart(['A', 'B', 'C']), false);
  assert.equal(canStart(['A', 'B', 'C', ' ']), false);
  assert.equal(canStart(['A', 'B', 'C', 'a']), false);
  assert.equal(canStart(['A', 'B', 'C', 'D']), true);
});

test('first holder has no question to answer', () => {
  const game = beginTurn(startGame(NAMES, 0));
  assert.equal(incomingPass(game), undefined);
  assert.equal(isLastTurn(game), false);
});

test('passing answers the incoming question and hands the lighter on', () => {
  let game = beginTurn(startGame(NAMES, 0));
  game = beginTurn(passLighter(game, 1, '  Who snores?  '));
  assert.deepEqual(incomingPass(game), { from: 0, to: 1, question: 'Who snores?' });
  game = passLighter(game, 2, 'Who is late?');
  assert.equal(game.passes[0].answer, 2);
  assert.equal(game.holder, 2);
  assert.deepEqual(game.receives, [0, 1, 1, 0]);
  assert.equal(game.phase, 'handoff');
});

test('cannot pass to yourself', () => {
  const game = beginTurn(startGame(NAMES, 0));
  assert.throws(() => passLighter(game, 0, 'Q'));
});

test('third receive is the last turn and its answer ends the game', () => {
  let game = beginTurn(startGame(NAMES, 0));
  // Anna and Babis keep passing between each other.
  for (let i = 0; i < 5; i++) {
    assert.equal(isLastTurn(game), false);
    game = beginTurn(passLighter(game, game.holder === 0 ? 1 : 0, `Q${i}`));
  }
  // Babis got it three times (passes 1, 3, 5).
  assert.equal(game.holder, 1);
  assert.equal(isLastTurn(game), true);
  game = answerLast(game, 3);
  assert.equal(game.phase, 'reveal');
  assert.equal(game.passes.length, 5);
  assert.ok(game.passes.every((p) => p.answer !== undefined));
  assert.equal(game.passes[4].answer, 3);
});
