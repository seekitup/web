# AGENTS.md

Purpose: provide fast, canonical repo context for coding agents.

## Start Here

- Read this file first for architecture and product contracts.
- For policy and execution behavior, follow `.cursor/rules/*.mdc`:
  - `.cursor/rules/core-workflow.mdc`
  - `.cursor/rules/api-and-types-sync.mdc`
  - `.cursor/rules/i18n-consistency.mdc`
  - `.cursor/rules/routing-and-scroll-contracts.mdc`

## Product Snapshot

- Project: `seekitup-web` (React + TypeScript + Vite + Tailwind v4).
- Scope: public web surface for Seekitup.
- Primary experiences:
  - `DownloadPage` (`/` and `/download`): app promotion with disabled store badges.
  - `CollectionPage` (`/:username/:slug`): public collection view with subcollections, links, sticky navigator, and infinite scroll.
  - Invitation landing (`/:username/:slug?invite=<token>`): invitation-first rendering when token is valid.

## Read-First File Map (in order)

1. `src/App.tsx` (providers + routes)
2. `src/pages/CollectionPage.tsx` (main orchestration)
3. `src/lib/api.ts` + `src/types/api.ts` (API contract)
4. `src/hooks/useCollectionLookup.ts`
5. `src/hooks/useInvitationLookup.ts`
6. `src/hooks/usePublicLinks.ts`
7. `src/hooks/useActiveItemTracker.ts`
8. `src/components/collection/*` (UI rendering details)
9. `src/i18n/index.ts` + `src/i18n/en.ts` + `src/i18n/es.ts`
10. `src/index.css` (theme tokens)

If a task touches these areas, start here before broad scans.

## Runtime Architecture

- Entrypoint: `src/main.tsx` imports i18n + global CSS and mounts `App`.
- App providers:
  - `QueryClientProvider` (`src/lib/queryClient.ts`) for API state.
  - `VideoAudioProvider` (`src/hooks/useVideoAudio.tsx`) for shared mute state.
  - `BrowserRouter` for route handling.
- Shared shell:
  - `Layout` wraps all routes with top navbar and fixed bottom app banner.

## Data Flow (Collection Page)

`CollectionPage` branches early:

1. Read route params + `invite` query param.
2. If `invite` exists, run `useInvitationLookup`.
3. If token is valid, render `InvitationLanding` and skip public collection fetch.
4. Otherwise fetch collection with `useCollectionLookup`.
5. Once collection is available, fetch paginated links via `usePublicLinks` (20/page).
6. Flatten pages with `flattenLinks`.
7. Build sticky navigator items from child collections and links.
8. `useActiveItemTracker` controls active pill and visible link tracking.

## Public Contracts

- Routes:
  - `/` and `/download` => download experience.
  - `/:username/:slug` => public collection.
  - `?invite=<token>` => invitation-first behavior when token is valid.
- Sticky-nav behavior depends on:
  - navbar baseline `h-14` (56px).
  - `data-item-id` and `data-nav-id` contracts.
- Local storage keys:
  - `seekitup-view-mode`
  - `seekitup-banner-dismissed`
  - `seekitup-video-muted`
  - `seekitup-language`

## API Endpoints Used

Base URL: `VITE_API_URL` (fallback `http://localhost:3000`)

- `GET /api/v1/collections/lookup/:username/:slug`
- `GET /api/v1/collections/invitations/:token`
- `GET /api/v1/links/public?collectionId=<id>&page=<n>&limit=20`

## Validation Checklist

Run after substantive edits:

```bash
npm run lint
npm run build
```

Manual checks:

- `/download` renders and language toggle works.
- `/:username/:slug` loads collection, subcollections, and links.
- Infinite scroll loads additional links.
- Sticky navigator highlights and scroll-centers active item.
- `?invite=<token>` shows invitation landing for valid token.

## Known Product Notes

- `useVisibleLinkTracker` exists, but `CollectionPage` currently uses `useActiveItemTracker`.
- App store CTAs are intentionally disabled (`Coming soon` state).
