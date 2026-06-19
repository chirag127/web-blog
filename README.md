# oriz-blog

Long-form writing on engineering, finance, and books — the blog at
[blog.oriz.in](https://blog.oriz.in). Part of the
[oriz](https://github.com/chirag127/oriz) family of static sites.

Built on Astro 6 + React 19 + Tailwind v4 + MDX, themed with
[`@chirag127/oriz-ui`](https://github.com/chirag127/oriz-ui), deployed to
Cloudflare. Auth + cross-site sign-in via Firebase (`oriz-app`).

## Features

- **MDX content collections** with strict frontmatter schema
- **View Transitions** — smooth client-side nav between posts (Astro `ClientRouter`)
- **KaTeX math** — `$$E=mc^2$$` in any post via `remark-math` + `rehype-katex`
- **expressive-code** — code blocks with line numbers, language label, diff highlight, frame title
- **Reading time** — auto-computed from post body (overridable in frontmatter)
- **Tags / Categories / Series / Authors / Archive** — full taxonomy pages
- **Pagefind search** — `⌘K` / `/` overlay anywhere; dedicated page at `/search/`
- **Giscus comments** — lazy-loaded, theme-aware, env-driven (`PUBLIC_GISCUS_*`)
- **Bookmarks** — Firestore for signed-in users, localStorage for anon, auto-merge on sign-in
- **Related posts** — ranked by series → tag overlap → category → recency
- **Series navigation** — prev/next + collapsible part list
- **TOC** — sticky on the right at ≥1024px, IntersectionObserver-driven
- **JSON-LD** — Article + BreadcrumbList on every post
- **RSS** at `/rss.xml` with full categories + tags
- **PWA** — service worker via `vite-plugin-pwa` (NetworkFirst pages, SWR images/fonts), offline fallback
- **Sitemap** at `/sitemap-index.xml`

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

Posts are MDX in `src/content/blog/`. Schema lives in `src/content.config.ts`
(`title`, `description`, `pubDate`, `tags`, `category`, `series`, `draft`, …).
A multi-part series is just a folder; a `<folder>/index.mdx` becomes the
series overview.

Math, code, callouts:

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
