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
app/          The global stylesheet, the routes and layouts under app/[locale]/,
              and the Route Handlers for docs images and the GitHub webhook
components/   Presentational building blocks
lib/          Data shared across components
i18n/         The locales, the navigation helpers, and the request configuration
messages/     Every string the site shows, one catalog per locale
content/      Long-form documents in Markdown, one directory per locale
assets/       Images imported by the code
proxy.ts      Serves a path without a locale prefix in English, docs included
mdx-components.tsx  The site's styles for the elements Markdown produces
```

## Localization

The site is served in English at `/`, and in Japanese, Korean, Simplified Chinese, and Traditional Chinese at `/ja`, `/ko`, `/zh-Hans`, and `/zh-Hant` through [next-intl]. The URL alone decides the locale: nothing is read from a cookie or `Accept-Language`, and nobody is redirected away from the page they asked for. The language menu in the header lists every locale, so adding one needs no change to the header. The locale reaches layouts, pages, and components as the `[locale]` root param (`next/root-params`), so every locale prerenders as static pages.

Components read their strings with `getTranslations` from `next-intl/server`. The root layout's `NextIntlClientProvider` passes Client Components the locale, which next-intl's `Link` and `useLocale` read, but not the catalog (`messages={null}`), so the messages never reach the browser. A Client Component takes the text it shows as props from the Server Component that renders it. Links within the site use `Link` from `#i18n/navigation`, so a change of locale is a client-side navigation.

[next-intl]: https://next-intl.dev/

## Documentation

