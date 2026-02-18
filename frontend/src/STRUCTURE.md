# Frontend Source Structure

Next.js 15 App Router application. Entry is `app/layout.tsx` and route segments under `app/`.

```
src/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout (metadata, Providers)
│   ├── page.tsx                # Landing page (/)
│   ├── globals.css             # Global styles, Tailwind
│   ├── login/
│   │   └── page.tsx            # Login page (/login)
│   └── dashboard/
│       ├── layout.tsx         # Dashboard layout (sidebar + main)
│       ├── page.tsx           # Dashboard home (/dashboard) — charts, cashflow, patients, treatments
│       └── appointments/
│           ├── page.tsx       # Appointments calendar & log (/dashboard/appointments)
│           └── new/
│               └── page.tsx   # New appointment placeholder (/dashboard/appointments/new)
├── components/
│   ├── ui/                     # Reusable UI primitives (shadcn-style)
│   │   ├── button.tsx
│   │   ├── button-group.tsx
│   │   ├── card.tsx
│   │   └── sonner.tsx
│   ├── dashboard/
│   │   └── DashboardSidebar.tsx
│   ├── AnimatedSection.tsx
│   ├── Benefits.tsx
│   ├── Comparison.tsx
│   ├── ConstellationBackground.tsx
│   ├── DemoRequest.tsx
│   ├── Features.tsx
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── LenisProvider.tsx
│   ├── mode-toggle.tsx
│   ├── Pricing.tsx
│   ├── ProductShowcase.tsx
│   ├── providers.tsx
│   ├── Testimonials.tsx
│   ├── theme-provider.tsx
│   └── ...
├── views/
│   └── login/
│       ├── LoginForm.tsx       # Login form (sanitization, validation)
│       ├── LoginForm.css
│       ├── LoginPage.tsx       # Login layout/carousel
│       ├── LoginPage.css
│       └── index.ts
├── data/
│   └── mockData.js             # Static/mock content for landing
├── lib/
│   ├── utils.ts                # cn() and helpers
│   └── imageOptimizer.ts       # Image URL helpers
```

## Route summary

| Route | Description |
|-------|-------------|
| `/` | Landing (Hero, Features, Pricing, etc.) |
| `/login` | Login (form + carousel); success → `/dashboard` |
| `/dashboard` | Dashboard home (cashflow, patients, treatments charts) |
| `/dashboard/appointments` | Calendar tab + Appointment log tab (filters, table) |
| `/dashboard/appointments/new` | New appointment (placeholder) |

## Import paths

- `@/components/*` — React components
- `@/components/ui/*` — UI primitives
- `@/lib/*` — Utilities
- `@/data/*` — Static/mock data
- `@/views/*` — View-level modules (e.g. login)
