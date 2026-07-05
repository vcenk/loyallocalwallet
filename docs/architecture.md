# Architecture — Local Loyalty Wallet

## 1. Recommended stack

| Layer | Choice |
|---|---|
| Monorepo | pnpm workspaces + Turborepo optional |
| Business dashboard | Next.js + TypeScript + Tailwind |
| Staff app | Expo React Native |
| Database | Supabase Postgres |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Backend/API | Next.js route handlers + Supabase Edge Functions or Node service |
| Wallet generation | Apple PassKit + Google Wallet API |
| Payments | Stripe Billing |
| Email | Resend |
| Analytics | PostHog |
| Error tracking | Sentry |
| Background jobs | Supabase cron or external worker later |
| AI phase 2 | OpenAI or Claude API |

## 2. High-level system

```txt
Business Owner
  -> Dashboard Web App
    -> Supabase Auth
    -> Supabase Postgres
    -> Stripe Billing
    -> Wallet Service
    -> Email Service

Customer
  -> Enrollment Landing Page
    -> Creates customer + wallet pass
    -> Adds pass to Apple Wallet / Google Wallet

Staff
  -> Expo Staff App
    -> Scans wallet QR
    -> Calls API to add stamp/redeem reward
    -> Updates pass through Wallet Service
```

## 3. Applications

### apps/dashboard

Purpose: business owner/admin web app.

Responsibilities:

- Auth
- Business onboarding
- Loyalty program management
- Card design
- QR enrollment link
- Customer list
- Campaigns
- Analytics
- Billing
- Settings

### apps/staff-app

Purpose: staff scanner app for iOS and Android.

Responsibilities:

- Staff login
- Location selection
- QR scan
- Add stamp
- Redeem reward
- Add bonus stamp
- View customer status

### packages/ui

Shared UI components for dashboard.

### packages/db

Supabase client, generated database types, reusable query functions.

### packages/wallet

Apple and Google Wallet helper functions. Keep signing and secret handling server-side only.

### packages/config

Plan limits, constants, feature flags, enums.

## 4. Backend service boundaries

### Dashboard API

Handles business-owner actions:

- Create/edit program
- Create/edit locations
- Invite staff
- Manage campaigns
- Fetch analytics
- Billing portal

### Staff API

Handles high-frequency counter operations:

- Validate QR
- Add stamp
- Redeem reward
- Add bonus stamp
- Log audit event
- Trigger wallet update

### Wallet API

Handles:

- Apple pass creation
- Apple pass web service update endpoints
- Google Wallet class/object creation
- Google Wallet object updates
- Secure pass signing

Keep the wallet API narrow and well-tested.

## 5. Core data flow: customer enrollment

```txt
1. Business prints enrollment QR.
2. Customer scans QR.
3. Enrollment page loads with program_id.
4. Customer submits first name + optional email/phone.
5. Server creates customer row.
6. Server creates wallet_pass row.
7. Server creates Apple/Google wallet object.
8. Customer saves pass.
9. Dashboard shows new customer.
```

## 6. Core data flow: add stamp

```txt
1. Staff scans QR/barcode from customer wallet.
2. Staff app calls POST /api/staff/scan.
3. API validates pass token and staff permissions.
4. API returns customer + current progress.
5. Staff taps Add Stamp.
6. API creates stamp_events row.
7. API updates customer progress.
8. API checks reward availability.
9. API updates Apple/Google Wallet pass.
10. API writes audit_logs row.
```

## 7. Core data flow: redeem reward

```txt
1. Staff scans customer card.
2. API detects reward available.
3. Staff taps Redeem.
4. API creates reward_redemptions row.
5. API resets or adjusts progress depending on reward rule.
6. API updates wallet pass.
7. API writes audit log.
```

## 8. Authentication and authorization

Use Supabase Auth.

Roles:

- platform_admin
- business_owner
- business_admin
- manager
- staff

Authorization rules:

- A user can only access businesses where they have a staff_members row.
- Staff can only stamp/redeem for assigned business/location.
- Only owner/admin/manager can create campaigns.
- Only owner/admin can manage billing.

## 9. Wallet implementation strategy

### MVP strategy

**Decision: direct implementation.** Do not use PassKit-as-a-service providers — per-pass fees destroy margin at CAD $19/month pricing. Build a small wallet service inside the Next.js app or a separate Node package using `passkit-generator` (Apple) and the Google Wallet REST API.

Apple:

- Generate `.pkpass` file server-side.
- Store pass identifiers and authentication token.
- Implement update endpoints needed by Apple Wallet pass web service.
- Send push updates through APNs when pass changes.

Google:

- Create loyalty class once per program or business.
- Create loyalty object per customer.
- Use signed save link for enrollment.
- Patch object when stamps/rewards change.

### Wallet messaging limitation (must be understood before building campaigns)

Apple Wallet does NOT support arbitrary marketing push notifications. A "campaign message" is implemented by updating a pass field (e.g. a `message` back/front field) and triggering an APNs pass-update push; the lock-screen notification shows the changed field text. Google Wallet supports message objects on the pass. Consequences:

- Campaign copy must fit in a short pass field.
- Delivery depends on the customer having notifications enabled for Wallet.
- Dashboard copy must call these "wallet card updates", never "push marketing" — set owner expectations accordingly.

### Pass lifecycle: uninstall handling

When a customer deletes a pass:

- Apple calls the DELETE registration endpoint → mark wallet_pass `status = 'voided'` and store `uninstalled_at`.
- Google: poll/patch errors or object state indicate removal; mark voided on failed patch with a "not found/removed" response.
- Voided passes must be excluded from campaign audiences and inactive-customer counts (they are lost, not inactive).

### Important rule

Never expose Apple certificates, private keys, Google service account credentials, or pass authentication tokens to the frontend or mobile app.

## 10. Deployment

### Dashboard

Deploy to Vercel.

### Supabase

Use Supabase hosted project for database/auth/storage.

### Staff app

Use Expo EAS Build for iOS and Android.

### Wallet service

MVP can run as Next.js server routes. If pass updates or signing complexity grows, extract to a separate Node service.

## 11. Observability

Add from day one:

- Sentry for frontend/backend errors
- PostHog for product events
- Basic audit_logs table
- API request IDs for critical actions

Important events:

- business_signed_up
- program_created
- customer_enrolled
- pass_created
- stamp_added
- reward_redeemed
- campaign_sent
- billing_started

## 12. Future architecture

Phase 2 may add:

- Background campaign scheduler
- n8n automation
- AI insights service
- POS integration services
- Webhook ingestion
- Agency/white-label tenant structure
