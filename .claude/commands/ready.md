---
description: Plan a change before any code - restate the ask, ask about unclear points, check designs and rules, find the files, give a plain-words plan, then wait for /start.
argument-hint: <the change or idea>
---

The request to plan: $ARGUMENTS
(If it is empty, use the user's latest change request or idea in the conversation.)

This is the planning step. **Don't edit any file, create a branch, or run anything that changes state.** Reading files and running read-only commands is fine.

## 1. Load the context

Read all of `Context.md`, then all of `docs/ARCHITECTURE.md`. Skip this only if both were already read in this session and haven't changed since.

## 2. Understand the ask

- Restate the request in one or two sentences, in the user's words.
- List everything that is unclear or could be read two ways, as short questions. Put a recommended answer on each, so the user can just say yes.
- Ask nothing that the designs, `Context.md` or the code already answer.

## 3. Check it against what is already decided

- **John's final designs**, where they're available: the project's `designs/final/` folder and `Screens_Flow_revised.md`. Say whether the request matches them, changes them, or isn't covered.
- **John's rules and decisions** in `Context.md` (English UI, no take-backs, final pass without a question, future ideas not to be built yet...). Flag any conflict plainly.

## 4. Locate

Use the map to name the exact files and components involved. Open them only as far as needed to make the plan accurate.

## 5. The plan, in plain words

Write for John, not for a developer. No code.

- **What changes,** as the player will see it.
- **What does not change.** Name anything a player might expect to be affected.
- **Files** to touch, one line each.
- **Side effects and risks:** saved data, other screens, bots, performance. Include security (user text, who is allowed to act, hidden questions).
- **How it will be tested:** unit tests for rules, and phone-sized screen checks for UI.
- **Version:** patch (a fix) or minor (a new feature), and why. Major only if saved data or the game's rules break.

For a tiny change (a word, a colour, a spacing), keep the whole plan to 2–3 lines.

## 6. Wait

End with exactly this, in the user's language: the open questions if any, then

> Send **/start** on its own to begin.

Then stop. **Don't write code until the user sends a message that is only `/start`.** Answers to the questions update the plan, and you show the updated plan again. Any other wording, such as "start", "go", "ok" or "do it", even inside a sentence, is not approval.
