# Oriz Pages — Blog

> Long-form writing on engineering, finance, and books — the blog of the oriz family.

**Live at**: https://blog.oriz.in · **Status**: production

## What this is

The family's long-form blog. Two content collections (legacy `blog/` corpus + new spec-conformant `posts/`), full taxonomy pages, local + family-wide search, comments, bookmarks, and offline reading.

## Per-feature inventory

| Feature | Status |
|---|---|
| MDX content collections (`blog/` + `posts/`) | ✅ live |
| 3-format feeds (`/rss.xml`, `/atom.xml`, `/feed.json`) | ✅ live |
| Algolia search with offline fallback | ✅ live |
| Family-wide `⌘K` MultiSearch | ✅ live |
| StatusBanner (auto from `status.oriz.in`) | ✅ live |
| Giscus comments (consent-gated) | ✅ live |
| JSON-LD (Article + BreadcrumbList) | ✅ live |
| Sitemap (`/sitemap-index.xml`) | ✅ live |
| View Transitions client-side nav | ✅ live |
| KaTeX math (`remark-math` + `rehype-katex`) | ✅ live |
| expressive-code blocks | ✅ live |
| Reading time | ✅ live |
| Tags / Categories / Series / Authors / Archive | ✅ live |
| Pagefind full-page search at `/search/` | ✅ live |
| Bookmarks (signed-in + anon, auto-merge) | ✅ live |
| Related posts (series → tag → category → recency) | ✅ live |
| Series prev/next navigation | ✅ live |
| Sticky TOC ≥1024px | ✅ live |
| PWA service worker + offline fallback | ✅ live |
| Decap CMS at `/admin/` | ✅ live |
| Cross-post engine (omnipost) | 🚧 WIP |

## App-specific env vars

| Var | Purpose |
|---|---|
| `PUBLIC_GISCUS_REPO` / `REPO_ID` / `CATEGORY` / `CATEGORY_ID` | Comments — get them at <https://giscus.app>. |
| `PUBLIC_ALGOLIA_APP_ID` / `PUBLIC_ALGOLIA_SEARCH_KEY` / `PUBLIC_ALGOLIA_INDEX` | Search (optional; falls back to client-side substring match). |

Everything else (Firebase, Web3Forms, GA4, AdSense) is in the family-wide set at `templates/.env.example`.

## Local dev

```bash
# from the workspace root (c:/D/oriz)
pnpm -F @chirag127/oriz-blog dev
```

## Knowledge

See [`./knowledge/`](./knowledge/) for app-specific decisions, runbooks, and services. Family rules / decisions / architecture live at the master repo's [`knowledge/`](../../../../knowledge/).

## License

MIT License. See master [`LICENSE`](../../../../LICENSE) — same terms across the family.
