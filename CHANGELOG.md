# Changelog

All notable changes are listed here. Versions follow [Semantic Versioning](https://semver.org).

## v0.8.0 - 2026-10-19

The whole game is rebuilt from John's final screen designs. The pass-the-phone game of v0.7.0 and earlier stays on its release branches.

- Online-style game: every player has their own phone. Create a game, invite friends, accept or reject invitations, and the host starts once 4 players are in.
- Pass the lighter and ask a secret question; answer by passing it on. Others see "Question hidden" and can burn it by watching an ad. "Learn why" shows why you got the lighter. The player who passed can take it back if the lighter sits too long.
- Screens: welcome, how to play, login, main menu, game list, invite friends, waiting room, pass the lighter, ask a question, you got it, game status, burn a question, game progress, ad, settings and friends.
- New look from the designs: teal felt background, red painted header with the flame counter, red and yellow comic buttons, speech bubbles and the Luckiest Guy and Fredoka fonts.
- Demo mode: friends are computer players that accept invites and pass the lighter on their own, sign-in is pretend and the ads are placeholders.

## v0.7.0 - 2026-10-19

A new, more grown-up look for players in their 20s and 30s, in the style of today's social apps.

- Near-black background with soft pink and violet glows, glassy cards and an orange-to-pink flame gradient as the accent. Acid lime marks confirmed picks.
- New fonts: Unbounded for titles and Inter for everything else, replacing the cartoon font.
- Avatars are now initials on a colour gradient instead of animal emoji. New players only pick a colour.
- Pill buttons with the flame gradient; a sleek matte lighter with a gradient flame; awards as glowing badges instead of a cartoon cup; a pulsing "?" instead of the drum.
- The header shows "‹ Games" and a flame counter (or "History" after the game) instead of emoji icons. Lighter counts under avatars are small bars.
- Question cards and secret cards use deeper, more refined colours and a cleaner bold font.

## v0.6.0 - 2026-10-19

- The Lighter Champion is now whoever got the most votes over all the awards in total, even without winning a single category. Ties share it. It is revealed last in the ceremony, as the grand finale.
- The secrets recap is now a game: one secret at a time, shown as who passed the lighter to whom and a face-down card you tap to flip over. The question card has its category colour, and the answer pops in underneath.
- Reactions are big emoji buttons with counters, and each tap sends the emoji floating up.
- Comments: tap your face, then tap a one-tap roast (😂 No way!, 🎯 Called it, 💀 Busted, 🙈 Awkward…, 🔥 Savage, 🤥 Liar!) or type your own. Comments show as speech bubbles in the player's colour.
- The Moments tab of the final recap uses the same secret cards.

## v0.5.2 - 2026-10-19

- The box where you write your question now looks like a question card too: same shape, gradient, card font and corner emoji. It is orange with a ✏️ while you write your own; when you copy an idea card it takes that card's colour and category until you change the text.

## v0.5.1 - 2026-10-19

- Writing your own question is now the main option: a big "Write it your way" card at the top of the question step.
- The question cards move below it as optional ideas ("Stuck? Grab an idea"). Swipe through them and tap a card, or "Use this one", to copy its question into your own card, where you can still edit it.

## v0.5.0 - 2026-10-19

- The question step is now a hand of question cards instead of a text list. Each turn deals 5 cards with a dealing animation. Every card has a colour and emoji for its category (Secrets, Trust, Embarrassing, Future, Survival, Personality, Party, Love, What if, Spicy).
- Swipe the top card or tap the arrows to flip through the hand; the card on top is the question you ask. Dots show which card you are on.
- The last card is blank, for writing your own question.
- A "Deal new cards" button deals a fresh hand. The person getting the lighter is shown at the top; tap them to change your pick.

## v0.4.0 - 2026-10-19

From John's "Improvements V2" list (the items that work on one shared phone).

- Several games at once: the home screen lists games in progress with their status (whose turn, voting, finished) and finished games with their recap. Games are saved on the phone after every move.
- A home button at the top left of every game screen. Leaving mid-turn or mid-vote hides the screen again, so the game resumes with a hand-off.
- A lighter counter at the top right of every game screen shows how many times the current holder has had the lighter (out of 3) and opens the full history. During the game it shows who passed to whom; after the game it also shows every question and answer.
- The turn is now two steps: first pick who gets the lighter (your answer), then write the question for them.
- Voting: picked players get a green ring and a tick, and a button opens the full history with all questions and answers.

## v0.3.0 - 2026-10-19

From John's "Improvements V1" list.

- New game look: night-time gradient, game fonts, a drawn lighter with a flickering flame, bouncy buttons and pop-in animations, sound effects and vibration (sound can be turned off on the home screen).
- Player profiles saved on the phone: name, avatar and colour, with lifetime stats (games, lighters received, questions asked, comments, awards), trophies and 8 achievements.
- During the game every player's avatar shows how many times they got the lighter, and a History button shows who passed to whom, with the questions kept secret.
- A pool of 200 questions. Each turn suggests 5 at random, with a button for 5 new ones. No question repeats until the whole pool has been shown, even across games.
- After the game: every question is revealed, and players can react with emoji and post comments on each pass.
- Award voting: each game picks 5 random categories out of 14, the same for all players. Everyone votes in secret and cannot vote for themselves. The Lighter Champion (most lighters received; ties share it) is worked out automatically.
- Awards ceremony with a drumroll, falling trophies, confetti and a fanfare for each award.
- Final recap with tabs for awards, moments (questions, answers, reactions, comments) and stats, including achievements unlocked that game.

## v0.2.0 - 2026-10-19

- First playable version, on one shared phone that acts as the lighter.
- Player setup: 4 or more players with different names; a random player starts.
- Hand-off screen between turns so only the new holder sees their question.
- Each turn: read the secret question you were asked, answer it by picking who gets the lighter, then write them a new question (with sample questions to pick from).
- The game ends when a player gets the lighter for the third time: they answer the last question and every question and answer is revealed.
- Play again with the same players, or start over with new ones.
- Rules covered by tests (`npm test`).

## v0.1.0 - 2026-10-19

- Project skeleton: Expo (React Native, TypeScript) app for Android and iPhone.
- Placeholder title screen showing the app version.