`/docs` serves the user documentation that [publira/publira](https://github.com/publira/publira) keeps under `docs/en/`, laid out as its `docs/README.md` describes: `/docs/next/...` from `main`, and `/docs/vX.Y/...` from the highest `vX.Y.Z` tag of each minor version, with `/docs` redirecting to the newest. `lib/docs.ts` reads the tags, the trees, and the files through the GitHub API inside `"use cache"` functions, and `components/docs-content.tsx` compiles each page as plain Markdown with the styles in `mdx-components.tsx`. The documentation is in English alone, so the proxy redirects another locale's `/docs` URL (`/ja/docs/...`) to it.

The cache holds until publira/publira's `push` webhook reaches `/api/webhooks/github`: a push to `main` that changes a file under `docs/` revalidates `next`, and a `v*` tag created or deleted revalidates the list of releases. A deployment reads three environment variables:

| Variable | What it is for |
| --- | --- |
| `GITHUB_APP_ID` | The ID of the GitHub App the site reads publira/publira as, with an installation token |
| `GITHUB_APP_PRIVATE_KEY` | A private key of that App, in PEM; line breaks may be written as `\n` |
| `GITHUB_WEBHOOK_SECRET` | The webhook's secret, which signs each delivery. Without it every delivery is rejected |

Without the App, the site reads with `GITHUB_TOKEN` instead, or without a token, which GitHub allows 60 requests an hour. CI passes the workflow's token, and locally `GITHUB_TOKEN=$(gh auth token) pnpm dev` does the same.

## Subpath imports

Modules are addressed through the `imports` field of `package.json` rather than by relative path:

```ts
import { CodeBlock } from "#components/code-block";
import { routing } from "#i18n/routing";
import { getScreenshots } from "#lib/screenshots";
import messages from "#messages/en.json";
import cover from "#assets/screenshots/host/catalog.png";
```

`#components/*`, `#i18n/*`, and `#lib/*` map to targets that carry an explicit extension. TypeScript does not probe for extensions when it resolves a subpath import, so leaving them off resolves under Turbopack but fails type-checking with `TS2307`. `#assets/*`, `#content/*`, and `#messages/*` need none, because the importing side already writes one.

## Images

Images are imported from `assets/` rather than served from a `public/` directory, so that Next.js derives their intrinsic size and blur placeholder at build time.

Screenshots of the platform come from the development seed data, and the scenario seeds, that ship with its repository, and the site says so where it shows them. Never present seeded records as a real publisher's catalog. They live under `assets/screenshots/<surface>/`, one file per view, and `lib/screenshots.ts` lists each screen's views in the order its dialog shows them.

The web screens are photographed at 1440×817 in one browser, the mail at 640 pixels wide as the development stack's mail catcher renders it, and the app screens with `task mobile:screenshot` on an Android emulator with the Pixel 7 hardware profile, its status bar held in demo mode so the clock and the signal read the same in every shot. Keeping each set to one setup is what lets one of them be refreshed without the others looking out of place beside it.

## Styling

Colors and fonts come from [`@publira/design-tokens`](https://github.com/publira/design-tokens), which the other Publira web projects share; use its roles (`bg-primary`, `text-muted-foreground`, …) rather than a one-off hex in a class. Spacing is Tailwind's own. `app/globals.css` adds only what this site alone needs, and styles an element through utility classes on it rather than a rule in the stylesheet. A value Tailwind has no utility for becomes a `@theme` token (`--shadow-dialog`) or an `@utility` (`break-phrase`) and is used as a class like any other. `@layer base` holds only the defaults every element of a kind shares, written with `@apply`, and the custom properties Sugar High reads.

## Writing for the site

Every string a reader sees lives in `messages/`, never as a literal under `app/`, `components/`, or `lib/`. That includes `alt` text and `aria-label`s. `messages/en.json` is the source and the other catalogs its translations; the catalogs are what a translation tool such as Crowdin reads and writes, so strings do not go into per-locale TypeScript modules. Messages use ICU MessageFormat, and inline markup such as `<code>` is written as a tag in the message and rendered with `t.rich`. Where a list is shown in order, the order and the message keys live in the code and each item's text in the catalog. Code samples, including their comments, commands, and the names of packages and repositories stay in the code.

In Japanese, leave no space between Latin letters or digits and Japanese text (`Next.jsアプリ`, `32バイト`): spacing between scripts is the font rendering's job. Parentheses are half-width, with a space outside each one that touches text, as in English (`設定 (オブジェクトストレージ、メール) を管理`). Korean and Chinese follow the conventions of the catalogs in `publira/publira`: Korean follows standard Korean orthography: a space between a Latin word and a Korean one (`Next.js 앱`), and parentheses attached to the word before them, with any particle attached after (`설정(메일)은`). Chinese puts a space between Latin or digits and Chinese (`Next.js 应用`) and uses full-width punctuation, but its parentheses are half-width with a space outside, as in Japanese (`设置 (邮件) 由`). Traditional Chinese uses the terms in use in Taiwan (`主控台`, `軟體`), not a character-by-character conversion of the Simplified text.

The message keys are typed from `messages/en.json`, and the build fails when a translation is missing a key the source has. Add a key to every catalog in the same change.

A long document, such as the privacy policy and the terms of use, is a Markdown file under `content/<locale>/` instead of a run of messages, so a translation tool segments it by paragraph. `@next/mdx` compiles it with `format: "detect"`, so a `.md` file is plain Markdown: no JSX, no imports, and no expressions. Its frontmatter carries the page's `title` and `description`, and `mdx-components.tsx` gives each element the site's styles. `lib/documents.ts` lists every document for every locale, so a translation that is missing fails the type check. Link from one document to another with a relative path (`./privacy`), which stays in the reader's locale. The Japanese text of each document is the original: every other locale shows a notice under the title that it is a reference translation, with a link to the Japanese version, which prevails where the two differ.

Write about Publira at the level someone deploying or evaluating it would see. The platform's own README is written for contributors, so content taken from it needs that filter rather than being transcribed:

- Name the requirement, not the local stand-in. A deployment substitutes its own services for the ones development brings up, so say "S3-compatible object storage" and "an SMTP relay".
- Leave out internal port numbers. Nobody operating the platform thinks in them.
- Leave out Dev Container specifics. They are setup mechanics for contributors, not properties of the product.

## License

[Apache License 2.0](LICENSE).
