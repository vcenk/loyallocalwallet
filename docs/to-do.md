# To-Do Plan — Local Loyalty Wallet

Use this as the implementation checklist for Claude Code.

## 0. Before coding

- [ ] Choose final product name.
- [ ] Choose domain or temporary dev domain.
- [ ] Create GitHub repository.
- [ ] Create Supabase project.
- [ ] Create Vercel project.
- [ ] Create Stripe account.
- [ ] Create Apple Developer account (DO FIRST — approval takes days; then create Pass Type ID + signing certificate + APNs key).
- [ ] Create Google Wallet issuer account (DO FIRST — approval is not instant).
- [x] DECIDED: direct wallet implementation (`passkit-generator` + Google Wallet REST API). No third-party pass provider.

## 1. Documentation setup

- [ ] Add `README.md`.
- [ ] Add `CLAUDE.md`.
- [ ] Add `docs/project.md`.
- [ ] Add `docs/design.md`.
- [ ] Add `docs/architecture.md`.
- [ ] Add `docs/database-schema.md`.
- [ ] Add `docs/api-spec.md`.
- [ ] Add `docs/user-stories.md`.
- [ ] Add `docs/env-setup.md`.
- [ ] Add `docs/security.md`.
- [ ] Add `docs/mvp-roadmap.md`.
- [ ] Add `docs/pricing.md`.
- [ ] Add `docs/launch-plan.md`.
- [ ] Add `.env.example`.

## 2. Repository setup

- [ ] Create pnpm workspace.
- [ ] Create `apps/dashboard`.
- [ ] Create `apps/staff-app`.
- [ ] Create `packages/ui`.
- [ ] Create `packages/db`.
- [ ] Create `packages/wallet`.
- [ ] Create `packages/config`.
- [ ] Configure TypeScript.
- [ ] Configure ESLint/Prettier.
- [ ] Configure Tailwind.
- [ ] Configure shared path aliases.

## 3. Supabase setup

- [ ] Create initial migrations.
- [ ] Add enum types.
- [ ] Add `profiles`.
- [ ] Add `businesses`.
- [ ] Add `locations`.
- [ ] Add `staff_members`.
- [ ] Add `loyalty_programs`.
- [ ] Add `card_designs`.
- [ ] Add `customers`.
- [ ] Add `wallet_passes`.
- [ ] Add `stamp_events`.
- [ ] Add `reward_redemptions`.
- [ ] Add `campaigns`.
- [ ] Add `campaign_recipients`.
- [ ] Add `referrals`.
- [ ] Add `bonus_stamp_rules`.
- [ ] Add `audit_logs`.
- [ ] Add `subscription_events`.
- [ ] Enable RLS.
- [ ] Add tenant isolation policies.
- [ ] Generate TypeScript types.

## 4. Dashboard auth and onboarding

- [ ] Create auth pages.
- [ ] Create protected dashboard layout.
- [ ] Create onboarding flow.
- [ ] Create business profile form.
- [ ] Create first location form.
- [ ] Assign owner role after business creation.

## 5. Loyalty card builder

- [ ] Create program list page.
- [ ] Create program creation form.
- [ ] Add stamp-card rule fields.
- [ ] Add reward title/description.
- [ ] Add status: draft/active/paused.
- [ ] Create card design form.
- [ ] Add logo upload.
- [ ] Add color picker.
- [ ] Add wallet preview.
- [ ] Add QR enrollment generator.

## 6. Customer enrollment

- [ ] Create public join page.
- [ ] Load program by slug/id.
- [ ] Create enrollment form.
- [ ] Add consent checkbox.
- [ ] Create customer row.
- [ ] Create wallet_pass placeholder.
- [ ] Show success page.
- [ ] Add “Add to Apple Wallet” placeholder.
- [ ] Add “Save to Google Wallet” placeholder.

## 7. Staff app

- [ ] Create Expo app.
- [ ] Add Supabase login.
- [ ] Add business/location selector.
- [ ] Add scanner screen.
- [ ] Add scan validation API.
- [ ] Add customer result screen.
- [ ] Add Add Stamp button.
- [ ] Add Redeem Reward button.
- [ ] Add Bonus Stamp reason modal.
- [ ] Add success/error toasts.
- [ ] Add basic offline/network error handling.

## 8. Stamp and redemption logic

- [ ] Implement `POST /api/staff/scan`.
- [ ] Implement `POST /api/staff/stamps`.
- [ ] Implement `POST /api/staff/redeem`.
- [ ] Update wallet_pass progress.
- [ ] Calculate reward availability.
- [ ] Reset/adjust stamps after redemption.
- [ ] Write audit logs.
- [ ] Add duplicate/rate-limit protection.

## 9. Wallet integration

- [ ] Create wallet helper package.
- [ ] Add Apple pass generation.
- [ ] Add Apple pass signing.
- [ ] Add Apple pass download endpoint.
- [ ] Add Apple pass update endpoints.
- [ ] Add APNs pass update push.
- [ ] Add Google Wallet class creation.
- [ ] Add Google Wallet object creation.
- [ ] Add Google save link.
- [ ] Add Google object patch after stamps/redemptions.
- [ ] Handle Apple unregister endpoint → mark pass voided.
- [ ] Exclude voided passes from campaign audiences and inactive counts.
- [ ] Enforce campaign message length limits (title 40 / body 140 chars).
- [ ] Test on real iPhone.
- [ ] Test on real Android.

## 10. Dashboard customer management

- [ ] Customer list page.
- [ ] Search/filter customers.
- [ ] Customer detail page.
- [ ] Customer timeline.
- [ ] Stamp history.
- [ ] Redemption history.
- [ ] Manual adjustment with reason.

## 11. Analytics and retention

- [ ] Overview stats.
- [ ] Inactive customer count.
- [ ] Close-to-reward customer count.
- [ ] Rewards available count.
- [ ] Inactive customer page.
- [ ] Rules-based win-back suggestion.
- [ ] Manual campaign composer.
- [ ] Campaign history.

## 12. Billing

- [ ] Create Stripe products/prices.
- [ ] Add checkout session endpoint.
- [ ] Add customer portal endpoint.
- [ ] Add Stripe webhook handler.
- [ ] Store stripe_customer_id.
- [ ] Store stripe_subscription_id.
- [ ] Enforce plan limits.
- [ ] Add billing page.

## 13. Security hardening

- [ ] Check all RLS policies.
- [ ] Ensure no service role key in client.
- [ ] Verify Stripe webhook signature.
- [ ] Protect wallet secrets.
- [ ] Use opaque QR tokens.
- [ ] Add rate limiting.
- [ ] Add audit log viewer.
- [ ] Add Sentry.
- [ ] Add privacy/terms pages.

## 14. Pilot readiness

- [ ] Create demo business.
- [ ] Create test program.
- [ ] Create QR poster.
- [ ] Create owner onboarding checklist.
- [ ] Create staff training checklist.
- [ ] Test full flow in-store simulation.
- [ ] Fix scanner speed issues.
- [ ] Prepare pilot outreach message.
- [ ] Recruit 3–5 pilot businesses.
