# Changelog

All notable changes are listed here. Versions follow [Semantic Versioning](https://semver.org).

## v0.15.0 - 2026-10-29

Changes from John's "Improvements New Version V7".

- Question ideas: no more "Use it" and "New cards" buttons. Swipe (or tap the arrows) for a new idea, endlessly: every question shows once before any comes back. Double-tap the card to use it. A note under the card says so.
- Game status screens: the History button at the bottom is gone. "Check game status" opens the game's history.
- Bug fix: "Add photo" did nothing on a phone. The picker now opens the gallery with a real tap on phone browsers.
- Bug fix: you can only burn the question that got you the lighter. Other players' hidden questions stay hidden until the end.

## v0.14.0 - 2026-10-29

- Test mode for development: "Bots wait for me" in Settings (on by default). A bot with the lighter only passes it when you tap "🤖 Make … play". The button shows on its game in the game list, in Game Progress and on the game status screens. Chat, comments, reactions and votes stay automatic. Turn it off to have bots play on their own after 10 seconds again.
- The demo starts over with fresh test games (older saves are deleted).

## v0.13.0 - 2026-10-29

Changes from John's "Improvements New Version V6", plus the How to play change from V5.

- History and reveal: the question box sits next to the two players' names instead of under them.
- Smaller emoji reactions, on one row with the 💬 comment button.
- Tapping X on a game in the game list asks "Are you sure?" first. For the host of a running game it warns that the game ends for everyone.
- When the player you're about to pass to is one lighter away from the end, the message says so: "Dimitris already has 2 lighters. If you pass it to Dimitris, the game ends and all secrets are revealed!"
- The host picks how many lighters end the game (3 to 6) when creating it. The waiting room shows the choice, and every "3 times" or "3rd lighter" text follows it.
- How to play no longer has the "Burn the question" page (from V5).

## v0.12.0 - 2026-10-20

Changes from John's "Improvements New Version V4". The demo starts over with fresh test games (older saves are deleted).

- Game Progress and the reveal show each round in three steps, top to bottom: who asked whom, the question, then who that person gave the lighter to. For example "Kristen asked Claire", the question, "Claire gave the lighter to Eleni".
- Bug fix: the host's question in the first round now shows. Round 1 reads "Dimitris started the game and asked Scarlet" with the question under it.
- Under each round in the reveal: the emoji reactions and the comment button. The preview of the latest comment is gone.
- More emoji: the + button after the quick reactions opens 48 more. Emoji someone picked show on that round with their count.
- Voting Results: each award's vote count says "Click to see" and opens who voted for whom in that award. The separate "See who voted for who" section is gone.
- Player profiles: tap a friend in Friends, or "MY PROFILE" in Settings, to see games played, how many times they were Lighter Champion and every award they won.
- No more stars in the invite list: each friend shows how many games they have played. The Friends screen shows it too.

## v0.11.1 - 2026-10-20

- The lighter in a star burst (on "You got it!", the pass banners and next to the player who has the lighter) was cut off on the left. It is cut again from the final design, whole and with a clean edge.

## v0.11.0 - 2026-10-20

Changes from John's "Improvements New Version V3".

- When a game ends, a "The lighter went out!" screen says the game is over and the secrets are about to be revealed, before the reveal itself.
- The reveal shows who gave the lighter to whom (for example Claire → Dimitris), with a small lighter above the arrow and the question that made them pick that person.
- React to each move with an emoji right in the reveal, without opening the comments. A tip at the top says you can react or comment.
- After you vote, the button says "VOTING RESULTS". The results have "SEE WHO VOTED FOR WHO", which lists every ballot per award.
- The player you pick when voting gets a green box and a tick.
- New lighter icon in the top right corner, no longer cut off on the left.
- Demo players take exactly 10 seconds per move.
- With the lighter, the screen has two buttons: HISTORY and PASS!.
- Without the lighter, tapping a game in the game list opens that game's history.
- After picking a profile photo, a new screen lets you drag and zoom it inside the profile frame and choose the final cut. "ADJUST" in Settings reopens it at any time.

Fixes from the security check:

- The Android app no longer asks for microphone and camera access. The photo picker added them by default, but the game only needs your photo library.
- A move the rules refuse (for example a double tap right as a game ends) is ignored instead of being able to crash the app.
- A double tap on the final pass no longer skips the "The lighter went out!" screen.
- Only players can comment or react, and over-long questions, chat messages and comments are refused by the rules, not only by the text boxes.
- Cropping a photo can never ask for a square past the picture's edge.

## v0.10.3 - 2026-10-20

- Removed the pass and flick sounds completely. Passing the lighter and the main buttons (Play, Create Game, Pass and Ask, Burn It, Vote Now and others) are silent until new sounds are chosen.

## v0.10.2 - 2026-10-20

- New sounds for passing the lighter (three quick rising bell notes instead of a whoosh) and for the main buttons (a bright "ding-ding" instead of a lighter hiss). John didn't like the hiss and whoosh.

## v0.10.1 - 2026-10-19

- The pass that gives someone their 3rd lighter has no question: the button says "FINAL PASS!" and the game ends at once. The final pass shows as "3rd lighter. Game over!" in the reveal and the history.
- Game Progress of a finished game says "The game is over" instead of showing who had the lighter.

## v0.10.0 - 2026-10-19

Changes from John's "Improvements New Version V2".

- The game ends when someone gets the lighter for the third time (bug fix).
- At the end every question is revealed to everyone, numbered in order, and players can comment on each one (one-tap roasts or their own words).
- Voting in 5 random award categories, the same for everyone in a game. Players can't vote for themselves. The Lighter Champion is whoever got the most votes in total.
- A chat for each game, open in every phase: waiting room, while playing and after the game. The chat button shows unread messages.
- The top right corner shows a lighter with how many times you got it in that game. Tap it for the game's full history. The game list shows your lighters per game too, and "VOTE NOW!" on games waiting for your vote.
- Profile pictures: add, change or remove yours in Settings.
- How to play has a new last page about the end of the game.
- The demo starts over with fresh test games, including a finished game to try the reveal, comments and voting right away. Demo friends chat back, comment and vote on their own.

## v0.9.0 - 2026-10-19

Changes from John's "Improvements New Version V1".

- How to play no longer mentions ads, and it only shows the first time the game is opened.
- No countdown timer in the waiting room.
- Suggested questions are back on the Ask a Question screen as swipeable idea cards (Use it, New cards), under your own question.
- Removed the ad banner from the Game List and Game Progress.
- Game Progress numbers each pass in order. When you hold the lighter its top banner says "You have the lighter. Click to pass it" and takes you to pass it.
- After passing, the lighter can't be taken back: "Take it back" is now "Check game status".
- Demo friends answer invitations in 1 to 3 seconds and pass the lighter in 2 to 4 seconds.
- Fixed: the friend list on Invite Friends couldn't be scrolled on a phone.
- Fixed: on a phone the Ask a Question button rose with the keyboard and covered the text box. It now sits right under the question.

## v0.8.2 - 2026-10-19

- The ad banner is back on Game Progress (John wants to keep it).

## v0.8.1 - 2026-10-19

- Removed the ad banner from Game Progress. It was not in the design; the banner stays only on the Game List, where the design has it.

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
