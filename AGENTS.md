# gloved.dev — Agent Instructions

## Stack

- **Framework**: Next.js 16.2 with App Router, React 19, TypeScript
- **Package manager**: Bun (v1.3.8, pinned in `packageManager`)
- **Styling**: Tailwind CSS + DaisyUI + shadcn/ui components (New York style)
- **Auth**: Clerk (`@clerk/nextjs`)
- **Fonts**: Syne (display), Space Grotesk (mono/industrial) — loaded via Google Fonts in `globals.css`

## Dev Commands

```sh
bun dev          # Start dev server on port 4321
bun run build:full   # Run prettier -> generate-route-map -> next build
bun run generate-route-map  # Auto-generate src/lib/route-map.ts from page.tsx files
bun run lint     # ESLint
bun run prettier # Format src/ with prettier (config lives in package.json)
```

Route map is auto-generated — **do not edit `src/lib/route-map.ts` directly**. Run `bun run generate-route-map` after adding/removing pages.

## Key Quirks

- **Port**: Dev runs on `4321`, not the default 3000
- **Env**: Uses `dotenv/config` + `@t3-oss/env-nextjs`. Server vars (`GEMINI`, `GROQ`, `OPENROUTER`, `CLERK_SECRET_KEY`, `TAVILY_API_KEY`, `KV_*`) are required; client vars (`NEXT_PUBLIC_*`) are optional. Real env values are in `.env` — do not commit it.
- **CSS vars**: Three themes in `globals.css`: `.light`, `.dark` (default), `.classic-dark`. Custom utilities include `.font-display`, `.font-mono-industrial`, `.brutal-shadow`, `.brutal-shadow-sm`, `.glow-line`, `.noise-overlay`, `.grid-pattern`.
- **React Compiler**: Babel plugin `babel-plugin-react-compiler` is active; prefer the compiler over manual `useMemo`/`useCallback` where appropriate.
- **Tailwind**: Custom config at `tailwind.config.ts` extends fonts (`jetbrains`, `geist`) and adds keyframes. Plugins: DaisyUI, tailwindcss-animate, tailwind-scrollbar, @tailwindcss/typography.
- **Component aliases** (from `components.json`): `@/components`, `@/components/ui`, `@/lib`, `@/lib/utils`, `@/hooks`
- **Next.js config**: `allowedDevOrigins` includes `home.gloved.dev` and `192.168.0.111` in addition to `localhost`. `/file-uploader` redirects to `/files`.
- **AI integrations**: Gemini, Groq, OpenRouter via `@ai-sdk/*`. Route map for AI onboarding sourced from `src/lib/ai/`.

## Project Structure

```
src/app/           — Next.js App Router pages (route groups like (chat), (auth))
src/components/    — UI components (shadcn/ui in src/components/ui)
src/lib/           — Utilities, AI config, API wrappers, route-map.ts
src/hooks/         — Custom React hooks
src/env.ts         — Zod-validated env schema (t3-env)
scripts/           — Build/utility scripts (GithubPageRouteGen.ts)
```

## CI / Deployment

- No CI workflows detected in `.github/`. Deployment is likely via Vercel (`.vercel/` present).
