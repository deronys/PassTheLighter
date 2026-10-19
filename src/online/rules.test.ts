/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { newDemo, newlyPassedToYou, signIn, tick } from './demo.ts';
import {
  INVITE_WINDOW_MS,
  addComment,
  castVotes,
  everyoneVoted,
  lastHolder,
  results,
  sendChat,
  burn,
  canSee,
  canStart,
  createGame,
  passAndAsk,
  players,
  reasonIndex,
  receives,
  removeFor,
  respond,
  roleOf,
  startGame,
  visibleTo,
} from './rules.ts';

function started() {
  let g = createGame('g', 'Test', 'a', ['b', 'c', 'd', 'e'], 0);
  for (const u of ['b', 'c', 'd']) g = respond(g, u, true, 1);
  g = respond(g, 'e', false, 1);
  return startGame(g, 'a', 2);
}

test('a game needs four accepted players and only the host can start it', () => {
  let g = createGame('g', 'Test', 'a', ['b', 'c', 'd'], 0);
  assert.equal(g.startsAt, INVITE_WINDOW_MS);
  assert.equal(roleOf(g, 'b'), 'invited');
  assert.equal(roleOf(g, 'a'), 'waiting');
  g = respond(g, 'b', true, 1);
  g = respond(g, 'c', true, 1);
  assert.ok(!canStart(g));
  g = respond(g, 'd', true, 1);
  assert.ok(canStart(g));
  assert.throws(() => startGame(g, 'b', 2));
  g = startGame(g, 'a', 2);
  assert.equal(g.holder, 'a');
  assert.equal(roleOf(g, 'a'), 'starter');
});

test('declined players leave the game and their list', () => {
  const g = started();
  assert.deepEqual(players(g), ['a', 'b', 'c', 'd']);
  assert.equal(visibleTo([g], 'e').length, 0);
});

test('passing the lighter moves it and sets everyone’s role', () => {
  let g = passAndAsk(started(), 'a', 'b', 'Who snores?', 3);
  assert.throws(() => passAndAsk(g, 'a', 'c', 'Again?', 4));
  assert.throws(() => passAndAsk(g, 'b', 'b', 'Me?', 4));
  assert.throws(() => passAndAsk(g, 'b', 'c', '   ', 4));
  assert.equal(roleOf(g, 'b'), 'holder');
  assert.equal(roleOf(g, 'a'), 'lastPasser');
  assert.equal(roleOf(g, 'c'), 'watcher');
  g = passAndAsk(g, 'b', 'c', 'Who cooks best?', 4);
  assert.deepEqual(receives(g), { a: 1, b: 1, c: 1, d: 0 });
});

test('the receiver sees their question but not the one they answer; burning reveals it', () => {
  let g = passAndAsk(started(), 'a', 'b', 'Who snores?', 3);
  g = passAndAsk(g, 'b', 'c', 'Who cooks best?', 4);
  // c holds the lighter: b picked c as the answer to "Who snores?".
  assert.equal(reasonIndex(g, 1), 0);
  assert.equal(reasonIndex(g, 0), undefined);
  assert.ok(canSee(g, 1, 'c'));
  assert.ok(!canSee(g, 0, 'c'));
  assert.ok(canSee(g, 0, 'a') && canSee(g, 0, 'b'));
  assert.ok(!canSee(g, 1, 'd'));
  g = burn(g, 0, 'c');
  assert.ok(canSee(g, 0, 'c'));
  assert.ok(!canSee(g, 0, 'd'));
});

test('the host removing a game ends it; others only hide it', () => {
  const g = started();
  const hidden = removeFor(g, 'b', 5);
  assert.equal(hidden.status, 'active');
  assert.equal(visibleTo([hidden], 'b').length, 0);
  assert.equal(removeFor(g, 'a', 5).status, 'finished');
});

