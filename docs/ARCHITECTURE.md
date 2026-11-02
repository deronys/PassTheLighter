# Pass The Lighter: code map

Where every part of the game lives, so a change starts in the right file. Names (components, functions, constants) are used instead of line numbers, which go stale. Search for the name inside the file.

**Keep this map current.** Any change that adds, moves, renames or removes a screen, component, store action, rule or constant updates this file in the same commit.

## How the app fits together

```
App.tsx                  fonts, providers, the route switch (render()), the toast banner
 ├─ StoreProvider        src/online/store.tsx   all game state + actions, saved on the phone
 └─ NavProvider          src/nav.tsx            screen stack: push / replace / back / backWith / reset
      └─ screens         src/screens/*.tsx      read state with useStore(), move with useNav()
           └─ ui kit     src/ui/*.tsx           shared look: Screen, ComicButton, Avatar, bubbles...
```

- **Data flow:** a screen calls a store action (e.g. `pass(gameId, to, question)`). The action calls a pure rule in `rules.ts`, which returns a new `Game`. The store saves it with AsyncStorage and every screen re-renders. A rule that throws is caught in the store's `onGame` helper, and the game stays as it was.
- **The bots** live in `demo.ts`. The store's clock runs every 100 ms and calls `tick()`, which makes bots accept invites, pass the lighter, chat, comment and vote. With `settings.manualBots` on (the default), bots only pass when you tap the "Make X play" button (`screens/DevBot.tsx`, store action `botMove`).
- **No server yet.** Every rule runs on the phone. A real backend will sit behind the same store actions, so screens won't need to change.

## Folder map

| Path | What is in it |
|---|---|
| `App.tsx` | Loads fonts, wraps providers, maps each route name to its screen in `render()`, shows the "passed you the lighter" `Toast` (`TOAST_MS`). |
| `src/nav.tsx` | `Route` union (every screen and its params), `NavProvider`, `useNav()`. |
| `src/online/rules.ts` | Pure game rules and the data model. No React. |
| `src/online/rules.test.ts` | Unit tests for the rules (`npm test`). |
| `src/online/demo.ts` | Demo "server": demo friends, seeded games, bot moves, player stats. |
| `src/online/store.tsx` | `StoreProvider`/`useStore()`: state, saving, bot clock, toast, all actions. |
| `src/screens/` | One file per area of the game (table below). |
| `src/ui/kit.tsx` | Shared visual components and the `art` image list. |
| `src/ui/PlayerPicker.tsx` | "PASS IT TO..." drag carousel. |
| `src/ui/QuestionDeck.tsx` | Swipeable suggested-question cards. |
| `src/ui/PhotoInput.tsx` | "Add photo" button that opens the gallery (invisible file input on web, image picker on phones). |
| `src/photo.ts` | Photo reading, shrinking (`SOURCE_MAX` 1024 px) and cropping (`SIZE` 256 px). |
| `src/theme.ts` | `colors`, `fonts`, `comicShadow`, `nativeDriver`. |
| `src/feedback.ts` | Sounds (`play()`, `SOURCES`), mute, haptics (`buzz()`). |
| `src/deck.ts` | Shuffle and draw-without-repeats (used for question ideas). |
| `src/data/questions.ts` | `QUESTIONS` (200), `QUESTION_CATEGORIES`, `categoryOf()`. |
| `src/data/awards.ts` | `AWARD_CATEGORIES` (adding one makes it eligible in games), `findCategory()`. |
| `src/data/demoPhotos.ts` | `DEMO_PHOTOS`: base64 portraits of the 16 demo friends. |
| `src/data/avatarChoices.ts` | `AVATAR_CHOICES`: 18 base64 portraits for Settings > AVATAR. |
| `assets/art/` | Art cut from the designs (`background`, `header`, `logo`, `lighter-burst`, `hand-lighter`, `flame`). Registered in `art` in `kit.tsx`. |
| `assets/sounds/` | `tap`, `pop`, `boom`, `drumroll`, `fanfare` (made by `scripts/make-sounds.py`). |
| `app.json` | Expo config: name, version, icons, image-picker plugin (camera and microphone permissions off). |
| `CHANGELOG.md` | One entry per release. |
| `Context.md` | Role, engineering standards, workflow and project context. Read by `/ready` before planning. |
| `CLAUDE.md`, `AGENTS.md` | Loaded automatically by Claude Code. Short pointers plus generic Expo guidance. |
| `.claude/commands/ready.md` | `/ready`: loads `Context.md` and this map, plans a change in plain words, waits for `/start`. No edits. |
| `.claude/commands/start.md` | `/start` (only when sent alone): updates `main`, creates a descriptive task branch, checks it is clean, builds the approved plan. |
| `.claude/commands/wrap.md` | `/wrap`: runs the pre-merge review, fixes, checks, commits and pushes the branch. |
| `.claude/skills/pre-merge-review/SKILL.md` | The pre-merge code review checklist. |

