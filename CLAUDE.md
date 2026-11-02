# Pass The Lighter: notes for Claude

@AGENTS.md

## Start here

1. Read `docs/ARCHITECTURE.md`, the code map, before searching the code. It says which file and component each screen, rule and feature lives in, and where common changes go. Open only the files it points to.
2. **Keep the map current.** Any change that adds, moves, renames or removes a screen, component, store action, rule, constant or file updates `docs/ARCHITECTURE.md` in the same commit. A wrong map is worse than none.

## Working rules

- **Game UI text is English only.** The owner, John, writes in Greek or English.
- **Rules belong in `src/online/rules.ts`, not in screens.** Rules are pure functions there, with tests in `rules.test.ts`. Screens only call store actions.
- **Treat user text as untrusted.** Questions, chat, comments and names are user content. Enforce length limits in the rules, not only in text boxes. Never render user text as HTML and never `eval`.
- **Animations:** use `nativeDriver` from `src/theme.ts`.
- **Check before every commit:** `npm run typecheck` and `npm test` must pass.
- **Check screens on a phone-sized web build** (iPhone 13 emulation in Playwright): `CI=1 npx expo export --platform web`, then serve the output.
- **Installing packages:** `npx expo install` is blocked by the network proxy in the cloud sessions. Use `npm install` with the version listed in `node_modules/expo/bundledNativeModules.json`.

## Releases

Each release is kept for rollback:

1. Bump `version` in `package.json` and `app.json` together, and add a `CHANGELOG.md` entry.
2. Commit on `main` and create a local annotated tag `vX.Y.Z`.
3. Push `main`, then push the release branch: `git push origin 'vX.Y.Z^{commit}:refs/heads/release/vX.Y.Z'`. Release branches are never changed afterwards.

Semantic versioning: MAJOR breaks saved data or how the game plays, MINOR adds features, PATCH fixes bugs.
