# Agent Instructions For `todo-app`

All agents working in this repository should treat `.github/copilot-instructions.md` as the primary source of truth for architecture, conventions, and workflow.

## Required Behavior

- Load and follow `.github/copilot-instructions.md` before broad codebase exploration.
- Do not scan the entire repository on each prompt.
- Read only the smallest relevant set of files for the current task.
- Preserve the existing layering and patterns unless explicitly asked to change them.

## Scope

This `AGENTS.md` applies to the full monorepo:

- `todo-backend/`
- `todo-frontend/`
- root compose and solution files

If any instruction here conflicts with `.github/copilot-instructions.md`, prefer `.github/copilot-instructions.md`.
