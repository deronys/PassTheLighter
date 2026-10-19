# Pass The Lighter

A party game for Android and iPhone, built with [Expo](https://expo.dev) (React Native, TypeScript) from a single codebase.

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with the Expo Go app on an Android phone or iPhone.

## Versions and rollback

Every release is a git tag named with a semantic version (`v0.1.0`, `v0.2.0`, ...), and each one is listed in [CHANGELOG.md](CHANGELOG.md).

- `MAJOR` changes break saved data or the way the game plays.
- `MINOR` adds features.
- `PATCH` fixes bugs.

The version lives in `package.json` and `app.json` (`expo.version`); both are bumped together with each tag.

To look at or rebuild an older version:

```bash
git checkout v0.1.0
```

To roll `main` back to an older version while keeping the history:

```bash
git revert --no-commit v0.1.0..HEAD
git commit -m "Roll back to v0.1.0"
```