## Screens: route → component → file

| Route (`nav.tsx`) | Component | File | What the player sees |
|---|---|---|---|
| `splash` | `Splash` | `Entry.tsx` | Logo for `SPLASH_MS` |
| `tutorial` | `Tutorial` | `Entry.tsx` | How to play, 4 pages in `TUTORIAL` |
| `login` | `Login` | `Entry.tsx` | Pretend Facebook/Google sign-in |
| `menu` | `MainMenu` | `Entry.tsx` | PLAY, FRIENDS, HOW TO PLAY, gear for Settings |
| `games` | `GameList` | `Lobby.tsx` | Your games, X with the leave/end confirm modal, CREATE GAME |
| `invite` | `InviteFriends` | `Lobby.tsx` | Pick friends, then the name modal with "lighters to end" (3–6) |
| `game` | `GameScreen` | `Play.tsx` | Switches on `roleOf()` (below) |
| `ask` | `AskQuestion` | `Play.tsx` | Write the question, or pick from `QuestionDeck` |
| `burn` | `BurnQuestion` | `Reveal.tsx` | Burn a hidden question with an ad, `RevealPopup` |
| `progress` | `GameProgress` | `Reveal.tsx` | History: numbered `Round` cards |
| `ad` | `Advertisement` | `Reveal.tsx` | Pretend ad (`AD_MS`, `NO_AD_CHANCE`) |
| `chat` | `Chat` | `Chat.tsx` | Per-game chat |
| `comments` | `Comments` | `End.tsx` | Comments on one round |
| `vote` | `Vote` | `End.tsx` | Vote in the award categories |
| `results` | `Results` | `End.tsx` | Awards, champion, "N votes · Click to see" |
| `settings` | `Settings` | `Extras.tsx` | Photo (ADD PHOTO / AVATAR / ADJUST / Remove), toggles, MY PROFILE, HOW TO PLAY, RESET DEMO, LOG OUT |
| `friends` | `Friends` | `Extras.tsx` | Friend list → Profile |
| `profile` | `Profile` | `Extras.tsx` | Games played, champion count, awards |
| `photo` | `PhotoCrop` | `PhotoCrop.tsx` | Drag and zoom the photo in the frame |

**Inside `GameScreen`** (`Play.tsx`), by `roleOf(game, me)` in `rules.ts`:

| Role | Component | File |
|---|---|---|
| `invited`, `waiting` | `WaitingRoom` | `Lobby.tsx` |
| `starter`, `holder` | `HolderScreen` (banner, question, `PlayerPicker`, HISTORY + PASS!) | `Play.tsx` |
| `lastPasser` | `PlayerStatus` | `Play.tsx` |
| `watcher` | `GameStatus` | `Play.tsx` |
| `finished` | `GameOver` (first `EndIntro`, then rounds with `Reactions`) | `End.tsx` |

Shared pieces used by screens: `Round` and `FinalPass` (`Round.tsx`, one round = a question pass plus the next pass as its answer), `useGameBar()` (`gameBar.ts`, the lighter badge and chat button props for `Screen`), `BotMoveButton` (`DevBot.tsx`).

## The rules (`src/online/rules.ts`)

