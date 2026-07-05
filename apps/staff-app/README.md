# apps/staff-app

Expo React Native staff scanner. Staff sign in, scan a customer's wallet QR (or
enter the code manually), and add stamps / redeem rewards / add bonus stamps.
It talks to the dashboard's `/api/staff/*` endpoints over HTTP — it holds no
service-role key or wallet secrets.

## Screens

- **Login** — Supabase email/password.
- **Scanner** — camera QR scan (`expo-camera`) + manual code entry fallback.
- **Result** — customer + progress, with Add stamp / Redeem / Bonus actions.

## Run

```bash
cp .env.example .env.local
# fill EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY,
# and EXPO_PUBLIC_API_BASE_URL (use your computer's LAN IP for a real phone,
# e.g. http://192.168.1.50:3000/api — not localhost)

pnpm --filter @llw/staff-app start
# then scan the QR with Expo Go (iOS/Android), or press i / a for a simulator
```

The dashboard (`apps/dashboard`) must be running so the API is reachable, and the
staff user must be an active `staff_members` row for the business.

## Notes

- **Versions:** if install complains, run `npx expo install --fix` inside this
  folder to align native package versions to the installed Expo SDK.
- **pnpm + Metro:** this app ships a monorepo-aware `metro.config.js`. If Metro
  can't resolve a module, add `node-linker=hoisted` to the repo-root `.npmrc`
  and reinstall (Expo resolves more reliably with a hoisted layout).
- **Auth:** uses the anon key + AsyncStorage session persistence. Never add the
  service role key here.
