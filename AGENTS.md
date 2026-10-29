# Website Agent Guide

Repository-specific conventions for coding agents.

## Repository overview

`@publira/website` is the public site of Publira, served at the apex domain: the landing page, the pages that introduce the platform and the libraries that grew out of it, and the user documentation under `/docs`. It is a single Next.js (App Router) application, not a workspace.

- `app/`: the global stylesheet, the routes and layouts under `app/[locale]/`, and the Route Handlers for the documentation images and the GitHub webhook.
- `components/`, `lib/`, `assets/`: the presentational building blocks, the data they share, and the images the code imports.
- `i18n/`, `messages/`, `content/`: the locales and navigation helpers, one message catalog per locale, and the long-form Markdown documents, one directory per locale. The site is served in English at `/` and in Japanese, Korean, Simplified Chinese, and Traditional Chinese under a locale prefix; the URL alone decides the locale.
- `/docs` renders the documentation that `publira/publira` keeps under `docs/<locale>/`, fetched from GitHub and revalidated by that repository's webhook, so a documentation page is changed there, not here.

`README.md` is the reference: the commands, the project structure, how localization and the documentation routes work, and the environment variables. Do not repeat it here.

## Development commands

- `pnpm dev`: start the development server.
- `pnpm build`: produce the production build, which also type-checks the project.
- `pnpm check`: run the Ultracite lint and format checks (oxfmt and oxlint).
- `pnpm fix`: apply the Ultracite fixes.

Run `pnpm check` and `pnpm build` before committing. `.github/workflows/ci.yml` runs only `pnpm check`; the build, and with it the type check, runs in Vercel's deployment of each pull request. `pnpm install` also installs the lefthook pre-commit hook, which formats the staged files with oxfmt and stages the result; it does not lint or type-check.

## Language

Everything in the repository is **English**: `README.md`, this guide, code comments, test labels, commit messages, Issues, and pull requests. The site's own copy lives in `messages/*.json` and `content/<locale>/`, one file or directory per locale, and is the one place the other languages belong.

Answer the user in the language of their own prose. Quoted logs, code, or UI strings do not decide it. Answer in English when no user prose settles it, such as in a scheduled or CI-started run.

## Skill packages

Entries in `.agents/skills/*` listed in `skills-lock.json` are vendored: `npx skills` overwrites them, and the maintenance bot in `publira/agents` runs `npx skills update -p -y` weekly and opens a pull request when there is a diff. Do not edit them; a patch is lost at the next update. Reading them for reference is fine. When this repository's policy and a skill disagree, this file wins. `.claude/skills/*` reaches the same skills through relative symlinks.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
