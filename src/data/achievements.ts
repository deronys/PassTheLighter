// Achievements a player profile unlocks across games.
export type Achievement = {
  id: string;
  emoji: string;
  title: string;
  description: string;
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'spark', emoji: '✨', title: 'Spark', description: 'Played your first game.' },
  { id: 'old-flame', emoji: '🕯️', title: 'Old Flame', description: 'Played 10 games.' },
  { id: 'hot-seat', emoji: '🥵', title: 'Hot Seat', description: 'Got the lighter three times and ended a game.' },
  { id: 'fireproof', emoji: '🧯', title: 'Fireproof', description: 'Finished a game without ever getting the lighter.' },
  { id: 'trophy-hunter', emoji: '🏅', title: 'Trophy Hunter', description: 'Won your first award.' },
  { id: 'trophy-cabinet', emoji: '🏆', title: 'Trophy Cabinet', description: 'Won 10 awards in total.' },
  { id: 'roast-master', emoji: '🎤', title: 'Roast Master', description: 'Left 5 comments in one game.' },
  { id: 'question-machine', emoji: '❓', title: 'Question Machine', description: 'Asked 25 questions in total.' },
];

export const AVATARS = ['🦊', '🐼', '🐸', '🦁', '🐙', '🦄', '🐯', '🐵', '🐧', '🦉', '🐺', '🐲', '👽', '🤖', '👻', '🎃', '🐝', '🦖', '🐬', '🦩'];

export const PLAYER_COLORS = ['#FF6A2B', '#FF2D6F', '#B14DFF', '#4D7CFF', '#22D3EE', '#C8FF3D', '#FFC94D', '#E8E6EE'];
