# ClinicSync

ClinicSync is a B2B clinic management software landing page. It showcases a patient management platform that helps clinics digitalize operations, schedule appointments, maintain records, nurture patients, and retain clients.

## Project Overview

This is a frontend-only marketing and landing page for ClinicSync. The site presents the product value proposition, core capabilities, pricing tiers, and a demo request form. It targets dental and medical practices looking to modernize their operations.

### Key Sections

- **Hero** - Headline, CTAs, and trust indicators
- **Core Capabilities** - Clinic digitalization, revenue operations, patient management, scheduling, nurture and retention, compliance
- **Product Showcase** - Video placeholder and feature highlights
- **Benefits** - Key metrics (no-show reduction, time saved, revenue increase, uptime)
- **Pricing** - Three tiers (Starter, Pro, Enterprise) with PHP pricing
- **Plan Comparison** - Feature comparison table across plans
- **Testimonials** - Customer quotes and ratings
- **Demo Request** - Contact form for demo inquiries

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19 |
| Language | TypeScript |
| UI Components | Shadcn UI (Radix primitives) |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Icons | Lucide React |
| Forms | React Hook Form, Zod |
| Build | Create React App, Craco |
| Theme | next-themes (light/dark) |

### Notable Dependencies

- **Shadcn UI** - Accessible, customizable components built on Radix UI
- **Tailwind CSS** - Utility-first styling with custom theme variables
- **Framer Motion** - Scroll-triggered and hover animations
- **Sonner** - Toast notifications for form feedback

## Project Structure

```
clinicsync1/
  frontend/
    public/          # Static assets, index.html
    src/
      components/    # Page sections and reusable UI
        ui/         # Shadcn UI primitives
      data/         # Mock data (features, pricing, testimonials)
      hooks/        # Custom hooks
      lib/          # Utilities
    craco.config.js # Build customization
  memory/            # PRD and product docs
  SECURITY.md       # Security audit notes
```

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn (recommended) or npm

### Installation

```bash
cd frontend
yarn install
```

Or with npm:

```bash
cd frontend
npm install
```

### Development

```bash
cd frontend
yarn start
```

Runs the app at [http://localhost:3000](http://localhost:3000).

### Build

```bash
cd frontend
yarn build
```

Produces an optimized production build in `frontend/build`.

### Tests

```bash
cd frontend
yarn test
```

## Configuration

Create a `frontend/.env` file for local overrides:

```
WDS_SOCKET_PORT=443
ENABLE_HEALTH_CHECK=false
```

## License

Private repository. All rights reserved.
