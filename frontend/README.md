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
| `npm run lint` | Run ESLint |

## Routes

- `/` — Landing
- `/login` — Login (redirects to `/dashboard` on success)
- `/dashboard` — Dashboard (analytics)
- `/dashboard/appointments` — Calendar & appointment log
- `/dashboard/appointments/new` — New appointment (placeholder)

## Source layout

- `src/app/` — App Router pages and layouts
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
