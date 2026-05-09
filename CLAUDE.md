# Sportify Frontend — Claude Rules

## Stack

- Vite + React 18 (SPA)
- TypeScript (strict)
- react-query v5 (TanStack Query)
- axios
- zustand (auth/global state)
- @stomp/stompjs (WebSocket)
- Backend: Spring Boot at `localhost:8080`, proxied via Vite

## Architecture: 3-Layer

```
src/
├── api/          # axios functions only — no state, no hooks
├── hooks/        # react-query hooks — data fetching, mutations
├── components/   # pure UI — receives props, no direct API calls
├── pages/        # route-level components — compose hooks + components
├── store/        # zustand stores (auth token, user)
├── types/        # API response types mirroring backend DTOs
└── utils/        # pure functions — formatters, transformers
```

**Hard rules:**
- `components/` never calls API directly — always via hooks
- `api/` functions are plain async functions — no react-query inside
- `pages/` own layout and data orchestration, nothing else
- Cross-cutting logic goes in hooks, not copy-pasted across pages

## Component Rules

- One component = one responsibility
- Props interface defined explicitly — no `any`, no spreading unknown objects
- Presentational components are pure functions — same props → same output
- No business logic in JSX — extract to variables or hooks before return
- Max ~150 lines per component file; split if larger
- Colocate styles with components (CSS modules or inline style objects matching existing UI kit pattern)

## State Management

- Server state → react-query only (no useState for API data)
- Client/UI state → useState or useReducer inside components
- Global client state (auth tokens, user info) → zustand
- Never store derived data — compute from source

## TypeScript

- `strict: true` — no escape hatches
- API response types in `src/types/api.ts` mirror backend DTOs exactly
- No `as any` casts — fix the type
- Prefer `interface` for object shapes, `type` for unions/primitives

## API Layer (`src/api/`)

- `client.ts` — single axios instance, base URL, token interceptor, 401 → refresh retry
- One file per domain: `games.ts`, `auth.ts`, `chat.ts`, `notifications.ts`, `members.ts`, `teams.ts`
- Functions return typed promises: `Promise<GameListResponseDto[]>`
- No try/catch in api layer — let react-query handle errors

## Auth Flow

- OAuth2 initiated by linking to `localhost:8080/oauth2/authorize/{provider}`
- Backend redirects to `/oauth2/callback?accessToken=...&refreshToken=...`
- Store tokens in localStorage; attach via axios interceptor
- On 401: call `POST /api/auth/token/refresh`, retry once, then logout

## Naming

- Components: PascalCase (`GameCard`, `SeatMap`)
- Hooks: `use` prefix (`useGames`, `useGameDetail`)
- API functions: verb + noun (`fetchGames`, `fetchGameDetail`, `logout`)
- Types: suffix with shape (`GameListResponseDto`, `AuthTokens`)
- Event handlers: `handle` prefix (`handleSeatSelect`, `handleSend`)

## Forbidden

- `useEffect` for data fetching — use react-query
- Business logic inside JSX expressions
- Direct `localStorage` access outside `store/auth.ts`
- Inline fetch/axios calls inside components
- `console.log` left in committed code
- Hardcoded API URLs — use Vite proxy (`/api/...`)

## Existing UI Kit

- `ui_kits/sports_ticketing/sportify-screens.jsx` — source of truth for design
- Port components to `src/components/` as typed React components
- Keep visual output identical — do not redesign, only wire up real data
- Color tokens in that file become `src/styles/tokens.ts`
