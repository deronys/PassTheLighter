---
description: Approval to build the plan from /ready - update main, create a descriptive task branch, check it is clean, then implement.
allowed-tools: Bash(git status:*), Bash(git fetch:*), Bash(git switch:*), Bash(git pull:*), Bash(git branch:*), Bash(git rev-parse:*), Bash(git rev-list:*), Bash(git log:*)
---

The user approved the plan. This counts only when their message is **only** `/start`. If `/start` came inside other text, don't build: ask them to send `/start` on its own.

## 1. Check there is an approved plan

The plan is the latest one `/ready` gave in this conversation, including any answers since. If there is none, or open questions are still unanswered, stop and say so. Run `/ready` first.

## 2. Prepare the branch

```bash
git status --porcelain
git fetch origin main
git switch main
git pull --ff-only origin main
git switch -c <type>/<short-descriptive-name>
git status --porcelain
git rev-list --count origin/main..HEAD
```

**Stop and report, changing nothing else,** if any of these happens:

- **Uncommitted changes** at the start. List them and ask whether to commit them, stash them or drop them. Never drop them yourself.
- **`git pull --ff-only` fails,** because local `main` has diverged. Show `git log --oneline origin/main..main` and ask.
- **The new branch isn't clean,** or isn't exactly at `origin/main`.

**Branch name:** `<type>/<short-descriptive-name>`, where type is `feat`, `fix`, `chore` or `docs`. Use 2–5 lowercase words with hyphens that describe the change, for example `feat/swipe-player-picker` or `fix/chat-button-overlap`. If that branch already exists, pick a more specific name. Never reuse it.

## 3. Report and build

Say in the user's language: `Ready.`, the branch name, and the `main` commit it starts from (short hash and subject).

Then implement the approved plan, nothing more. Follow `Context.md`:

- tests for rule changes;
- phone-sized checks for UI;
- the map kept current.

If the work shows the plan must change in a way the user would notice, stop and explain. The changed part needs a new `/start`.

When the work is done, don't run `/wrap` on your own. **Always end that reply by asking whether to run it**, in the user's language (in Greek: «Να τρέξω το /wrap;»). Run it only when they say yes.
