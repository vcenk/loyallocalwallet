# API Specification — Local Loyalty Wallet

Base path: `/api`.

All business/admin endpoints require Supabase session. Staff endpoints require Supabase session and staff membership. Customer enrollment endpoints may be public but must use signed/opaque identifiers.

## 1. Auth and session

Use Supabase Auth directly on frontend. API should verify user session server-side for protected routes.

## 2. Business onboarding

### POST /api/businesses

Create a business.

Request:

```json
{
  "name": "Main Street Cafe",
  "industry": "cafe",
  "timezone": "America/Vancouver",
  "country": "CA",
  "currency": "CAD"
}
```

Response:

```json
{
  "businessId": "uuid",
  "slug": "main-street-cafe"
}
```

### GET /api/businesses/:businessId

Return business profile and current user role.

### PATCH /api/businesses/:businessId

Update profile, logo, colors, website, phone, and settings.

## 3. Locations

### GET /api/businesses/:businessId/locations

List locations.

### POST /api/businesses/:businessId/locations

Create location.

### PATCH /api/locations/:locationId

Update location.

## 4. Loyalty programs

### GET /api/businesses/:businessId/programs

List programs.

### POST /api/businesses/:businessId/programs

Create loyalty program.

Request:

```json
{
  "name": "Coffee Rewards",
  "programType": "stamps",
  "stampsRequired": 10,
  "rewardTitle": "Free Coffee",
  "rewardDescription": "Get one regular coffee free after 10 stamps."
}
```

### GET /api/programs/:programId

Get program details.

### PATCH /api/programs/:programId

Update program.

### POST /api/programs/:programId/publish

Set program active and create wallet class/config if needed.

## 5. Card design

### GET /api/programs/:programId/card-design

Get card design.

### PUT /api/programs/:programId/card-design

Update design.

Request:

```json
{
  "logoUrl": "https://...",
  "backgroundColor": "#2563EB",
  "foregroundColor": "#FFFFFF",
  "labelColor": "#E5E7EB",
  "stampIcon": "coffee"
}
```

### GET /api/programs/:programId/enrollment-qr

Return enrollment URL and QR image/SVG.

## 6. Public enrollment

### GET /join/:programSlug

Public landing page, not necessarily an API route.

### POST /api/public/programs/:programId/enroll

Create customer and wallet pass.

Request:

```json
{
  "firstName": "Alex",
  "email": "alex@example.com",
  "phone": "+16045551234",
  "marketingConsent": true,
  "language": "en",
  "platform": "apple"
}
```

Response:

```json
{
  "customerId": "uuid",
  "walletPassId": "uuid",
  "applePassDownloadUrl": "/api/wallet/apple/passes/{serialNumber}",
  "googleSaveUrl": "https://pay.google.com/gp/v/save/..."
}
```

## 7. Wallet endpoints

### GET /api/wallet/apple/passes/:serialNumber

Returns signed `.pkpass` file.

### POST /api/wallet/apple/v1/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier/:serialNumber

Apple Wallet registration endpoint.

### DELETE /api/wallet/apple/v1/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier/:serialNumber

Apple Wallet unregister endpoint. Must set the wallet_pass `status = 'voided'` and record `uninstalled_at`. Voided passes are excluded from campaign audiences and inactive counts.

### GET /api/wallet/apple/v1/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier

Return changed serial numbers.

### GET /api/wallet/apple/v1/passes/:passTypeIdentifier/:serialNumber

Return latest pass.

### POST /api/wallet/google/objects/:walletPassId/update

Internal endpoint to patch Google Wallet object.

## 8. Staff scanning

### POST /api/staff/scan

Validate scanned QR/barcode.

Request:

```json
{
  "barcodeValue": "opaque-pass-token-or-serial",
  "locationId": "uuid"
}
```

Response:

```json
{
  "customerId": "uuid",
  "customerName": "Alex",
  "programId": "uuid",
  "programName": "Coffee Rewards",
  "currentStamps": 7,
  "stampsRequired": 10,
  "rewardsAvailable": 0,
  "lastSeenAt": "2026-07-05T12:00:00Z"
}
```

### POST /api/staff/stamps

Add stamp or bonus stamp.

Request:

```json
{
  "customerId": "uuid",
  "programId": "uuid",
  "walletPassId": "uuid",
  "locationId": "uuid",
  "quantity": 1,
  "eventType": "earn",
  "reason": "purchase"
}
```

Response:

```json
{
  "currentStamps": 8,
  "rewardsAvailable": 0,
  "walletUpdated": true
}
```

### POST /api/staff/redeem

Redeem an available reward.

Request:

```json
{
  "customerId": "uuid",
  "programId": "uuid",
  "walletPassId": "uuid",
  "locationId": "uuid"
}
```

Response:

```json
{
  "redemptionId": "uuid",
  "currentStamps": 0,
  "rewardsAvailable": 0,
  "walletUpdated": true
}
```

## 9. Customers

### GET /api/businesses/:businessId/customers

Query params:

- `q`
- `status`
- `inactiveDays`
- `programId`
- `page`
- `limit`

### GET /api/customers/:customerId

Return customer profile, timeline, wallet passes, stamp history, and redemptions.

### PATCH /api/customers/:customerId

Update customer notes, name, email, phone, language, consent.

## 10. Campaigns

### GET /api/businesses/:businessId/campaigns

List campaigns.

### POST /api/businesses/:businessId/campaigns

Create campaign.

Request:

```json
{
  "programId": "uuid",
  "name": "21-day win-back",
  "audienceKey": "inactive_21_days",
  "messageTitle": "We miss you",
  "messageBody": "Come back this week for a bonus stamp."
}
```

### POST /api/campaigns/:campaignId/send

Send/update wallet messages to audience.

Rules:

- `messageTitle` max 40 chars, `messageBody` max 140 chars (must render as a wallet pass field).
- Audience must exclude wallet_passes with `status = 'voided'`.
- Campaign delivery = pass field update + APNs push (Apple) or message object (Google), not a standalone push notification.

### POST /api/campaigns/suggest

Return simple suggested campaign. MVP can be rules-based, AI later.

Request:

```json
{
  "businessId": "uuid",
  "programId": "uuid",
  "suggestionType": "win_back"
}
```

Response:

```json
{
  "audienceSize": 23,
  "messageTitle": "We miss you",
  "messageBody": "Visit this week and get a bonus stamp.",
  "reason": "23 customers have not visited in 21+ days."
}
```

## 11. Analytics

### GET /api/businesses/:businessId/analytics/overview

Return:

- total customers
- new customers this week
- stamps issued this week
- redemptions this week
- inactive customers
- close-to-reward customers

### GET /api/businesses/:businessId/analytics/inactive-customers

Return inactive customers grouped by 14, 21, 30, 60 days.

## 12. Staff management

### GET /api/businesses/:businessId/staff

List staff.

### POST /api/businesses/:businessId/staff/invite

Invite staff by email.

### PATCH /api/staff/:staffMemberId

Update role/location/is_active.

## 13. Billing

### POST /api/billing/create-checkout-session

Creates Stripe Checkout session.

### POST /api/billing/create-portal-session

Creates Stripe customer portal session.

### POST /api/webhooks/stripe

Stripe webhook handler.

Must verify Stripe signature.

## 14. Error format

All API errors should return:

```json
{
  "error": {
    "code": "permission_denied",
    "message": "You do not have permission to perform this action."
  }
}
```

Common codes:

- `unauthorized`
- `permission_denied`
- `not_found`
- `validation_error`
- `plan_limit_reached`
- `wallet_update_failed`
- `stripe_error`
- `rate_limited`