test('the demo seeds games and the bots play on their own', () => {
  const now = 1_000_000_000;
  const state = signIn(newDemo(), 'John', now);
  const friday = state.games.find((g) => g.name === 'Friday Quizzz')!;
  assert.equal(roleOf(friday, 'me'), 'holder');
  assert.equal(roleOf(state.games.find((g) => g.name === 'Dirty Secrets')!, 'me'), 'invited');
  assert.equal(tick(state, now).games.find((g) => g.name === 'Friday Quizzz'), friday);
  let later = state;
  for (let t = now; t <= now + 120_000; t += 1000) later = tick(later, t);
  const late = later.games.find((g) => g.name === 'Late Night Truths')!;
  assert.ok(late.passes.length >= 4 || late.holder !== null);
  // Bots never move a game you hold.
  assert.equal(later.games.find((g) => g.name === 'Friday Quizzz')!.passes.length, friday.passes.length);
  assert.ok(Array.isArray(newlyPassedToYou(state, later)));
  // In the finished game every bot has voted and you are the one left.
  const weekend = later.games.find((g) => g.name === 'Weekend Vibes')!;
  assert.equal(weekend.status, 'finished');
  assert.deepEqual(Object.keys(weekend.votes).sort(), players(weekend).filter((p) => p !== 'me').sort());
});

test('the game ends when someone gets the lighter for the third time', () => {
  let g = started();
  g = passAndAsk(g, 'a', 'b', 'Q1', 3);
  g = passAndAsk(g, 'b', 'a', 'Q2', 4);
  g = passAndAsk(g, 'a', 'b', 'Q3', 5);
  assert.equal(g.status, 'active');
  g = passAndAsk(g, 'b', 'a', 'Q4', 6);
  assert.equal(g.status, 'finished');
  assert.equal(lastHolder(g), 'a');
  assert.equal(g.categories.length, 5);
  assert.equal(new Set(g.categories).size, 5);
  // Everything is revealed to everyone.
  assert.ok([0, 1, 2, 3].every((i) => canSee(g, i, 'd')));
  assert.throws(() => passAndAsk(g, 'a', 'c', 'Q5', 7));
});

function finished() {
  let g = started();
  for (const [from, to] of [['a', 'b'], ['b', 'a'], ['a', 'b'], ['b', 'a']]) g = passAndAsk(g, from, to, 'Q', 3);
  return g;
}

test('chat works in every phase and comments open at the end', () => {
  let g = createGame('g', 'Test', 'a', ['b', 'c', 'd'], 0);
  g = sendChat(g, 'a', ' hi ', 1);
  assert.deepEqual(g.chat, [{ from: 'a', text: 'hi', at: 1 }]);
  assert.throws(() => addComment(started(), 'a', 0, 'lol', 2));
  const f = addComment(finished(), 'c', 1, 'Busted', 9);
  assert.equal(f.comments[0].text, 'Busted');
});

test('players vote in every category, never for themselves, and the most voted is champion', () => {
  let g = finished();
  const [c1, c2, c3, c4, c5] = g.categories;
  const all = (who: string) => Object.fromEntries(g.categories.map((c) => [c, who]));
  assert.throws(() => castVotes(g, 'a', all('a')));
  assert.throws(() => castVotes(g, 'a', { [c1]: 'b' }));
  g = castVotes(g, 'a', all('b'));
  assert.throws(() => castVotes(g, 'a', all('c')));
  g = castVotes(g, 'b', { [c1]: 'c', [c2]: 'c', [c3]: 'c', [c4]: 'd', [c5]: 'd' });
  g = castVotes(g, 'c', all('b'));
  assert.ok(!everyoneVoted(g));
  g = castVotes(g, 'd', all('c'));
  assert.ok(everyoneVoted(g));
  const r = results(g);
  assert.equal(r.totals.b, 10);
  assert.equal(r.totals.c, 8);
  assert.deepEqual(r.champions, ['b']);
  assert.deepEqual(r.winners[c1], ['b', 'c']);
});
