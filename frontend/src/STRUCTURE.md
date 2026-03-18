# Frontend Source Structure

Next.js 15 App Router with **feature-based** organization. Routes live under `app/`; feature logic, components, and data live under `features/`.

## Feature-based layout

Routes use **segment.page.tsx** / **segment.layout.tsx** naming so you can see which route a file belongs to. Each route folder keeps a thin **page.tsx** or **layout.tsx** that re-exports from the named file (Next.js requires those exact filenames).

```
src/
├── app/                                  # Routes (thin page/layout re-export from *.page / *.layout)
│   ├── root.layout.tsx                   # Root layout (metadata, html/body)
│   ├── layout.tsx                        # → re-exports root.layout
│   ├── landing.page.tsx                  # Landing page (/)
│   ├── page.tsx                          # → re-exports landing.page
│   ├── globals.css
│   ├── login/
│   │   ├── login.page.tsx
│   │   └── page.tsx                      # → re-exports login.page
│   └── dashboard/
│       ├── dashboard.layout.tsx         # Sidebar + main wrapper
│       ├── layout.tsx                    # → re-exports dashboard.layout
│       ├── dashboard.page.tsx            # Dashboard home (charts)
│       ├── page.tsx                      # → re-exports dashboard.page
│       ├── insights/
│       │   ├── insights.page.tsx
│       │   └── page.tsx                  # → re-exports insights.page
│       ├── patients/
│       │   ├── patients.page.tsx         # Patient list
│       │   ├── page.tsx                  # → re-exports patients.page
│       │   └── [patientId]/
│       │       ├── patient-detail.page.tsx
│       │       └── page.tsx              # → re-exports patient-detail.page
│       └── appointments/
│           ├── appointments.page.tsx     # Calendar & log
│           └── page.tsx                  # → re-exports appointments.page
│
├── features/
│   ├── appointments/             # Appointments feature
│   │   ├── lib/                  # Types, utils, constants, tooth chart data
│   │   │   ├── types.ts
│   │   │   ├── utils.ts
│   │   │   ├── constants.ts
│   │   │   ├── tooth-chart-spots.ts
│   │   │   └── index.ts
│   │   ├── components/           # Kebab-case by function
│   │   │   ├── tooth-chart.tsx
│   │   │   ├── new-appointment-modal.tsx
│   │   │   ├── edit-appointment-modal.tsx
│   │   │   ├── appointment-details-modal.tsx
│   │   │   ├── treatment-summary-modal.tsx
│   │   │   └── add-medical-record-modal.tsx
│   │   └── index.ts
│   │
│   └── patients/                 # Patients feature
│       ├── data/
│       │   └── patient-data.ts   # Rows, details, charting, visits
│       ├── utils/
│       │   └── tooth-names.ts    # Tooth display names (1–32)
│       ├── components/
│       │   ├── patient-details-view.tsx
│       │   ├── add-tooth-record-modal.tsx
│       │   ├── add-treatment-modal.tsx
│       │   └── link-to-visit-modal.tsx
│       └── index.ts
│
├── components/                   # Shared UI
│   ├── ui/                       # Primitives (button, dialog, select, …)
│   ├── dashboard/
│   │   └── DashboardSidebar.tsx
│   ├── Hero.tsx, Features.tsx, Pricing.tsx, …
│   ├── providers.tsx
│   └── theme-provider.tsx, mode-toggle.tsx, LenisProvider.tsx
│
├── views/
│   └── login/                    # Login view (LoginPage, LoginForm)
│
├── lib/                          # App-wide utils
│   ├── utils.ts
│   ├── inputRestrictions.ts
│   └── imageOptimizer.ts
│
└── data/
    └── mockData.js               # Landing/marketing mock data
```

## Naming

- **Features:** `features/<feature>/` (e.g. `appointments`, `patients`).
- **Files:** kebab-case by function (e.g. `patient-details-view.tsx`, `add-treatment-modal.tsx`, `tooth-chart-spots.ts`).
- **Exports:** Use `index.ts` per feature to expose public API.

## Import paths

| Use | Path |
|-----|------|
| Appointments types/utils/components | `@/features/appointments` or `@/features/appointments/lib`, `@/features/appointments/components/*` |
| Patients data/utils/components | `@/features/patients` or `@/features/patients/data/patient-data`, `@/features/patients/utils/tooth-names`, etc. |
| Shared UI | `@/components/ui/*`, `@/components/dashboard/*` |
| Global utils | `@/lib/*` |

## Route summary

| Route | Description |
|-------|-------------|
| `/` | Landing |
| `/login` | Login |
| `/dashboard` | Dashboard home |
| `/dashboard/appointments` | Calendar + appointment log |
| `/dashboard/patients` | Patient list |
| `/dashboard/patients/[patientId]` | Patient details (charting, modals) |
| `/dashboard/insights` | Insights (placeholder) |
