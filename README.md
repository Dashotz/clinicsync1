# ClinicSync

ClinicSync is a B2B clinic management software landing page. It showcases a patient management platform that helps clinics digitalize operations, schedule appointments, maintain records, nurture patients, and retain clients.

## Project Overview

This is a frontend-only marketing and landing page for ClinicSync. The site presents the product value proposition, core capabilities, pricing tiers, and a demo request form. It targets dental and medical practices looking to modernize their operations.

### Key Sections

- **Hero** – Headline, CTAs, and trust indicators
- **Core Capabilities** – Clinic digitalization, revenue operations, patient management, scheduling, nurture and retention, compliance
- **Product Showcase** – Video placeholder and feature highlights
- **Benefits** – Key metrics (no-show reduction, time saved, revenue increase, uptime)
- **Pricing** – Three tiers (Starter, Pro, Enterprise) with PHP pricing
- **Plan Comparison** – Feature comparison table across plans
- **Testimonials** – Customer quotes and ratings
- **Demo Request** – Contact form for demo inquiries
- **Login** – Demo login page at `/login` with carousel and light/dark theme support

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| UI | React 19 |
| Language | TypeScript |
| UI Components | Radix UI primitives (Shadcn-style) |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Icons | Lucide React |
| Theme | next-themes (light/dark) |
| Smooth scroll | Lenis |

### Notable Dependencies

- **Next.js 15** – React framework with App Router, server components, and optimized builds
- **Tailwind CSS** – Utility-first styling with CSS variables for theming
- **Framer Motion** – Scroll-triggered and hover animations
- **Sonner** – Toast notifications for form feedback

## Project Structure

```
clinicsync1/
  frontend/
    src/
      app/                 # Next.js App Router
        globals.css
        layout.tsx
        page.tsx           # Landing page
        login/
          page.tsx         # Login page
      components/          # Page sections and reusable UI
        ui/                # Button, Card, Sonner, etc.
      data/                # Mock data (features, pricing, testimonials)
      lib/                 # Utilities
      views/
        login/             # Login page views and styles
    next.config.js
    tailwind.config.js
  memory/                  # PRD and product docs
  SECURITY.md              # Security audit notes
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or Yarn

### Installation

```bash
cd frontend
npm install
```

Or with Yarn:

```bash
cd frontend
yarn install
```

### Development

```bash
cd frontend
npm run dev
```

Runs the app at [http://localhost:3000](http://localhost:3000).

- Landing: [http://localhost:3000](http://localhost:3000)
- Login: [http://localhost:3000/login](http://localhost:3000/login)

### Build

```bash
cd frontend
npm run build
```

Produces an optimized production build (output in `.next`). Use `npm run start` to run the production server locally.

### Lint

```bash
cd frontend
npm run lint
```

## Configuration

Create a `frontend/.env.local` file for local overrides (e.g. API URLs). Next.js supports standard env variable naming.

## License

Private repository. All rights reserved.
