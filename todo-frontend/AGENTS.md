<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Monorepo Instruction Inheritance

- This folder inherits shared repository agent policy from `../AGENTS.md`.
- Use `.github/copilot-instructions.md` at repo root as the primary architecture and workflow context.
- If local guidance in this file conflicts with root policy, prefer root policy unless a task is explicitly frontend-only and requires stricter Next.js behavior.
