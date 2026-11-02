---
name: pre-merge-review
description: Pass The Lighter's full code review before merging a branch. Covers correctness, architecture, security, tests, performance, accessibility, docs and release hygiene. Used by /wrap, or when asked to review the current branch.
---

# Pre-merge review

Review everything this branch changes against `origin/main`, the way a meticulous senior engineer would before approving a merge. The goal is to find real defects and fix them, not to write praise or style trivia. Follow `Context.md` for the standards. This file is the procedure.

## 0. Scope

```bash
git fetch origin main
git diff --stat origin/main...HEAD
git diff origin/main...HEAD
git log --oneline origin/main..HEAD
git status --porcelain
```

- **Uncommitted changes count too.** Review them and mention them.
- **Read every changed file in full, not only the diff.** A bug often sits in the unchanged lines next to the change. For each changed function, also read its callers (`rg -n "<name>" src App.tsx`).
- **Write down what the change is for in one sentence.** If you can't, the change is too broad: flag it.

## 1. Automated gates (must be green)

```bash
npm run typecheck
npm test
```

Then build the web version and drive every screen the change touches on a phone-sized viewport (Playwright, iPhone 13). Exercise the happy path, the edges and repeated taps. Look at the screenshots yourself. A failing gate is a blocker, whatever the review finds.

If the change adds or updates a dependency: `npm audit --omit=dev`, and compare the result with the known baseline in the security notes. Any new high or critical issue is a blocker.

## 2. Correctness

- **Does it do what was asked, completely?** Compare it with the request or the CHANGELOG entry. Nothing missing, nothing extra.
- **Edge cases:**
  - empty lists, one or two players;
  - the first and the final pass;
  - exactly at a limit and one past it;
  - a finished game, a deleted game, the user not being a player;
  - a fresh install and saved data from an older version (`upgrade()` in the store).
- **State:**
  - No mutation of state or rule inputs.
  - No stale closures: callbacks read the latest state where they must.
  - Effects have the right dependencies and clean up timers and listeners.
  - Nothing breaks if the 100 ms store tick fires mid-action.
- **Async:** promises are handled, errors are caught where the user would otherwise be stuck, and there is no race between a navigation and a state update.
- **Rule errors:** an invalid move throws in the rules, the store's `onGame` catches it, and the game stays unchanged.
- **Persistence:** a new saved field gets a default in `upgrade()`. A breaking change to saved data bumps `KEY` and adds the old key to `OLD_KEYS`.

## 3. Architecture and design

- **Layering holds.** Rules are pure, in `rules.ts`, with time passed in. Screens only call store actions. No game rule lives in UI code.
- **No duplication.** It reuses existing helpers, kit components and constants instead of re-implementing them. Search before accepting a new helper.
- **Placement matches `docs/ARCHITECTURE.md`.** A new thing goes in the file the map says it belongs in, and the map is updated in the same branch.
- **Simplest design that works.** No speculative abstraction, no options nobody uses, no dead code, no commented-out code, no leftover debug logging.
- **Types are precise.** No `any`. Every `as` cast and `!` is justified. Unions model the states, and the types exported are only the ones other files need.
- **Naming and comments.** Names use the game's own words. Comments say why, at the same density as the surrounding code. No stale comments survive the change.

## 4. Security

- **User text is untrusted:** questions, chat, comments, names and photo data. Lengths are enforced in the rules. Nothing renders it as HTML or puts it into a URL, `eval` or a style. No new network calls.
- **Authorization is checked in the rules,** not only by hiding a button: who may pass, burn, comment, react, vote, end the game or see a hidden question.
- **Hidden information stays hidden.** A question is only shown where `canSee` allows. Check the new screens, toasts and accessibility labels too.
- **Permissions:** no new native permission or plugin without a need, and `app.json` stays minimal.
- **No secrets, tokens or personal data** in code, logs, test fixtures or commit messages.
- **Dependencies:** new packages are justified, pinned to the SDK, and from a trusted source.

## 5. Tests

- **Every rule change has a unit test,** and every bug fix has a regression test that fails without the fix. Run it mentally against the old code.
- **Tests are deterministic** (no real clock or unseeded randomness) and assert behaviour, not implementation.
- **Changes the unit tests can't reach** (layout, gestures, animations) have a recorded Playwright check: what was clicked or swiped and what was seen.

## 6. Performance and platform

- **No extra re-renders on the 100 ms store tick.** Expensive values are memoized only where it is measurable. No state set on every frame when nothing changed.
- **Animations** use `nativeDriver` from `theme.ts`. Gestures work with touch in phone browsers and in the native app.
- **The bundle doesn't grow without reason.** Check the size of `_expo/static/js/web/*.js` before and after, and keep images and base64 data compressed.
- **Web-only code** sits behind `Platform.OS === 'web'`, with a comment saying why.

## 7. UX and accessibility

- **Game UI text is English** and matches the designs' tone.
- **Pressables have a role and a label.** Tap targets are about 44 px. Text fits at 320–430 px widths with no truncation of key labels.
- **Nothing is covered.** No overlay sits on a button, and screens with a keyboard keep the action visible.

## 8. Docs and release hygiene

- **Updated in the branch where relevant:**
  - `docs/ARCHITECTURE.md`, if anything was added, moved, renamed or removed;
  - `Context.md`, if a project rule or decision changed;
  - `README.md`, if how to play or run the game changed;
  - a `CHANGELOG.md` entry, if this will be released.
- **Commits** are focused, with imperative subjects and a reason in the body. Nothing unrelated, generated or secret is committed. Check `git status` and `.gitignore`.

## 9. Findings and fixes

For each finding, write `file:line`, what is wrong, a concrete failing scenario, and the fix. Give it a severity:

- **Blocker:** wrong behaviour, a security issue, data loss, a failing gate, or a missing test for a rule change or bug fix.
- **Should fix:** a design or maintainability problem with a real cost.
- **Nit:** optional polish. Keep these few.

Verify each finding before reporting it: reproduce it, or point to the exact lines that prove it. Drop anything you can't support.

Then fix every Blocker and Should fix on the branch. Re-run section 1 after the fixes, and repeat the review of the changed parts until no Blocker or Should fix remains. Leave Nits to the user unless they are trivial.

## 10. Report

End with a short report:

- **Verdict:** "Ready to merge", or "Not ready" and why.
- **What was checked:** gates with results, screens exercised, `npm audit` if run.
- **Findings fixed:** one line each.
- **Findings left open:** with severity and the reason.
