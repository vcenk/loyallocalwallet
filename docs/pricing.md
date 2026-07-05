# Pricing Strategy — Local Loyalty Wallet

## 1. Pricing principle

The product should be affordable for small local businesses but not look cheap. Price below complex loyalty/CRM systems and close to wallet loyalty tools, with stronger retention features.

## 2. Suggested MVP pricing

| Plan | Monthly CAD | Target user | Core limits |
|---|---:|---|---|
| Starter | $19 | Solo local shop | 1 location, 1 card, 3 staff |
| Growth | $39 | Active shop wanting campaigns | 1 location, 3 cards, 10 staff, campaigns |
| Pro | $79 | Multi-location or busy shop | 3 locations, 10 cards, 30 staff, automation/export |

Offer 14-day or 15-day free trial.

## 3. Plan details

### Starter — CAD $19/month

For a simple single-location business.

Includes:

- 1 business
- 1 location
- 1 loyalty card
- Apple Wallet + Google Wallet card
- QR enrollment
- Staff scanner app
- 3 staff users
- Unlimited customers during MVP
- Basic customer list
- Basic analytics
- Manual stamp/redeem
- Bonus stamp button

Does not include:

- Campaign automation
- Advanced analytics
- Export
- Multiple locations

### Growth — CAD $39/month

For businesses that want marketing help.

Includes Starter plus:

- Up to 3 card designs/programs
- 10 staff users
- Manual campaigns
- Inactive customer list
- Suggested win-back messages
- Birthday rewards
- Referral tracking
- Basic export
- Custom bonus stamp reasons

### Pro — CAD $79/month

For larger or multi-location shops.

Includes Growth plus:

- Up to 3 locations
- Up to 10 card designs/programs
- 30 staff users
- Location-level analytics
- Staff activity reports
- Advanced campaign audiences
- Data export
- Priority support
- API/webhooks later

## 4. Add-ons later

- Extra location: CAD $15/month
- Extra 10 staff: CAD $10/month
- Done-for-you setup: CAD $99 one-time
- Custom card design: CAD $49 one-time
- White-label/agency: custom
- POS integration: add-on or Pro-only

## 5. Annual pricing

Offer 2 months free:

- Starter: CAD $190/year
- Growth: CAD $390/year
- Pro: CAD $790/year

## 6. Free plan?

Do not start with a permanent free plan unless needed for acquisition.

Better:

- 14-day free trial
- demo account
- free setup for first 10 pilot businesses

A free plan can attract low-quality users and support burden. The target customer is a business, not casual consumer.

## 7. Pilot pricing

For the first 5–10 local businesses:

- Free for 60 days
- Then CAD $19/month for 6 months
- In exchange for feedback, testimonial, and permission to use logo/case study

## 8. Pricing page structure

Hero:

**Simple pricing for local loyalty programs.**

Subtext:

Start with a wallet reward card, add customers by QR code, and bring them back with simple campaigns.

Pricing cards:

- Starter
- Growth — mark as “Best for most shops”
- Pro

FAQ:

- Do customers need an app? No.
- Does it work with Apple and Android? Yes, Apple Wallet and Google Wallet.
- Can my staff use their own phones? Yes.
- Can I cancel anytime? Yes.
- Can I import customers? Later/Pro.
- Does this replace my POS? No, not in v1.

## 9. Plan limit config

Use a config file, not hardcoded checks everywhere.

```ts
export const PLAN_LIMITS = {
  starter: {
    locations: 1,
    programs: 1,
    staff: 3,
    campaigns: false,
    export: false,
  },
  growth: {
    locations: 1,
    programs: 3,
    staff: 10,
    campaigns: true,
    export: true,
  },
  pro: {
    locations: 3,
    programs: 10,
    staff: 30,
    campaigns: true,
    export: true,
  },
} as const;
```
