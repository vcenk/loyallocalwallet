# Local Loyalty Wallet

Wallet-first loyalty platform for local small businesses. Customers enroll by QR
code and save a loyalty card to **Apple Wallet** or **Google Wallet** — no
customer app required. Staff use a mobile scanner to add stamps and redeem
rewards. The dashboard shows customer activity and suggests simple win-back
campaigns.

> **Customer flow:** Scan QR → enroll on web → save to Apple/Google Wallet → show card in store.

## Repository structure

```txt
local-loyalty-wallet/
  apps/
    dashboard/          # Next.js business dashboard        (built in Phase 2)
    staff-app/          # Expo React Native staff scanner   (built in Phase 4)
  packages/
    ui/                 # Shared UI components
    db/                 # Supabase client, types, queries
    wallet/             # Apple/Google wallet helpers (server-side secrets only)
    config/             # Plan limits, enums, constants, feature flags
  supabase/
    migrations/         # Database migrations (schema source of truth: docs/database-schema.md)
    seed.sql
  docs/                 # Product and technical documentation
  CLAUDE.md             # Coding instructions for AI assistants
  .env.example          # Safe env template (never commit real secrets)
```

## Tech stack

- **Monorepo:** pnpm workspaces
- **Dashboard:** Next.js + TypeScript + Tailwind
- **Staff app:** Expo React Native
- **Database/Auth/Storage:** Supabase (Postgres)
- **Payments:** Stripe Billing
- **Wallet:** Apple PassKit (`passkit-generator`) + Google Wallet REST API
- **Email:** Resend · **Analytics:** PostHog · **Errors:** Sentry

## Prerequisites

```txt
Node.js 20+
pnpm 9+
Supabase CLI, Expo/EAS CLI (for later phases)
```

## Getting started

```bash
pnpm install          # install workspace dependencies
cp .env.example .env.local   # then fill in real values (see docs/env-setup.md)
```

> **Status:** Phase 0 (project setup) — the monorepo skeleton exists. Individual
> apps/packages are scaffolded and wired up in their respective phases per
> [`docs/mvp-roadmap.md`](docs/mvp-roadmap.md).

## Documentation

Start with [`docs/README.md`](docs/README.md). Sources of truth:

- Product scope & rules — [`CLAUDE.md`](CLAUDE.md), [`docs/project.md`](docs/project.md)
- Architecture — [`docs/architecture.md`](docs/architecture.md)
- Database schema — [`docs/database-schema.md`](docs/database-schema.md)
- API spec — [`docs/api-spec.md`](docs/api-spec.md)
- Security & compliance — [`docs/security.md`](docs/security.md)
- Roadmap & checklist — [`docs/mvp-roadmap.md`](docs/mvp-roadmap.md), [`docs/to-do.md`](docs/to-do.md)

## Security notes

- Wallet signing secrets and the Supabase **service role key** are server-side only — never in the client or the Expo app.
- QR codes use opaque/signed tokens, not raw customer IDs.
- All tenant tables use `business_id` + Supabase RLS.
