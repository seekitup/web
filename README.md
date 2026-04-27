# Seekitup Web

Public web app for Seekitup collections and invitation landings.

## Tech Stack

- React 19 + TypeScript
- Vite 7
- Tailwind CSS v4
- React Router v7
- TanStack Query v5
- i18next (`en` + `es`)

## Requirements

- Node.js 20+ (recommended)
- npm 10+

## Run Locally

```bash
npm install
npm run dev
```

App starts on Vite default port (usually `5173`).

### Environment Variables

- `VITE_API_URL`: backend API base URL
  - default fallback is `http://localhost:3000`

Create `.env.local` if needed:

```bash
VITE_API_URL=http://localhost:3000
```

## Scripts

- `npm run dev`: start dev server
- `npm run build`: type-check and production build
- `npm run lint`: run ESLint
- `npm run preview`: serve built app locally

## App Routes

- `/` -> download page
- `/download` -> download page
- `/:username/:slug` -> public collection page
- `/:username/:slug?invite=<token>` -> invitation landing when token is valid
- `*` -> 404 page

## High-Level Architecture

- `src/main.tsx`: app bootstrap (i18n + styles + root render)
- `src/App.tsx`: providers + route graph
- `src/components/layout/Layout.tsx`: shared shell (`Navbar`, `AppBanner`)
- `src/pages/CollectionPage.tsx`: orchestrates collection/invite flow, links, navigator, and infinite scroll
- `src/lib/api.ts`: API client and endpoint wrappers
- `src/types/api.ts`: DTO/type contracts
- `src/hooks/*`: query and UI state hooks
- `src/components/collection/*`: collection/subcollection/link rendering
- `src/i18n/*`: translations and language detection

## Data Flow Notes

`CollectionPage` checks for `invite` query param first:

1. `useInvitationLookup(token)` runs when token exists.
2. Valid token renders `InvitationLanding`.
3. Otherwise it fetches public collection (`useCollectionLookup`) and paginated links (`usePublicLinks`).
4. `useActiveItemTracker` syncs visible content with sticky navigator pills.

## Styling and Tokens

- Theme tokens are defined in `src/index.css` under Tailwind `@theme`.
- UI is dark-first and components rely on those semantic color tokens.

## Deployment

- `vercel.json` rewrites all routes to `index.html` for SPA routing.
- `public/.well-known/` includes mobile app association files.

## Agent/Contributor Quick Context

If you are making changes with an AI coding agent, start with `AGENTS.md` for a repo map, critical behavior constraints, and task-oriented entry points.
