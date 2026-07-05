# MVP Roadmap — Local Loyalty Wallet

This roadmap assumes one primary builder using Claude Code. Timeline can be compressed or expanded depending on experience.

## Phase 0 — Project setup, 1–2 days

Goals:

- Create repo
- Create monorepo structure
- Create Supabase project
- Create Vercel project
- Add documentation
- **Start Apple Developer enrollment ($99/yr) and create the Pass Type ID + certificates NOW** — approval and cert setup can take days and blocks Phase 5
- **Apply for Google Wallet issuer account NOW** — approval is not instant

Deliverables:

- Repo structure
- README
- CLAUDE.md
- .env.example
- Supabase migration folder

## Phase 1 — Database and auth, 3–5 days

Goals:

- Supabase schema
- RLS policies
- Auth flow
- Business/staff relationship

Deliverables:

- profiles
- businesses
- locations
- staff_members
- RLS policies
- dashboard login
- onboarding shell

Definition of done:

- User can sign up.
- User can create business.
- User becomes business_owner.
- User cannot access other businesses.

## Phase 2 — Dashboard MVP, 5–7 days

Goals:

- Business setup
- Program creation
- Card design
- QR enrollment

Deliverables:

- Dashboard layout
- Business settings page
- Location page
- Loyalty program CRUD
- Card design form
- Enrollment QR display

Definition of done:

- Business can create a stamp card.
- Business can preview card.
- Business can get QR enrollment link.

## Phase 3 — Customer enrollment without wallet, 3–4 days

Goals:

- Build public enrollment page
- Create customer records
- Create wallet_pass placeholder records

Deliverables:

- `/join/[programSlug]`
- enrollment form
- customer creation
- pass token generation
- success page

Definition of done:

- Customer can scan QR and enroll.
- Customer appears in dashboard.

## Phase 4 — Staff app/scanner, 5–7 days

Goals:

- Expo app
- Staff login
- QR scanner
- Add stamp
- Redeem reward

Deliverables:

- Expo project
- login screen
- location selector
- scanner screen
- customer result screen
- add stamp API
- redeem API
- audit logs

Definition of done:

- Staff can scan enrolled customer token.
- Staff can add stamp.
- Dashboard shows updated progress.

## Phase 5 — Wallet integration, 7–14 days

Goals:

- Generate Apple Wallet pass
- Generate Google Wallet pass
- Update wallet after stamp/redeem

Deliverables:

- Apple `.pkpass` generation
- Google Wallet object creation
- save-to-wallet links/buttons
- pass update service
- Apple unregister endpoint → void pass
- pass QR/barcode linked to scanner

Note: campaign "messages" are pass field updates + APNs pushes, not free-form push notifications. Build the message field into the pass template now.

Definition of done:

- Customer can save real wallet pass.
- Staff can scan wallet pass.
- Pass updates after stamp.

Risk:

- Apple Wallet certificates and update endpoints can take longer than expected.

## Phase 6 — Analytics and retention, 4–6 days

Goals:

- Basic dashboard analytics
- Inactive customer list
- Rules-based campaign suggestion

Deliverables:

- overview metrics
- customer filters
- inactive customer groups
- suggested win-back campaign
- campaign creation and history

Definition of done:

- Owner sees inactive customers.
- Owner can generate a simple campaign suggestion.

## Phase 7 — Stripe billing, 3–5 days

Goals:

- Subscription plans
- Checkout
- Webhook
- Plan limits

Deliverables:

- Stripe Checkout
- customer portal
- webhook handler
- plan status sync
- trial state
- basic plan limits

Definition of done:

- Business can start paid plan.
- Subscription status updates in database.

## Phase 8 — Pilot readiness, 5–7 days

Goals:

- Polish
- Fix bugs
- Prepare pilot materials
- Test with real shop

Deliverables:

- onboarding checklist
- QR poster PDF/image
- demo account
- seed data
- privacy/terms draft
- error tracking
- pilot feedback form

Definition of done:

- One real business can use it for one week.
- Staff can operate without developer help.

## Recommended MVP timeline

| Phase | Time |
|---|---:|
| Setup | 1–2 days |
| DB/Auth | 3–5 days |
| Dashboard | 5–7 days |
| Enrollment | 3–4 days |
| Staff app | 5–7 days |
| Wallet integration | 7–14 days |
| Analytics/retention | 4–6 days |
| Stripe | 3–5 days |
| Pilot readiness | 5–7 days |
| Total | 5–8 weeks |

## Practical shortcut

If Apple/Google Wallet takes too long, launch internal beta with QR enrollment + staff scanner + web-based customer progress page first, then add Wallet in phase 5. Do not delay the whole product because of pass certificates.
