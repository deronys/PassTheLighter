# Pass The Lighter: notes for Claude

@AGENTS.md

- **Every change goes `/ready` → `/start` → `/wrap`** (details in `Context.md`).
  - `/ready` plans and waits.
  - Code changes begin only when the user's message is exactly `/start`, which also creates the task branch from an up-to-date `main`.
  - `/wrap` reviews, checks and pushes.
- **Before planning or changing anything,** read `Context.md` (role, standards, project) and `docs/ARCHITECTURE.md` (code map).
- `Context.md` and `docs/ARCHITECTURE.md` are the single source for rules and structure. Keep them current in the same commit as the change, and don't repeat their content here.
