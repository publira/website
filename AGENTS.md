<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Skill packages

Entries in `.agents/skills/*` listed in `skills-lock.json` are vendored: `npx skills` overwrites them, and the maintenance bot in `publira/agents` runs `npx skills update -p -y` weekly and opens a pull request when there is a diff. Do not edit them; a patch is lost at the next update. Reading them for reference is fine. When this repository's policy and a skill disagree, this file wins. `.claude/skills/*` reaches the same skills through relative symlinks.
