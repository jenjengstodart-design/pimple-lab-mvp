# Pimple Lab – MVP

## Overview

Pimple Lab is a full-stack web application designed as a hackathon MVP that helps teenagers structure skincare experimentation using a scientific approach. Users upload facial skin photos, provide lifestyle context (stress, makeup, sports), receive AI-powered acne analysis (via MedGemma/HuggingFace), set up skincare routine hypotheses, track daily check-ins, and view results with data visualizations. This is explicitly an educational tool, not a medical diagnostic application.

The app follows a multi-step experiment flow: Home → Snapshot (upload photo + context) → Hypothesis (AI analysis + routine planning) → Daily Check-ins → Follow-up (final photo) → Results (data visualization + conclusion).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript, bundled by Vite
- **Routing**: Wouter (lightweight client-side router)
- **State Management**: TanStack React Query for server state, React Hook Form + Zod for form handling/validation
- **UI Library**: shadcn/ui (new-york style) built on Radix UI primitives with Tailwind CSS
- **Animations**: Framer Motion for page transitions and micro-interactions
- **Charts**: Recharts for visualizing adherence and stress data in results
- **Styling**: Tailwind CSS with CSS variables for theming, custom fonts (Outfit for display, DM Sans for body)
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend
- **Framework**: Express.js running on Node.js with TypeScript (executed via `tsx`)
- **API Pattern**: REST API under `/api/` prefix, with route definitions shared between client and server via `shared/routes.ts`
- **Image Handling**: Base64 image upload via JSON body (10mb limit), saved to local `uploads/` directory with UUID filenames
- **AI Integration**: MedGemma wrapper function that calls HuggingFace endpoint using `HF_TOKEN` env variable. Falls back to mock responses when `USE_REAL_MEDGEMMA` is false
- **Product Recommendations**: Hardcoded Superdrug product catalog filtered by acne type, served from the backend

### Database
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (connected via `DATABASE_URL` environment variable)
- **Schema**: Two main tables defined in `shared/schema.ts`:
  - `experiments` — stores experiment metadata, user context (age, stress, makeup, sport), AI analysis results (acne type, confidence, visual features, hypothesis), routine details, and follow-up data
  - `daily_checkins` — stores daily check-in data (adherence percentage, stress level, makeup usage) linked to experiments
- **Migrations**: Managed via `drizzle-kit push` command (`npm run db:push`)
- **Session Store**: Uses `connect-pg-simple` for PostgreSQL-backed sessions

### Shared Code
- `shared/schema.ts` — Drizzle table definitions and Zod insert schemas, shared between frontend and backend
- `shared/routes.ts` — API route definitions with Zod validation schemas, ensuring type-safe API contracts

### Build & Deploy
- **Dev**: `npm run dev` — runs tsx with Vite dev server middleware (HMR enabled)
- **Build**: `npm run build` — Vite builds frontend to `dist/public/`, esbuild bundles server to `dist/index.cjs`
- **Production**: `npm start` — serves built assets with Express static middleware, SPA fallback to index.html

### Key Pages (Client Routes)
| Route | Purpose |
|-------|---------|
| `/` | Landing page with CTA |
| `/snapshot` | Upload photo + lifestyle context form |
| `/experiments/:id/hypothesis` | AI analysis results + routine setup |
| `/experiments/:id/checkin` | Daily adherence tracking |
| `/experiments/:id/follow-up` | Final photo upload + outcome selection |
| `/experiments/:id/results` | Data visualization + scientific conclusion |

## External Dependencies

### Required Environment Variables
- `DATABASE_URL` — PostgreSQL connection string (required)
- `HF_TOKEN` — HuggingFace API token for MedGemma integration (optional, mock mode available)
- `USE_REAL_MEDGEMMA` — Set to `"true"` to enable real AI calls; defaults to mock responses

### Third-Party Services
- **HuggingFace API** — MedGemma model endpoint for AI-powered acne analysis (image + context → structured JSON with acne type, confidence, visual features)
- **GitHub (Octokit)** — Integration via Replit's GitHub connector for repository sync (utility script, not core functionality)

### Key NPM Packages
- `drizzle-orm` + `drizzle-zod` + `drizzle-kit` — Database ORM and schema management
- `express` + `express-session` — HTTP server and session management
- `@tanstack/react-query` — Async state management
- `react-hook-form` + `@hookform/resolvers` — Form handling with Zod validation
- `framer-motion` — Animations
- `recharts` — Data visualization charts
- `wouter` — Client-side routing
- `zod` — Runtime type validation (shared between client/server)
- `multer` — File upload handling (available but base64 approach used instead)
- `pg` + `connect-pg-simple` — PostgreSQL client and session store