- **Limits:** `MIN_PLAYERS` 4, `MAX_PLAYERS` 12, `LIGHTERS_TO_END` 3 (the host can choose 3–6: `MIN_LIGHTERS_TO_END`, `MAX_LIGHTERS_TO_END`), `CATEGORIES_PER_GAME` 5, `INVITE_WINDOW_MS`, `MAX_QUESTION` 140, `MAX_CHAT` 200, `MAX_COMMENT` 140, `REACTIONS` / `MORE_REACTIONS`.
- **Model:** `User`, `Seat`, `Pass` (from, to, question), `ChatMessage`, `Comment`, `Reaction`, `Game` (status `waiting` | `active` | `finished`).
- **Game flow:** `createGame` → `respond` → `startGame` → `passAndAsk` (repeat) → the game finishes on the final pass (`isFinalPass`, `lastHolder`) or the host's `endGame`.
- **Who sees what:** `canSee`, `reasonIndex` ("Learn why"), `canBurn` / `burn`, `roleOf`, `visibleTo`, `removeFor`.
- **Counting:** `receives` (lighters per player, the host's start counts as 1), `lightersToEnd`, `ordinal`.
- **After the game:** `sendChat`, `addComment`, `toggleReaction`, `pickCategories`, `castVotes`, `everyoneVoted`, `results`.

## The store (`src/online/store.tsx`)

- **Saved state:** `DemoState` (from `demo.ts`) under storage key `KEY` (`ptl.demo.v4`).
  - **Demo reset for everyone:** bump `KEY` and add the old key to `OLD_KEYS`.
  - **New saved field:** give it a default in `upgrade()`.
- **Actions** (`Store` type): `signIn`, `signOut`, `finishTutorial`, `setSettings`, `resetDemo`, `create`, `respond`, `start`, `pass`, `burn`, `remove`, `chat`, `seeChat`, `comment`, `vote`, `setPhoto`, `react`, `seeEnd`, `botMove`. Lookups: `me`, `user(id)`, `game(id)`, `toast`.
- **Settings:** `Settings` type in `demo.ts` (`sound`, `notifications`, `manualBots`). The toggles are in `Settings` in `Extras.tsx`.

## Demo data (`src/online/demo.ts`)

- **Friends:** `DEMO_FRIENDS`, with `photo` from `DEMO_PHOTOS`.
- **First run:** `newDemo()` and `signIn()` create the starting state and seeded games.
- **Bots:** `tick()` drives them. It uses `BOT_MOVE_MS` (10 s), `botHolds`/`botPass`, `botChat` (`CHAT_LINES`), `botWrapUp` (comments `ROASTS`, votes) and `chance()` (deterministic randomness).
- **Profiles:** `playerStats()` gives the numbers for `Profile`.
- **Toast:** `newlyPassedToYou()` decides when it shows.

## Where to change common things

| Change | Go to |
|---|---|
| Game rule or limit (players, lighters to end, text lengths) | Constants at the top of `rules.ts`, and add a test in `rules.test.ts` |
| Wording or layout of one screen | That screen's component (tables above) |
| Look shared by many screens (header, buttons, avatars, bubbles, chat button) | `ui/kit.tsx` (`Screen`, `ComicButton`, `Avatar`, `SpeechBubble`, `ChatButton`...) |
| Colours or fonts | `theme.ts` |
| Choosing who gets the lighter | `ui/PlayerPicker.tsx` (`SLOT`, `CENTER`, `SIDE`), used by `HolderScreen` in `Play.tsx` |
| Question ideas: list | `data/questions.ts`. Cards: `ui/QuestionDeck.tsx`. How many first: `FIRST_IDEAS` in `Play.tsx` |
| Awards | `data/awards.ts`. Voting screen: `Vote`. Results screen: `Results` (both in `End.tsx`) |
| End of game, reactions, comments | `End.tsx` (`EndIntro`, `GameOver`, `Reactions`, `Comments`) |
| History / rounds | `Round.tsx`, `GameProgress` in `Reveal.tsx` |
| Hidden questions, burning, ads | `Reveal.tsx`, plus `canBurn`/`burn` in `rules.ts` |
| Bot behaviour or timing | `demo.ts` (`tick`, `BOT_MOVE_MS`) |
| Profile photo | `ui/PhotoInput.tsx`, `photo.ts`, `PhotoCrop.tsx`, photo panel in `Settings` |
| Sounds | `feedback.ts`, `assets/sounds/` |
| New screen | Add to `Route` in `nav.tsx`, add a case to `render()` in `App.tsx`, and put the component in the matching `screens/` file |
| New store action | `Store` type and the action object in `store.tsx`, plus the pure rule in `rules.ts` |
| Tutorial pages | `TUTORIAL` in `Entry.tsx` |

## Platform notes

- **One codebase for Android, iPhone and web.** The web build is what the playable link runs.
- **Web-only branches:** `Platform.OS === 'web'` checks are in `photo.ts`, `PhotoInput.tsx` and the `touchAction` style in `PlayerPicker.tsx`.
- **Animations:** use `nativeDriver` from `theme.ts` for `useNativeDriver`, never a literal `true`, because the web has no native driver.
- **Gestures:** `PlayerPicker` uses plain touch events (`onTouchStart` / `onTouchMove` / `onTouchEnd`). These work in phone browsers and in the app. `QuestionDeck` and `PhotoCrop` use `PanResponder`.
- **Scrolling:** `Screen` scrolls its body by default. The chat button floats over it, so `chatRoom` adds bottom padding so content can scroll clear of it.
