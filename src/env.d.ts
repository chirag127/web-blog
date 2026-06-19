/// <reference path="../.astro/types.d.ts" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly PUBLIC_FIREBASE_API_KEY: string
  readonly PUBLIC_FIREBASE_AUTH_DOMAIN: string
  readonly PUBLIC_FIREBASE_PROJECT_ID: string
  readonly PUBLIC_FIREBASE_STORAGE_BUCKET: string
  readonly PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string
  readonly PUBLIC_FIREBASE_APP_ID: string
  readonly PUBLIC_CF_BEACON_TOKEN?: string
  readonly PUBLIC_BUTTONDOWN_USERNAME?: string
  readonly PUBLIC_GA4_ID?: string
  readonly PUBLIC_ADSENSE_CLIENT?: string
  readonly PUBLIC_WEB3FORMS_KEY?: string
  readonly PUBLIC_GISCUS_REPO?: string
  readonly PUBLIC_GISCUS_REPO_ID?: string
  readonly PUBLIC_GISCUS_CATEGORY?: string
  readonly PUBLIC_GISCUS_CATEGORY_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
