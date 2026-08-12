# EstateAI — Frontend (`web`)

Next.js + TypeScript + Tailwind frontend for EstateAI: Nigerian agent/owner
registration and the AI-assisted natural-language listing flow.

See [`AI_Property_Finder_Master_Build_Prompt_v2.md`](./AI_Property_Finder_Master_Build_Prompt_v2.md)
for the full product/technical spec. This repo pairs with the backend at
[estateAIBackend](https://github.com/ematech81/estateAIBackend).

## Current status: Phase 0

Landing page, agent/owner registration + login, agent dashboard, and the
AI-assisted listing composer. No consumer search UI or homepage hero yet —
see Section 5 of the master build prompt for why.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL to the backend's URL
npm run dev                          # http://localhost:3000 (requires the backend running)
```

## Scripts

```bash
npm run dev         # start dev server
npm run build         # production build
npm run typecheck    # tsc --noEmit
npm run lint           # next lint
```

## Structure

```
src/
  app/
    page.tsx                    Phase-1 landing page
    register/, login/           auth pages
    agent/dashboard/            agent's listings
    agent/listings/new/         AI-assisted listing composer
  lib/          api client, auth token storage
  types/        canonical Property/ListingDraft types (mirrors the backend schema)
```
