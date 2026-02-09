# Frontend Source Structure

```
src/
├── components/          # React components
│   ├── ui/              # Reusable UI primitives (button, card, sonner)
│   ├── AnimatedSection.tsx
│   ├── Benefits.tsx
│   ├── Comparison.tsx
│   ├── DemoRequest.tsx
│   ├── DotGrid.tsx
│   ├── Features.tsx
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── mode-toggle.tsx
│   ├── Pricing.tsx
│   ├── ProductShowcase.tsx
│   ├── Testimonials.tsx
│   └── theme-provider.tsx
├── data/                # Static data and mock content
│   └── mockData.js
├── lib/                 # Utilities and helpers
│   ├── utils.ts         # cn() classNames utility
│   └── imageOptimizer.ts # Image URL helpers (WebP, responsive)
├── styles/              # CSS files
│   ├── index.css        # Global styles, Tailwind, theme variables
│   ├── App.css          # App-specific styles, animations
│   └── components/      # Component-specific styles
│       └── DotGrid.css
├── App.tsx
├── index.tsx
└── react-app-env.d.ts
```

## Import Paths

- `@/components/*` - React components
- `@/lib/*` - Utilities
- `@/data/*` - Static data
- `@/styles/*` - CSS files
