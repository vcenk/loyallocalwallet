# Security and Compliance — Local Loyalty Wallet

## 1. Security principles

- Tenant isolation is mandatory.
- Staff permissions must be enforced server-side.
- Wallet signing secrets must never reach client apps.
- Every stamp and redemption must be auditable.
- Collect the minimum customer data needed.
- Avoid dark patterns and review-policy violations.

## 2. Data classification

### Business data

- Business name
- Locations
- Staff members
- Program configuration
- Campaign history
- Billing status

### Customer data

- First name
- Optional email
- Optional phone
- Wallet pass identifiers
- Visit/stamp/redemption history
- Marketing consent

### Sensitive secrets

- Supabase service role key
- Stripe secret key
- Stripe webhook secret
- Apple Wallet certificates/private keys
- Apple APNs credentials
- Google service account key
- Email provider API key

## 3. Tenant isolation

Every core table must include `business_id` unless it is a global/config table.

Use Supabase RLS policies so authenticated users can only access rows for businesses where they are active staff members.

Example logic:

```sql
exists (
  select 1 from staff_members sm
  where sm.business_id = target_table.business_id
    and sm.user_id = auth.uid()
    and sm.is_active = true
)
```

## 4. Role permissions

| Action | Owner | Admin | Manager | Staff |
|---|---:|---:|---:|---:|
| View dashboard | Yes | Yes | Yes | Limited |
| Create/edit program | Yes | Yes | Yes | No |
| Manage staff | Yes | Yes | No | No |
| Add stamp | Yes | Yes | Yes | Yes |
| Redeem reward | Yes | Yes | Yes | Yes |
| Send campaign | Yes | Yes | Yes | No |
| Export data | Yes | Yes | No | No |
| Billing | Yes | No/optional | No | No |

## 5. Staff abuse prevention

Required:

- Every stamp event records staff_member_id.
- Every reward redemption records staff_member_id.
- Every manual adjustment requires reason.
- Bonus stamp reasons are separate from normal stamps.
- Admin can view staff activity log.

Recommended:

- Rate-limit stamp actions.
- Alert if one staff member adds unusual volume.
- Allow owner to disable staff instantly.

## 6. Wallet pass security

### Apple Wallet

- Generate `.pkpass` server-side only.
- Store pass authentication token as hash if possible.
- Implement Apple pass update endpoints carefully.
- APNs credentials must be server-side only.
- Do not expose signing certificate/password.

### Google Wallet

- Use service account server-side only.
- Never expose service account private key.
- Use least privilege where possible.
- Validate object IDs belong to correct business/customer before patching.

## 7. QR/barcode security

Do not put raw customer IDs or predictable IDs in QR codes.

Use either:

- signed token
- opaque random token
- serial number plus server-side validation

The scanner API must verify:

- token exists
- pass is active
- staff belongs to same business
- staff can access selected location

## 8. Marketing consent

For MVP, collect explicit marketing consent if sending promotional messages beyond operational wallet updates.

Store:

- consent boolean
- consent timestamp if possible
- consent source: enrollment page, staff entry, import

Allow business to remove or anonymize customers later.

## 9. Google review policy

Do not build “leave a Google review and get a stamp.”

Allowed safer pattern:

- After redemption or positive interaction, send non-incentivized review request.
- Do not condition reward, discount, stamp, or prize on review completion.
- Do not ask only happy customers while suppressing unhappy customers.

## 10. Social share verification

Automatic verification for Instagram/TikTok is unreliable and API-limited.

MVP approach:

- Customer shows post/story to staff.
- Staff taps Bonus Stamp → Social Share.
- Audit log records staff and reason.

## 11. Rate limiting

Rate-limit:

- public enrollment endpoint
- staff scan endpoint
- stamp endpoint
- campaign send endpoint
- auth-related endpoints if custom

## 12. Backups and retention

- Use Supabase automatic backups.
- Export critical schema/migrations to Git.
- Do not store unnecessary customer PII.
- Provide customer/business deletion process later.

## 13. Production checklist

Before launch:

- [ ] RLS enabled on all tenant tables.
- [ ] Service role key is never used in client code.
- [ ] Stripe webhook signature is verified.
- [ ] Wallet secrets are only server-side.
- [ ] Staff actions are audited.
- [ ] Error tracking enabled.
- [ ] Database backups confirmed.
- [ ] Privacy Policy and Terms pages created.
- [ ] Google review incentive language removed.
