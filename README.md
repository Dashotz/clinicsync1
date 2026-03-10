# ClinicSync

ClinicSync is a B2B clinic management software landing page and dashboard. It showcases a patient management platform that helps clinics digitalize operations, schedule appointments, maintain records, nurture patients, and retain clients.

## Project overview

Frontend application built with Next.js 15 (App Router). The site includes a marketing landing page, a login flow, and an authenticated dashboard with analytics and appointment management.

### Key sections and routes

| Route | Description |
|-------|-------------|
| **Landing** (`/`) | Hero, core capabilities, product showcase, benefits, pricing, comparison, testimonials, demo request |
| **Login** (`/login`) | Demo login with carousel and light/dark theme; valid credentials redirect to `/dashboard` |
| **Dashboard** (`/dashboard`) | Analytics: cashflow chart, patients (donut), popular treatments (bar). Date/period filters. |
| **Appointments** (`/dashboard/appointments`) | Calendar + appointment log. Dentist/status filters; details/edit modals. |
| **Patients** (`/dashboard/patients`) | Patient list |
| **Patient details** (`/dashboard/patients/[patientId]`) | Charting (odontogram + history), add tooth record/treatment, link-to-visit |
| **Insights** (`/dashboard/insights`) | Placeholder |

### Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| UI | React 19 |
| Language | TypeScript |
| UI components | Radix UI primitives (shadcn-style), Tailwind |
| Charts | Recharts |
| Icons | Lucide React |
| Theme | next-themes (light/dark) |
| Smooth scroll | Lenis |

### Security and stability

- **Headers** (in `next.config.js`): X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy
- **Login**: Input sanitization (trim, control chars, length limits) and validation (email format, password length)
- **Appointments**: Filter values validated against allowlists (dentist IDs, status enum)
- **React**: No `dangerouslySetInnerHTML` or `eval`; user content rendered as text (XSS-safe)

## Project structure

```
clinicsync1/
  frontend/                    # Next.js frontend
    src/
      app/                                 # App Router routes
        root.layout.tsx                    # Root layout implementation
        layout.tsx                         # Re-export for Next.js
        landing.page.tsx                   # Landing implementation
        page.tsx                           # Re-export for Next.js
        globals.css
        login/
          login.page.tsx
          page.tsx                         # Re-export for Next.js
        dashboard/
          dashboard.layout.tsx
          layout.tsx                       # Re-export for Next.js
          dashboard.page.tsx
          page.tsx                         # Re-export for Next.js
          appointments/
            appointments.page.tsx
            page.tsx                       # Re-export for Next.js
          patients/
            patients.page.tsx
            page.tsx                       # Re-export for Next.js
            [patientId]/
              patient-detail.page.tsx
              page.tsx                     # Re-export for Next.js
          insights/
            insights.page.tsx
            page.tsx                       # Re-export for Next.js
      features/                 # Feature modules (scalable by domain)
        appointments/
          components/
          lib/
          index.ts
        patients/
          components/
          data/
          utils/
          index.ts
      components/              # Shared components
        ui/                    # Button, ButtonGroup, Card, Sonner
        dashboard/             # DashboardSidebar
        Hero, Features, ...
      views/login/             # Login form and layout
      data/                    # Mock data
      lib/                     # utils, imageOptimizer
    next.config.js
    tailwind.config.ts
  memory/                      # PRD and product docs
  SECURITY.md                  # Security notes
```

See `frontend/src/STRUCTURE.md` for a detailed source tree.

## Getting started

### Prerequisites

- Node.js 18+
- npm or Yarn

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
cd frontend
npm run dev
```

- Landing: [http://localhost:3000](http://localhost:3000)
- Login: [http://localhost:3000/login](http://localhost:3000/login)
- Dashboard: [http://localhost:3000/dashboard](http://localhost:3000/dashboard) (after login)

### Build

```bash
cd frontend
npm run build
```

Output is in `.next`. Run the production server with `npm run start`.

### Lint

```bash
cd frontend
npm run lint
```

Note: `next lint` is interactive in Next 15 if not migrated. For CI checks, prefer `npm run build`.

## Configuration

Use `frontend/.env.local` for local overrides (e.g. API URLs). Next.js supports standard env variable naming.

## Deployment

### Frontend (Vercel)

1. **Dashboard:** Push to GitHub → import repo on [vercel.com](https://vercel.com) → set **Root Directory** to `frontend` → deploy.
2. **CLI:** `cd frontend && vercel`

The `frontend/vercel.json` file holds deployment configuration.

### Backend (future)

Backend will be deployed separately. When ready, set `NEXT_PUBLIC_API_URL` in production env.

## License

Private repository. All rights reserved.
