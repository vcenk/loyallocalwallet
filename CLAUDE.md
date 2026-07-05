# CLAUDE.md — Coding Instructions for Local Loyalty Wallet

You are building **Local Loyalty Wallet**, a wallet-first loyalty platform for local small businesses.

## Product rule

Do not build a customer mobile app for MVP.

Customer flow is:

```txt
Scan QR -> enroll on web -> save to Apple Wallet or Google Wallet -> show wallet card in store
```

Apps in MVP:

1. Business dashboard web app.
2. Staff scanner mobile app.

## Core positioning

No-app loyalty wallet + simple retention automation for cafés, salons, restaurants, barbers, pet groomers, and local shops.

## Architecture rules

Use this structure unless explicitly changed:

```txt
apps/dashboard       # Next.js dashboard
apps/staff-app       # Expo React Native scanner app
packages/ui          # shared UI
packages/db          # Supabase types/queries
packages/wallet      # wallet pass helpers, server-side only for secrets
packages/config      # plan limits, enums, constants
supabase/migrations  # database migrations
docs                 # product and technical docs
```

## Stack

- TypeScript everywhere
- Next.js for dashboard
- Tailwind for dashboard UI
- Expo React Native for staff app
- Supabase Postgres/Auth/Storage
- Stripe Billing
- Apple PassKit
- Google Wallet API
- Resend for email
- Sentry for error tracking
- PostHog for analytics

## Coding style

- Write small, clear components.
- Prefer server-side validation for business-critical actions.
- Use Zod for request validation.
- Use explicit TypeScript types.
- Avoid `any` unless unavoidable.
- Keep wallet secrets server-side only.
- Never expose service role keys to client or Expo app.
- Prefer boring, maintainable code over clever abstractions.

## MVP boundaries

Build these:

- Auth
- Business onboarding
- Locations
- Staff roles
- Loyalty program/card designer
- QR enrollment
- Customer enrollment
- Wallet pass generation
- Staff scanner
- Add stamp
- Redeem reward
- Bonus stamp reasons
- Customer list
- Inactive customer list
- Manual/suggested campaign
- Stripe subscriptions
- Audit logs

Do not build these in MVP:

- Customer app
- POS integrations
- Cross-shop marketplace
- White-label agency mode
- Automatic social-share verification
- Google review rewards
- Gift cards
- Booking system
- Advanced AI campaign autopilot

## Wallet implementation rules

- Direct implementation: `passkit-generator` for Apple, Google Wallet REST API for Google. No third-party pass providers (per-pass fees kill margin).
- Campaign messages are pass field updates, not free push notifications. Enforce title ≤ 40 chars, body ≤ 140 chars.
- Apple unregister endpoint must void the pass. Voided passes are excluded from audiences and inactive counts.

## Progress calculation rule

Never hardcode stamp math around `quantity = 1`. All progress logic must:

- Sum `stamp_events.quantity` (earn + bonus − remove/adjustment) per pass/program.
- Live in one shared function (e.g. `calculateProgress()` in packages/config or db) used by scan, stamp, redeem, and analytics.
- Keep `program_type` a parameter so points mode can be enabled later without refactoring.

## Compliance rule

Do not implement a feature that rewards customers for leaving a Google review. Review requests must be non-incentivized.

Acceptable:

- Send a review request after reward redemption.

Not acceptable:

- “Leave a Google review and get a stamp.”

## Security rules

- Enable RLS on tenant tables.
- Every tenant table should include `business_id` unless globally scoped.
- Staff can only access assigned businesses/locations.
- Every stamp, bonus, adjustment, and redemption must create an audit log.
- QR codes must use opaque/signed tokens, not raw customer IDs.
- Stripe webhooks must verify signature.
- Wallet credentials must only be used server-side.

## Database source of truth

Use `/docs/database-schema.md` as the schema source of truth.

If changing schema:

1. Update migration.
2. Update generated types.
3. Update docs.
4. Update affected API/spec.

## API source of truth

Use `/docs/api-spec.md` for endpoint behavior.

All API errors should use:

```ts
{
  error: {
    code: string,
    message: string
  }
}
```

## UI guidance

Use `/docs/design.md`.

Dashboard language should be simple:

- customers
- stamps
- rewards
- visits
- inactive customers
- campaigns

Avoid enterprise CRM jargon.

## Development sequence

Follow `/docs/mvp-roadmap.md` and `/docs/to-do.md`.

Recommended build order:

1. Supabase schema/RLS
2. Dashboard auth
3. Business onboarding
4. Loyalty card builder
5. Customer enrollment without wallet
6. Staff scanner and stamp logic
7. Wallet integration
8. Analytics/retention
9. Stripe billing
10. Pilot polish

## Testing expectations

For critical logic, create tests or at least clear validation functions for:

- permission checks
- stamp calculation
- reward availability
- redemption reset
- plan limits
- wallet pass update payloads

## Response behavior when coding

When implementing, do not overbuild. Complete one vertical slice at a time. After each major step, state:

- What changed
- Files changed
- How to test
- Known limitations
- Next recommended task
