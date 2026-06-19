/**
 * Header controls — Pagefind search dialog (⌘K), theme switcher, accent
 * picker, auth button. One React island for the whole interactive cluster
 * so we ship a single hydration boundary.
 *
 * Search uses Pagefind — the default UI mounts inside our sheet, scoped to
 * the blog corpus. Falls back gracefully when Pagefind isn't available
 * (e.g. on dev start before the index is built).
 */
import { useEffect, useId, useRef, useState } from 'react'
import { Palette, Search, Sun, User } from 'lucide-react'

const THEMES = [
  { id: 'dark', label: 'Dark' },
  { id: 'light', label: 'Light' },
  { id: 'sepia', label: 'Sepia' },
  { id: 'hc', label: 'High contrast' },
] as const

const ACCENTS = [
  { id: 'amber', hex: '#f59e0b', label: 'Amber' },
  { id: 'sky', hex: '#0ea5e9', label: 'Sky' },
  { id: 'emerald', hex: '#10b981', label: 'Emerald' },
  { id: 'rose', hex: '#f43f5e', label: 'Rose' },
  { id: 'violet', hex: '#8b5cf6', label: 'Violet' },
  { id: 'monochrome', hex: 'currentColor', label: 'Monochrome' },
] as const

type ThemeId = (typeof THEMES)[number]['id']
type AccentId = (typeof ACCENTS)[number]['id']

