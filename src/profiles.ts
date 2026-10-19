// Player profiles kept on the phone between games: who they are, their
// lifetime numbers and the achievements they have unlocked.
import { ACHIEVEMENTS } from './data/achievements.ts';
import type { GameState, Player } from './game.ts';
import type { AwardResult, PlayerStats } from './results.ts';

export type LifetimeStats = {
  games: number;
  received: number;
  passed: number;
  questionsAsked: number;
  comments: number;
  awards: number;
  // Awards won per category id.
  awardsByCategory: Record<string, number>;
};

export type Profile = Player & {
  stats: LifetimeStats;
  achievements: string[];
};

export function newProfile(player: Player): Profile {
  return {
    ...player,
    stats: { games: 0, received: 0, passed: 0, questionsAsked: 0, comments: 0, awards: 0, awardsByCategory: {} },
    achievements: [],
  };
}

export type GameUpdate = {
  profiles: Profile[];
  // Achievement ids unlocked in this game, by player index in the game.
  unlocked: string[][];
};

// Adds a finished game to the profiles of everyone who played.
export function recordGame(
  profiles: Profile[],
  state: GameState,
  stats: PlayerStats[],
  awards: AwardResult[],
): GameUpdate {
  const unlocked: string[][] = state.players.map(() => []);
  const updated = new Map<string, Profile>();

  state.players.forEach((player, index) => {
    const before = profiles.find((p) => p.id === player.id) ?? newProfile(player);
    const won = awards.filter((a) => a.winners.includes(index));
    const awardsByCategory = { ...before.stats.awardsByCategory };
    for (const award of won) awardsByCategory[award.category.id] = (awardsByCategory[award.category.id] ?? 0) + 1;
    const game = stats[index];
    const lifetime: LifetimeStats = {
      games: before.stats.games + 1,
      received: before.stats.received + game.received,
      passed: before.stats.passed + game.passed,
      questionsAsked: before.stats.questionsAsked + game.questionsAsked,
      comments: before.stats.comments + game.comments,
      awards: before.stats.awards + won.length,
      awardsByCategory,
    };

    const earned: Record<string, boolean> = {
      spark: lifetime.games >= 1,
      'old-flame': lifetime.games >= 10,
      'hot-seat': index === state.holder,
      fireproof: game.received === 0,
      'trophy-hunter': lifetime.awards >= 1,
      'trophy-cabinet': lifetime.awards >= 10,
      'roast-master': game.comments >= 5,
      'question-machine': lifetime.questionsAsked >= 25,
    };
    const fresh = ACHIEVEMENTS.map((a) => a.id).filter((id) => earned[id] && !before.achievements.includes(id));
    unlocked[index] = fresh;
    updated.set(player.id, { ...before, ...player, stats: lifetime, achievements: [...before.achievements, ...fresh] });
  });

  const kept = profiles.map((p) => updated.get(p.id) ?? p);
  const added = [...updated.values()].filter((p) => !profiles.some((q) => q.id === p.id));
  return { profiles: [...kept, ...added], unlocked };
}
