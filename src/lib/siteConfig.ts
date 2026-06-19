/**
 * Cross-family site descriptor used by older code paths. Kept tiny — the
 * shape used to depend on `@chirag127/oriz-ui`'s `OrizSiteConfig`, but that
 * is gone in v2 (oriz-ui no longer exports types either). Local shape
 * suffices.
 */
export interface OrizSiteConfig {
  slug: string
  name: string
  origin: string
  tagline: string
  description: string
}

export const SITE_CONFIG: OrizSiteConfig = {
  slug: 'blog',
  name: 'Blog',
  origin: 'https://blog.oriz.in',
  tagline: 'Long-form writing on engineering, finance, and books',
  description:
    'Long-form writing on engineering, finance, and books — by Chirag Singhal.',
}
