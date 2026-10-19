// Award categories for the end-of-game ceremony. To add a category, append it
// here: 'vote' categories are voted on by the players, 'auto' ones are worked
// out from the game itself.
export type AwardCategory = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  kind: 'vote' | 'auto';
};

export const AWARD_CATEGORIES: AwardCategory[] = [
  { id: 'creative', emoji: '🧠', title: 'The Most Creative Player', description: 'Came up with the most imaginative questions.', kind: 'vote' },
  { id: 'sneaky', emoji: '😈', title: 'The Sneakiest Player', description: 'Knew how to manipulate the game and pull the strings.', kind: 'vote' },
  { id: 'liar', emoji: '🤥', title: 'The Biggest Liar', description: 'Gave the most outrageous answers with absolute confidence.', kind: 'vote' },
  { id: 'actor', emoji: '🎭', title: 'The Best Actor', description: 'Convinced everyone they were telling the truth.', kind: 'vote' },
  { id: 'strategist', emoji: '🎯', title: 'The Master Strategist', description: 'Always seemed to know exactly whom to give the lighter to.', kind: 'vote' },
  { id: 'detective', emoji: '🕵️', title: 'The Best Detective', description: 'Figured out what was really going on behind everyone else\'s answers.', kind: 'vote' },
  { id: 'champion', emoji: '🔥', title: 'The Lighter Champion', description: 'Got the most votes across all the awards.', kind: 'auto' },
  { id: 'one-liners', emoji: '😂', title: 'The King/Queen of One-Liners', description: 'Delivered the funniest comments and reactions.', kind: 'vote' },
  { id: 'unpredictable', emoji: '🌀', title: 'The Most Unpredictable Player', description: 'Nobody could ever guess their next move.', kind: 'vote' },
  { id: 'troublemaker', emoji: '🧨', title: 'The Biggest Troublemaker', description: 'Created the most unexpected situations.', kind: 'vote' },
  { id: 'suspicious', emoji: '🫣', title: 'The Most Suspicious Player', description: 'Made everyone question their intentions.', kind: 'vote' },
  { id: 'lucky', emoji: '🎲', title: 'The Luckiest Player', description: 'Always escaped at the last possible moment.', kind: 'vote' },
  { id: 'excuses', emoji: '🗣️', title: 'The Best Excuse Maker', description: 'Always had an explanation or excuse for everything.', kind: 'vote' },
  { id: 'mvp', emoji: '🏆', title: 'The MVP of the Night', description: 'Stood out the most overall.', kind: 'vote' },
  { id: 'chicken', emoji: '🐔', title: 'The Biggest Chicken', description: 'Always went for the safest option and never took a risk.', kind: 'vote' },
];

// How many voted categories each game picks at random, so voting stays short.
export const VOTED_CATEGORIES_PER_GAME = 5;

export function findCategory(id: string): AwardCategory {
  const category = AWARD_CATEGORIES.find((c) => c.id === id);
  if (!category) throw new Error(`Unknown award category ${id}`);
  return category;
}
