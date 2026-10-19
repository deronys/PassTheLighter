# Pass The Lighter

A party game for Android and iPhone, built with [Expo](https://expo.dev) (React Native, TypeScript) from a single codebase.

## How to play

Everyone sits together and shares one phone, which is the lighter.

1. Enter the names of 4 or more players. A random player starts with the lighter.
2. The holder picks who gets the lighter and writes them a secret question about the others in the group.
3. The new holder reads the question and answers it by picking who gets the lighter next, without saying why. Then they write that player a new question.
4. When a player gets the lighter for the third time, they answer their question and every question and answer is revealed.

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