export default function HeaderControls() {
  const [theme, setTheme] = useState<ThemeId>('dark')
  const [accent, setAccent] = useState<AccentId>('amber')
  const [searchOpen, setSearchOpen] = useState(false)
  const mountRef = useRef<HTMLDivElement>(null)
  const mountedRef = useRef(false)
  const searchId = useId()

  useEffect(() => {
    setTheme((localStorage.getItem('oriz:theme') as ThemeId) || 'dark')
    setAccent((localStorage.getItem('oriz:accent') as AccentId) || 'amber')

    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      } else if (e.key === '/') {
        const tag = (e.target as HTMLElement | null)?.tagName
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          e.preventDefault()
          setSearchOpen(true)
        }
      } else if (e.key === 'Escape') {
        setSearchOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Lazy-load + mount Pagefind UI when the sheet opens.
  useEffect(() => {
    if (!searchOpen || !mountRef.current || mountedRef.current) return
    let cancelled = false

    const load = async () => {
      try {
        const [{ PagefindUI }] = await Promise.all([
          // @ts-expect-error — runtime import; types not bundled
          import('@pagefind/default-ui'),
          // @ts-expect-error — pagefind UI requires its own CSS
          import('@pagefind/default-ui/css/ui.css'),
        ])
        if (cancelled || !mountRef.current) return
        // Clear any previous content
        mountRef.current.innerHTML = ''
        new PagefindUI({
          element: mountRef.current,
          showImages: false,
          showSubResults: true,
          resetStyles: false,
          autofocus: true,
          translations: {
            placeholder: 'Search posts…',
            zero_results: 'No matches for "[SEARCH_TERM]". Try fewer / different words.',
          },
        })
        mountedRef.current = true
      } catch (e) {
        if (mountRef.current) {
          mountRef.current.innerHTML =
            '<p style="padding:1.25rem;color:var(--color-fg-muted)">Search isn\'t available yet. Run <code>pnpm build</code> to generate the index, then try again.</p>'
        }
        // eslint-disable-next-line no-console
        console.error('Pagefind UI failed to load', e)
      }
    }
    void load()

    return () => {
      cancelled = true
    }
  }, [searchOpen])

  const applyTheme = (next: ThemeId) => {
    setTheme(next)
    localStorage.setItem('oriz:theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }
  const applyAccent = (next: AccentId) => {
    setAccent(next)
    localStorage.setItem('oriz:accent', next)
    document.documentElement.setAttribute('data-accent', next)
  }

  return (
    <>
      <div className="controls">
        <button
          type="button"
          className="ctrl-btn"
          onClick={() => setSearchOpen(true)}
          aria-label="Search the blog (⌘K)"
        >
          <Search size={16} aria-hidden="true" />
          <span className="ctrl-label">Search</span>
          <kbd className="kbd">⌘K</kbd>
        </button>

        <div className="ctrl-group">
          <label className="ctrl-icon-label" htmlFor={`${searchId}-theme`}>
            <Sun size={16} aria-hidden="true" />
            <span className="sr-only">Theme</span>
          </label>
          <select
            id={`${searchId}-theme`}
            className="ctrl-select"
            value={theme}
            onChange={(e) => applyTheme(e.target.value as ThemeId)}
          >
            {THEMES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="ctrl-group">
          <label className="ctrl-icon-label" htmlFor={`${searchId}-accent`}>
            <Palette size={16} aria-hidden="true" />
            <span className="sr-only">Accent</span>
          </label>
          <select
            id={`${searchId}-accent`}
            className="ctrl-select"
            value={accent}
            onChange={(e) => applyAccent(e.target.value as AccentId)}
          >
            {ACCENTS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </div>

        <a href="/account/" className="ctrl-btn ctrl-btn-primary" aria-label="Sign in">
          <User size={16} aria-hidden="true" />
          <span className="ctrl-label">Sign in</span>
        </a>
      </div>

      {searchOpen && (
        <div
          className="search-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSearchOpen(false)
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Search the blog"
        >
          <div className="search-panel">
            <div ref={mountRef} className="pagefind-mount" />
            <div className="search-foot">
              <span>
                <kbd className="kbd">↵</kbd> open
              </span>
              <span>
                <kbd className="kbd">esc</kbd> close
              </span>
              <a href="/search/" className="search-foot-link">
                Open dedicated search →
              </a>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .controls { display: flex; align-items: center; gap: 0.5rem; margin-left: auto; }
        .ctrl-btn, .ctrl-icon-label, .ctrl-select {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          height: 36px;
          padding-inline: 0.75rem;
          background: var(--color-bg-soft);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-button);
          color: var(--color-fg);
          font-family: inherit;
          font-size: 0.875rem;
          cursor: pointer;
          text-decoration: none;
          transition: border-color 120ms;
        }
        .ctrl-btn:hover, .ctrl-select:hover {
          border-color: color-mix(in oklab, var(--color-accent) 50%, var(--color-border));
        }
        .ctrl-btn-primary { background: var(--color-accent); color: var(--color-accent-fg); border-color: var(--color-accent); }
        .ctrl-btn-primary:hover { color: var(--color-accent-fg); }
        .ctrl-label { display: none; }
        @media (min-width: 768px) { .ctrl-label { display: inline; } }
        .ctrl-group {
          display: flex;
          align-items: center;
          background: var(--color-bg-soft);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-button);
          height: 36px;
          padding-left: 0.625rem;
          gap: 0.375rem;
        }
        .ctrl-icon-label { background: transparent; border: 0; padding: 0; height: auto; cursor: default; }
        .ctrl-select { background: transparent; border: 0; padding-inline: 0.5rem 0.5rem; height: 100%; }
        .ctrl-select:focus, .ctrl-btn:focus { outline: 2px solid var(--color-accent); outline-offset: 2px; }
        .kbd {
          padding: 0.125rem 0.375rem;
          background: var(--color-bg-muted);
          border: 1px solid var(--color-border);
          border-radius: 0.25rem;
          color: var(--color-fg-muted);
          font-family: var(--font-mono);
          font-size: 0.6875rem;
        }
        .sr-only {
          position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
          overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
        }
        .search-backdrop {
          position: fixed; inset: 0;
          background: color-mix(in oklab, var(--color-bg) 70%, transparent);
          backdrop-filter: blur(8px);
          z-index: 100;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 12vh;
          padding-inline: 1rem;
        }
        .search-panel {
          width: 100%;
          max-width: 720px;
          background: var(--color-bg-soft);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-card);
          box-shadow: 0 24px 48px -12px rgba(0,0,0,0.5);
          overflow: hidden;
          --pagefind-ui-primary: var(--color-accent);
          --pagefind-ui-text: var(--color-fg);
          --pagefind-ui-background: var(--color-bg-soft);
          --pagefind-ui-border: var(--color-border);
          --pagefind-ui-tag: var(--color-bg-muted);
          --pagefind-ui-border-width: 1px;
          --pagefind-ui-border-radius: var(--radius-card);
          --pagefind-ui-image-border-radius: var(--radius-button);
          --pagefind-ui-image-box-ratio: 3 / 2;
          --pagefind-ui-font: inherit;
        }
        .pagefind-mount { padding: 1rem; min-height: 320px; max-height: 70vh; overflow-y: auto; }
        .pagefind-mount :global(.pagefind-ui__form) { margin-bottom: 1rem; }
        .search-foot {
          display: flex;
          gap: 1rem;
          padding: 0.625rem 1rem;
          background: var(--color-bg-muted);
          border-top: 1px solid var(--color-border);
          color: var(--color-fg-soft);
          font-size: 0.75rem;
        }
        .search-foot-link { margin-left: auto; color: var(--color-fg-muted); text-decoration: none; }
        .search-foot-link:hover { color: var(--color-fg); }
      `}</style>
    </>
  )
}
