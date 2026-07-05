# Local Loyalty Wallet — MVP Documentation Pack

Working product name: **Local Loyalty Wallet**  
Positioning: **No-app loyalty cards + AI win-back marketing for local businesses.**

This documentation pack is intended to help start coding with Claude Code or another coding assistant. It defines the MVP scope, architecture, database, API, security rules, roadmap, pricing, and launch plan.

## Core MVP

Businesses create loyalty cards. Customers join by QR code and save the card to Apple Wallet or Google Wallet. Staff use a mobile scanner app to add stamps and redeem rewards. The dashboard shows customer activity and suggests simple win-back campaigns.

## Recommended repository structure

```txt
local-loyalty-wallet/
  apps/
    dashboard/          # Next.js business dashboard
    staff-app/          # Expo React Native staff scanner
  packages/
    ui/                 # Shared UI components
    db/                 # Supabase types and queries
    config/             # Shared config, constants, plan limits
    wallet/             # Apple/Google wallet helpers
  supabase/
    migrations/
    seed.sql
  docs/
    project.md
    design.md
    architecture.md
    database-schema.md
    api-spec.md
    user-stories.md
    env-setup.md
    security.md
    mvp-roadmap.md
    pricing.md
    launch-plan.md
    to-do.md
  CLAUDE.md
  .env.example
```

## Build order

1. Supabase schema and RLS.
2. Dashboard auth and business onboarding.
3. Loyalty program/card designer.
4. Customer enrollment page and QR code.
5. Staff app scanner and stamp events.
6. Reward redemption flow.
7. Wallet pass generation and updates.
8. Analytics and inactive customer list.
9. Stripe billing.
10. Pilot launch.

## Key rule

Do not build a customer app in v1. The customer experience is QR code → Apple/Google Wallet → in-store scan → stamps/rewards.
