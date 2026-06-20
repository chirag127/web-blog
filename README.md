# oriz-blog

Long-form writing on engineering, finance, and books — the blog at
[blog.oriz.in](https://blog.oriz.in). Part of the
[oriz](https://github.com/chirag127/oriz) family of static sites.

Built on Astro 6 + React 19 + Tailwind v4 + MDX, themed with
[`@chirag127/oriz-ui`](https://github.com/chirag127/oriz-ui), deployed to
Cloudflare. Auth + cross-site sign-in via Firebase (`oriz-app`).

## Features

- **MDX content collections** with strict frontmatter schema (two collections: legacy `blog/` for the bulk-imported corpus, and `posts/` for new spec-conformant entries)
- **3-format feeds** at `/rss.xml`, `/atom.xml`, `/feed.json` — auto-discovered via `<FeedDiscovery />` `<link>` tags in `<head>` (Batch-12 lock)
- **Algolia search** — `<Search />` React island with a graceful client-side fallback when env is missing (Batch-4 lock; fallback uses substring match over a static index)
- **Family-wide MultiSearch** — `⌘K` opens a cross-site search overlay; routes the query to the picked site's own `/search/?q=`
- **StatusBanner** — auto-shows when `status.oriz.in` reports a non-OK incident (apex-only-monitoring lock)
- **Giscus comments** — consent-gated. The iframe doesn't load until the reader clicks "Load comments"; consent is remembered per-browser (Batch-5 + consent decision)
- **JSON-LD** — `Article` + `BreadcrumbList` on every post page (SEO three-pillars decision)
- **Sitemap** at `/sitemap-index.xml` via `@astrojs/sitemap`
- **View Transitions** — smooth client-side nav between posts (Astro `ClientRouter`)
- **KaTeX math** — `$$E=mc^2$$` in any post via `remark-math` + `rehype-katex`
- **expressive-code** — code blocks with line numbers, language label, diff highlight, frame title
- **Reading time** — auto-computed from post body (overridable in frontmatter)
- **Tags / Categories / Series / Authors / Archive** — full taxonomy pages
- **Pagefind search** — local search overlay anywhere; dedicated page at `/search/`
- **Bookmarks** — Firestore for signed-in users, localStorage for anon, auto-merge on sign-in
- **Related posts** — ranked by series → tag overlap → category → recency
- **Series navigation** — prev/next + collapsible part list
- **TOC** — sticky on the right at ≥1024px, IntersectionObserver-driven
- **PWA** — service worker via `vite-plugin-pwa` (NetworkFirst pages, SWR images/fonts), offline fallback

## Routes

```
/                         home — hero + featured + latest + by-category + series + tags
/blog/                    paginated post index (filter chip strip)
/blog/page/[page]         pages 2+
/blog/[...slug]           post detail (TOC, comments, related, series nav, bookmark)
/categories/              all categories with counts
/categories/[category]    posts in a category
/tags/                    all tags with counts (sorted)
/tags/[tag]               posts with a tag
/series/                  all series (auto-detected from folder layout)
/series/[slug]            single series with TOC + parts
/authors/                 all authors
/authors/[name]           posts by an author
/archive/                 reverse-chrono list of every post grouped by year
/bookmarks/               your saved posts (Firestore + localStorage)
/search/                  full-page Pagefind search
/about/                   about page (hidden sidebar)
/contact/                 contact form (Web3Forms)
/account/                 sign-in (oriz-ui AccountPanel)
/account/finish-sign-in/  email-link callback
/legal/{privacy,terms,disclaimer,cookies,grievance}
/rss.xml
/404
```

## Develop

```bash
pnpm install
npx envpact-cli@0.2.0          # pulls .env from envpact (shared Firebase + site secrets)
pnpm dev                        # http://localhost:4321
```

Useful scripts:

- `pnpm typecheck` — Astro type check
- `pnpm lint` / `pnpm format` — Biome
- `pnpm build` — static build into `dist/`
- `pnpm preview` — serve the built site locally

## Build & deploy

Cloudflare (custom domain `blog.oriz.in` is bound via the dashboard):

```bash
pnpm build
pnpm deploy   # wrangler deploy — uploads ./dist
```

Environment variables required at build time live in `.env.example`. In
production they're set on the Cloudflare project; locally they come from
envpact.

### Required env

| Var | Purpose |
|---|---|
| `PUBLIC_FIREBASE_*` | Shared `oriz-app` Firebase project (auth + Firestore for bookmarks) |
| `PUBLIC_GISCUS_REPO`/`REPO_ID`/`CATEGORY`/`CATEGORY_ID` | Comments. Get them at <https://giscus.app>. |
| `PUBLIC_WEB3FORMS_KEY` | Contact form |
| `PUBLIC_GA4_ID`, `PUBLIC_CF_BEACON_TOKEN` | Analytics (optional) |
| `PUBLIC_ADSENSE_CLIENT` | AdSense (optional, only after publisher approval) |

## Writing posts

Two collections coexist:

- **`src/content/blog/`** — legacy bulk-imported corpus (200+ entries
  ported from open-ncert). Existing routes at `/blog/*` render these.
- **`src/content/posts/`** — new spec-conformant entries written under
  the Batch-13 brief. Rendered at `/posts/*`. Schema (in
  `src/content.config.ts`): `title`, `description`, `pubDate`,
  `updatedDate?`, `heroImage?`, `tags`, `draft?`, `canonicalUrl?`,
  `author`. **Code samples come from StackBlitz / CodePen / GitHub
  Gist embeds** (per Batch-6 lock) — no in-MDX runnable code.

Pick `posts/` for new writing. The `blog/` collection stays for legacy
URL stability.

Math, code, callouts in the legacy `blog/` collection:

```mdx
---
title: "Real-world RAG"
description: "…"
pubDate: 2026-03-10
tags: ["AI", "RAG"]
category: "AI/ML"
---

The expected loss is $\\mathcal{L} = -\\mathbb{E}_{x \\sim p(x)}[\\log p_\\theta(x)]$.

```python title="ingest.py" {3-5} ins={6}
from langchain.text_splitter import RecursiveCharacterTextSplitter
loader = DirectoryLoader("./docs", glob="**/*.md")
docs = loader.load()
splitter = RecursiveCharacterTextSplitter()
chunks = splitter.split_documents(docs)
print(f"Split into {len(chunks)} chunks")
```
```

Drafts (`draft: true`) are excluded from listings and the RSS feed. Decap
CMS lives at `/admin/` and writes to the same content collection.
