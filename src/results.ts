// What a finished game adds up to: each player's numbers and the award winners.
import { AWARD_CATEGORIES, type AwardCategory, VOTED_CATEGORIES_PER_GAME, findCategory } from './data/awards.ts';
import { type Random, shuffle } from './deck.ts';
import type { GameState } from './game.ts';

export type PlayerStats = {
  received: number;
  passed: number;
  questionsAsked: number;
  comments: number;
  reactionsOnPasses: number;
};

export type AwardResult = {
  category: AwardCategory;
  // More than one winner on a tie.
  winners: number[];
  // Votes for each winner, or lighters received for the automatic award.
  score: number;
};

export function playerStats(state: GameState): PlayerStats[] {
  return state.players.map((_, player) => {
    const given = state.passes.filter((p) => p.from === player);
    return {
      received: state.receives[player],
      passed: given.length,
      questionsAsked: given.filter((p) => p.question.length > 0).length,
      comments: state.passes.reduce((n, p) => n + p.comments.filter((c) => c.author === player).length, 0),
      reactionsOnPasses: given.reduce((n, p) => n + Object.values(p.reactions).reduce((a, b) => a + b, 0), 0),
    };
  });
}

export function pickVotedCategories(random: Random = Math.random): string[] {
  const voted = AWARD_CATEGORIES.filter((c) => c.kind === 'vote').map((c) => c.id);
  return shuffle(voted, random).slice(0, VOTED_CATEGORIES_PER_GAME);
}

// The automatic awards come first, then the voted ones in the order they were picked.
export function awardResults(state: GameState): AwardResult[] {
  const auto = AWARD_CATEGORIES.filter((c) => c.kind === 'auto').map((category) =>
    topScorers(category, state.receives),
  );
  const voted = state.categories.map((id) => {
    const counts = state.players.map(
      (_, player) => state.votes.filter((v) => v.category === id && v.nominee === player).length,
    );
    return topScorers(findCategory(id), counts);
  });
  return [...auto, ...voted];
}

function topScorers(category: AwardCategory, scores: number[]): AwardResult {
  const score = Math.max(...scores);
  const winners = scores.flatMap((s, i) => (s === score ? [i] : []));
  return { category, winners, score };
}
