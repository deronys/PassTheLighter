# Pass The Lighter: notes for Claude

@AGENTS.md

- **Start every session with `/ready`.** It reads `Context.md`, the role, engineering standards and project context, plus `docs/ARCHITECTURE.md`, the code map, and checks the git branch is safe to work on. If `/ready` wasn't run, read both files before any change.
- **Finish every task with `/wrap`.** It runs the pre-merge review (`.claude/skills/pre-merge-review/`), the checks, and pushes the branch.
- `Context.md` and `docs/ARCHITECTURE.md` are the single source for rules and structure. Keep them current in the same commit as the change, and don't repeat their content here.
