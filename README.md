# Publira Website

The public site for [Publira](https://github.com/publira/publira), the open-source multi-tenant publishing platform. It introduces the platform and the two libraries that grew out of it, [`publira/comic-viewer`](https://github.com/publira/comic-viewer) and [`publira/epub`](https://github.com/publira/epub).

Built with Next.js (App Router), React, and Tailwind CSS.

## Getting started

```bash
pnpm install
pnpm dev
```

The site is then served on `http://localhost:3000`. A Dev Container definition is included and provisions the toolchain for you.

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Produce the production build and type-check the project |
| `pnpm start` | Serve a production build |
| `pnpm check` | Verify formatting and lint rules with [Ultracite] (oxfmt + oxlint) |
| `pnpm fix` | Apply the formatting and lint fixes `pnpm check` reports |

`pnpm install` also installs the [lefthook] git hooks, so committing formats the staged files with oxfmt and commits the result. It reformats nothing you have left unstaged, and `git commit --no-verify` skips it. Lint rules and the type check are not part of the hook: run `pnpm check` and `pnpm build` before opening a pull request. `pnpm build` is what runs the TypeScript compiler, so a type error surfaces there rather than in `pnpm check`.

[Ultracite]: https://www.ultracite.ai/
[lefthook]: https://lefthook.dev/

## Project structure

```
app/          Routes, layouts, and the global stylesheet
components/   Presentational building blocks
lib/          Content and data shared across components
assets/       Images imported by the code
```

## Subpath imports

Modules are addressed through the `imports` field of `package.json` rather than by relative path:

```ts
import { CodeBlock } from "#components/code-block";
import { hostScreenshots } from "#lib/screenshots";
import cover from "#assets/screenshots/01-host-catalog-top.png";
```

`#components/*` and `#lib/*` map to targets that carry an explicit extension. TypeScript does not probe for extensions when it resolves a subpath import, so leaving them off resolves under Turbopack but fails type-checking with `TS2307`. `#assets/*` needs none, because the importing side already writes one.

## Images

Images are imported from `assets/` rather than served from a `public/` directory, so that Next.js derives their intrinsic size and blur placeholder at build time.

Screenshots of the platform come from the development seed data that ships with its repository, and the site says so where it shows them. Never present seeded records as a real publisher's catalog.

## Styling

Colors, fonts, and spacing come from the Tailwind theme tokens declared in `app/globals.css`, and the palette follows the product's own. Add a new value as a token there rather than as a one-off hex in a class.

## Writing for the site

Write about Publira at the level someone deploying or evaluating it would see. The platform's own README is written for contributors, so content taken from it needs that filter rather than being transcribed:

- Name the requirement, not the local stand-in. A deployment substitutes its own services for the ones development brings up, so say "S3-compatible object storage" and "an SMTP relay".
- Leave out internal port numbers. Nobody operating the platform thinks in them.
- Leave out Dev Container specifics. They are setup mechanics for contributors, not properties of the product.

## License

[Apache License 2.0](LICENSE).
