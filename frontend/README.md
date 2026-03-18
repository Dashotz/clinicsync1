# ClinicSync Frontend

Next.js 15 application (App Router) for the ClinicSync landing page and dashboard.

## Tech stack

- **Next.js 15** — App Router, React Server Components
- **React 19** — UI
- **TypeScript** — Strict mode
- **Tailwind CSS** — Styling
- **Recharts** — Dashboard charts
- **Lucide React** — Icons
- **next-themes** — Light/dark theme
- **Radix UI** (via shadcn-style components) — Button, Card, Sonner, etc.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server at [http://localhost:3000](http://localhost:3000) |
| `npm run build` | Production build (output in `.next`) |
| `npm run start` | Run production server (after `build`) |
| `npm run lint` | Runs `next lint` (interactive in Next 15 if not migrated) |

Notes:
- For CI / Vercel deployments, **`npm run build`** is the reliable check because it runs TypeScript validation.
- If you want non-interactive linting, migrate `next lint` to ESLint CLI via `npx @next/codemod@canary next-lint-to-eslint-cli .`.

## Routes

- `/` — Landing
- `/login` — Login (redirects to `/dashboard` on success)
- `/dashboard` — Dashboard (analytics)
- `/dashboard/appointments` — Calendar & appointment log
- `/dashboard/patients` — Patient list
- `/dashboard/patients/[patientId]` — Patient details (charting, history, modals)
- `/dashboard/insights` — Insights (placeholder)

## Source layout

- `src/app/` — App Router routes (thin `page.tsx`/`layout.tsx` re-export from `*.page.tsx` / `*.layout.tsx`)
- `src/features/` — Feature modules (appointments, patients)
- `src/components/` — Reusable components (`ui/`, `dashboard/`)
- `src/views/login/` — Login form and layout
- `src/lib/` — Utilities
- `src/data/` — Mock data

See `src/STRUCTURE.md` for the full tree and import paths.

## Configuration

- **Next.js:** `next.config.js` (security headers, etc.)
- **Tailwind:** `tailwind.config.ts`
- **Env:** `.env.local` for local overrides

## Deployment

Designed for Vercel. Set root directory to `frontend` when linking the repo.
