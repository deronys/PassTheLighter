---
description: Start a session - check the branch is fresh and main is up to date, load Context.md and the code map, then report ready.
allowed-tools: Bash(git status:*), Bash(git fetch:*), Bash(git rev-parse:*), Bash(git branch:*), Bash(git rev-list:*), Bash(git merge-base:*), Bash(git log:*), Read
---

Get this session ready to work on Pass The Lighter. Do the steps in order and stop at the first failure.

## 1. Git safety gate

Run these and read the results. Don't change anything in this step.

```bash
git fetch origin main
git branch --show-current
git status --porcelain
git rev-parse main origin/main
git rev-list --count main..origin/main
git rev-list --count origin/main..HEAD
git merge-base --is-ancestor origin/main HEAD && echo based-on-latest-main || echo behind-main
```

**STOP**, and tell the user exactly which check failed and the command that fixes it, if any of these is true:

1. **On `main`** (or detached HEAD). Work happens on a task branch. Fix: `git switch main && git pull --ff-only && git switch -c <type>/<short-task-name>`.
2. **Local `main` is behind `origin/main`** (count > 0). Fix: `git switch main && git pull --ff-only`, then branch again.
3. **The branch doesn't include the latest `origin/main`** (`behind-main`). Fix: on a fresh branch, recreate it from the updated `main`. If it already has work, rebase it on `origin/main` (and say that is what you would run).
4. **The branch isn't new:** it already has commits that aren't on `origin/main` (count > 0). Say how many and list them with `git log --oneline origin/main..HEAD`, then ask whether to continue that work or start a new branch. Continue only if the user confirms.
5. **Uncommitted changes** (`git status --porcelain` not empty). List them and ask what to do with them.

Never run destructive git commands (`reset --hard`, `clean`, force push, branch deletion) yourself. Only suggest them, and only if needed.

## 2. Load the context

Read all of `Context.md`, then all of `docs/ARCHITECTURE.md`. Follow them for the whole session: role, standards, workflow, and the project's rules and decisions.

## 3. Report

Reply in the user's language, in a few lines:

- `Ready.` and the branch name, plus the latest `main` commit (short hash and subject).
- The current version (from `package.json`) and the last `CHANGELOG.md` entry title.
- One line confirming the role and the standards are loaded.

Then wait for the task.
