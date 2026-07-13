# Contributing

## Setup

```bash
# prereqs: Node >=22.12.0, pnpm
pnpm install
pnpm dev        # Astro dev server at http://localhost:4321
```

## Build & check

```bash
pnpm build        # Astro build (outputs to dist/)
pnpm typecheck    # astro check — TypeScript + Astro types
pnpm lint         # Biome lint
pnpm format       # Biome format (writes in-place)
```

## Tests

```bash
pnpm test         # vitest unit tests
pnpm test:e2e     # Playwright e2e (requires a running server or built dist)
```

## Branch / PR conventions

- Commit direct to `main` for owner; contributors open PRs from a feature branch.
- Conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`.
- Keep PRs focused — one logical change per PR.
- Biome lint + typecheck must pass before merge.

## Code style

Biome handles formatting and linting. Run `pnpm format` before committing.
No manual style rules beyond what Biome enforces.
