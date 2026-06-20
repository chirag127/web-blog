// @ts-check
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import mdx from '@astrojs/mdx'
import expressiveCode from 'astro-expressive-code'
import pagefind from 'astro-pagefind'
import tailwindcss from '@tailwindcss/vite'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeSlug from 'rehype-slug'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * ─── Cross-post hook (oriz-omnipost) ──────────────────────────────────────
 *
 * On `pnpm build`, oriz-omnipost's CLI will be triggered to cross-post new
 * RSS items to dev.to / Bluesky / Buttondown / Telegra.ph / WordPress /
 * Reddit. Configured via `pnpm omnipost:cross-post` and keyed on the RSS
 * <guid> for idempotency (per the Batch-12 cross-post-engine decision).
 *
 *   1. `pnpm build`               → emits dist/rss.xml + dist/atom.xml + dist/feed.json
 *   2. CI runs `pnpm omnipost:cross-post`
 *      → reads dist/rss.xml
 *      → diffs against syndication-registry.json
 *      → POSTs the delta to each destination
 *      → fires IndexNow with the new canonical URLs
 *      → commits the registry update back to main
 *
 * The hook is intentionally NOT wired to astro:build:done here — the CI
 * job runs it after `pnpm build` completes (and only on main), so local
 * `pnpm build` stays fast and side-effect-free.
 *
 * See: https://github.com/chirag127/oriz/blob/main/knowledge/decisions/architecture/cross-post-engine.md
 * ──────────────────────────────────────────────────────────────────────────
 */

// astro-expressive-code MUST be before mdx so its rehype hooks land in MDX too.
export default defineConfig({
  site: 'https://blog.oriz.in',
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
  integrations: [
    expressiveCode({
      themes: ['github-dark-dimmed', 'github-light'],
      themeCssSelector: (theme) =>
        theme.name === 'github-light'
          ? '[data-theme="light"], [data-theme="sepia"]'
          : '[data-theme="dark"], [data-theme="hc"]',
      styleOverrides: {
        borderRadius: 'var(--radius-card, 0.625rem)',
        codeFontFamily: 'var(--font-mono)',
        codeFontSize: '0.875rem',
        codeLineHeight: '1.55',
        frames: { shadowColor: 'transparent' },
      },
      defaultProps: { showLineNumbers: true, wrap: false },
    }),
    react(),
    mdx(),
    sitemap(),
    pagefind(),
  ],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeSlug, [rehypeKatex, { strict: false, output: 'htmlAndMathml' }]],
    shikiConfig: { theme: 'github-dark-dimmed' },
  },
  vite: {
    plugins: [
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: null,
        manifest: false,
        strategies: 'generateSW',
        filename: 'sw.js',
        workbox: {
          navigateFallback: '/offline.html',
          navigateFallbackDenylist: [/^\/admin/, /^\/_/, /\/sw\.js$/],
          globPatterns: ['**/*.{js,css,html,svg,woff2,webp,png,ico}'],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
              handler: 'StaleWhileRevalidate',
              options: { cacheName: 'oriz-fonts', expiration: { maxEntries: 30 } },
            },
            {
              urlPattern: ({ request }) => request.destination === 'document',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'oriz-blog-pages',
                networkTimeoutSeconds: 4,
                expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 14 },
              },
            },
            {
              urlPattern: ({ request }) =>
                request.destination === 'image' ||
                request.destination === 'style' ||
                request.destination === 'script',
              handler: 'StaleWhileRevalidate',
              options: { cacheName: 'oriz-blog-static', expiration: { maxEntries: 200 } },
            },
          ],
        },
      }),
    ],
  },
})
