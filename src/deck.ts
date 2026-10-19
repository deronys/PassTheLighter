// Random question suggestions drawn like cards from a shuffled deck, so no
// question comes up again until every question in the pool has been shown.
// The deck is saved between games.

export type Deck = {
  // Indexes into the question pool that have not been shown yet, in draw order.
  remaining: number[];
};

export type Random = () => number;

export function shuffle<T>(items: T[], random: Random = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function newDeck(poolSize: number, random: Random = Math.random): Deck {
  return { remaining: shuffle(Array.from({ length: poolSize }, (_, i) => i), random) };
}

// Draws `count` questions. When the deck runs out it is reshuffled, keeping
// the questions just drawn out of the rest of this draw.
export function draw(
  deck: Deck,
  count: number,
  poolSize: number,
  random: Random = Math.random,
): { picks: number[]; deck: Deck } {
  const picks: number[] = [];
  let remaining = deck.remaining.filter((i) => i < poolSize);
  while (picks.length < Math.min(count, poolSize)) {
    if (remaining.length === 0) {
      remaining = newDeck(poolSize, random).remaining.filter((i) => !picks.includes(i));
    }
    picks.push(remaining[0]);
    remaining = remaining.slice(1);
  }
  return { picks, deck: { remaining } };
}
