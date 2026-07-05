# Environment Setup — Local Loyalty Wallet

## 1. Required accounts

Create these before coding wallet and billing features:

- GitHub
- Vercel
- Supabase
- Stripe
- Apple Developer Program
- Google Wallet issuer account
- Resend or another email provider
- Sentry
- PostHog
- Expo account for EAS builds

## 2. Local requirements

Recommended versions:

```txt
Node.js: 20+
pnpm: 9+
Git: latest stable
Expo CLI/EAS CLI: latest stable
Supabase CLI: latest stable
```

Install:

```bash
npm install -g pnpm
npm install -g eas-cli
npm install -g supabase
```

## 3. Suggested monorepo setup

```bash
mkdir local-loyalty-wallet
cd local-loyalty-wallet
pnpm init
mkdir -p apps/dashboard apps/staff-app packages/ui packages/db packages/wallet packages/config docs supabase/migrations
```

## 4. Environment files

Use:

```txt
.env.local                  # local developer secrets
.env.example                # safe template committed to repo
apps/dashboard/.env.local   # optional app-specific env
```

Never commit real secrets.

## 5. Dashboard env variables

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_STARTER_MONTHLY=
STRIPE_PRICE_GROWTH_MONTHLY=
STRIPE_PRICE_PRO_MONTHLY=

RESEND_API_KEY=
EMAIL_FROM="Local Loyalty Wallet <hello@example.com>"

SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

## 6. Wallet env variables

### Apple Wallet

```bash
APPLE_TEAM_ID=
APPLE_PASS_TYPE_IDENTIFIER=
APPLE_PASS_CERT_PATH=
APPLE_PASS_CERT_PASSWORD=
APPLE_WWDR_CERT_PATH=
APPLE_APNS_KEY_ID=
APPLE_APNS_TEAM_ID=
APPLE_APNS_PRIVATE_KEY_PATH=
```

Notes:

- Store certificates securely.
- Do not expose Apple certs to frontend/mobile.
- In production, prefer secret manager or protected Vercel env variables.

### Google Wallet

```bash
GOOGLE_WALLET_ISSUER_ID=
GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL=
GOOGLE_WALLET_PRIVATE_KEY=
GOOGLE_WALLET_ORIGINS=http://localhost:3000,https://yourdomain.com
```

Notes:

- Preserve newline formatting for private key.
- Use server-side only.

## 7. Staff app env variables

For Expo:

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api
SENTRY_AUTH_TOKEN=
```

Do not place service role keys in the Expo app.

## 8. Supabase setup

Steps:

1. Create Supabase project.
2. Copy project URL and anon key.
3. Run migrations.
4. Enable RLS.
5. Configure auth email templates.
6. Configure redirect URLs:
   - local dashboard URL
   - production dashboard URL
   - Expo deep link if needed

Suggested local command:

```bash
supabase start
supabase db reset
supabase gen types typescript --local > packages/db/src/database.types.ts
```

## 9. Stripe setup

Create products/prices:

- Starter monthly
- Growth monthly
- Pro monthly
- Optional annual prices later

Webhook events to listen for:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

Local webhook testing:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## 10. Expo staff app setup

```bash
cd apps/staff-app
npx create-expo-app . --template
npx expo install expo-camera expo-barcode-scanner
```

Recommended packages:

```bash
pnpm add @supabase/supabase-js zod
```

Build later:

```bash
eas build --platform ios
eas build --platform android
```

## 11. Development order

1. Create Supabase schema and policies.
2. Build dashboard auth.
3. Build business onboarding.
4. Build loyalty program CRUD.
5. Build enrollment page without wallet integration.
6. Build staff scanner using mocked wallet pass token.
7. Add real Apple/Google Wallet.
8. Add Stripe.
9. Add analytics.
10. Pilot test.
