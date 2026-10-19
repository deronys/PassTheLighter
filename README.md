# Pass The Lighter

A party game for Android and iPhone, built with [Expo](https://expo.dev) (React Native, TypeScript) from a single codebase.

## How to play

Each player plays on their own phone, online with their friends. This build is a demo: the friends are computer players and the ads are pretend, so it can be tried before real accounts are connected.

1. Sign in, then create a game and invite at least 3 friends. The game starts once at least 4 players accept (up to 12). The host holds the lighter first.
2. Whoever holds the lighter passes it to a friend and asks them a secret question, written by them or suggested with the yellow ? coin. Only that friend can read it.
3. The friend answers by passing the lighter to the person who is their answer, never saying why, and asks them a new question.
4. Everyone else sees only "Question hidden". Watching an ad burns a hidden question and reveals it. "Learn why" shows the question that got the lighter passed to you.
5. If a friend sits on the lighter, the player who passed it can take it back (after 30 seconds in the demo).

The screens follow John's final designs and `Screens_Flow_revised.md`.

## Where things live

- `src/online/rules.ts`: the online game rules, as pure functions (`rules.test.ts` tests them).
- `src/online/demo.ts`: the demo server: friends, sample games and the computer players' moves. `src/online/store.tsx` keeps that state on the phone and gives the screens their actions. A real backend (Firebase, Facebook and Google sign-in, AdMob) will sit behind the same actions.
- `src/nav.tsx`: the screen stack. `src/screens/`: Entry (welcome, how to play, login, menu), Lobby (game list, invite, waiting room), Play (pass, ask, game status), Reveal (burn, game progress, ad) and Extras (settings, friends).
- `src/ui/kit.tsx`: the painted header, comic buttons, speech bubbles, hidden ticket and the rest. `assets/art/`: art cut from the designs.
- `src/data/questions.ts`: the 200 suggested questions.

## Run it

```bash
npm install
npx expo start
```

Check your changes with `npm run typecheck` and `npm test`.

Scan the QR code with the Expo Go app on an Android phone or iPhone.

## Versions and rollback

Every release is saved on GitHub as a branch named `release/` plus its semantic version (`release/v0.1.0`, `release/v0.2.0`, ...), and each one is listed in [CHANGELOG.md](CHANGELOG.md). Release branches are never changed after they are created. Each release also has a git tag of the same version (`v0.1.0`), once it can be pushed.

- `MAJOR` changes break saved data or the way the game plays.
- `MINOR` adds features.
- `PATCH` fixes bugs.

The version lives in `package.json` and `app.json` (`expo.version`); both are bumped together with each tag.

To look at or rebuild an older version:

```bash
git checkout release/v0.1.0
```

To roll `main` back to an older version while keeping the history:

```bash
git revert --no-commit release/v0.1.0..HEAD
git commit -m "Roll back to v0.1.0"
```
