---
description: Finish the task - run the pre-merge review, fix what it finds, run the checks, commit and push the branch.
---

Wrap up the work on the current branch. Do the steps in order.

## 1. Guard

- Run `git branch --show-current`. If it is `main`, **stop**: work must be on a task branch (`/start` creates one).
- Run `git fetch origin main`. If `origin/main` has moved since the branch was cut (`git rev-list --count HEAD..origin/main` > 0), rebase on it before reviewing: `git rebase origin/main`. Resolve conflicts carefully. If they are not trivial, stop and ask.

## 2. Review

Run the pre-merge review in `.claude/skills/pre-merge-review/SKILL.md` on everything the branch changes, including uncommitted work.

How to run it depends on the size of the change. Measure it with `git diff --shortstat origin/main...HEAD` plus uncommitted changes.

- **Small change** (up to about 400 changed lines and 8 files, which is most tasks here): do the whole review yourself, in this session. You already have the context, and starting subagents would cost more usage than it saves on a codebase this size.
- **Large change** (more than that): split the review. Start 3 subagents in parallel with the Agent tool. Give each the branch name, the skill file to follow, the diff command, and the instruction to report verified findings only (`file:line`, scenario, fix), with no edits:
  1. correctness and tests (skill sections 2 and 5);
  2. architecture and performance (sections 3 and 6);
  3. security and UX (sections 4 and 7).

  Run section 1 (the gates) and section 8 yourself while they work. Then merge their findings, drop duplicates, and verify each finding yourself before acting on it. Only this session edits files.

## 3. Fix and re-check

- Fix every Blocker and Should fix, then re-run `npm run typecheck`, `npm test` and the Playwright checks for the touched screens.
- Repeat until the review finds no Blocker or Should fix.
- Make sure `docs/ARCHITECTURE.md` and `Context.md` match the final code.

## 4. Commit and push

- Stage only the files that belong to the task. Check `git status` and never commit secrets or generated output.
- Commit with an imperative subject line and a body saying why. Add the session's required attribution trailers.
- Push the branch with `git push -u origin <branch>`. Never force-push `main`. On a network error, retry up to 4 times with backoff (2s, 4s, 8s, 16s).
- Don't merge into `main` or cut a release unless the user asked for it. The release steps are in `Context.md`.

## 5. Report

Reply in the user's language, briefly:

- the review verdict and what was fixed;
- the checks run and their results;
- anything left open;
- the pushed branch.

Offer the next step: merge to `main` and release.
