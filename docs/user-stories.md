# User Stories — Local Loyalty Wallet

## 1. Business owner onboarding

### Story 1: Create account

As a business owner, I want to create an account so I can start a loyalty program.

Acceptance criteria:

- User can sign up with email/password or magic link.
- User is redirected to onboarding after signup.
- A profile row is created.
- Errors are clear and human-readable.

### Story 2: Create business profile

As a business owner, I want to enter my business details so my loyalty card uses my branding.

Acceptance criteria:

- User can enter business name, industry, phone, website, country, currency, and timezone.
- A business row is created.
- User is assigned business_owner role.
- User can upload a logo.

### Story 3: Add first location

As a business owner, I want to add my shop location so customers can see where to use the card.

Acceptance criteria:

- User can add address and phone.
- Location is linked to business.
- Location can be edited later.

## 2. Loyalty program creation

### Story 4: Create stamp card

As a business owner, I want to create a stamp card so customers can earn a reward after repeat visits.

Acceptance criteria:

- User can set card name.
- User can set number of stamps required.
- User can set reward title and description.
- User can save as draft or publish.

### Story 5: Customize card design

As a business owner, I want to customize the loyalty card so it matches my brand.

Acceptance criteria:

- User can choose background color.
- User can upload logo.
- User can choose stamp icon.
- User sees wallet preview.

### Story 6: Generate QR code

As a business owner, I want a QR code so customers can join in-store.

Acceptance criteria:

- User can view enrollment QR.
- User can download QR as PNG/SVG.
- QR opens public enrollment page.

## 3. Customer enrollment

### Story 7: Join loyalty program

As a customer, I want to scan a QR code and join quickly so I can earn rewards.

Acceptance criteria:

- Customer scans QR and sees business/program page.
- Customer can enter first name and optional email/phone.
- Customer can consent to marketing if required.
- Customer can choose Apple Wallet or Google Wallet.
- Customer receives/save wallet card.

### Story 8: Use wallet card

As a customer, I want to show my wallet card at checkout so staff can add stamps.

Acceptance criteria:

- Wallet card displays barcode/QR.
- Wallet card displays current progress.
- Wallet card updates after stamp.

## 4. Staff operations

### Story 9: Staff login

As staff, I want to log in to the scanner app so I can stamp customers.

Acceptance criteria:

- Staff can log in with invited account.
- Staff can select assigned location.
- Staff cannot access businesses they are not assigned to.

### Story 10: Scan customer card

As staff, I want to scan a customer card so I can see their progress.

Acceptance criteria:

- Camera scanner reads wallet barcode/QR.
- App shows customer name, card, progress, and reward status.
- Invalid scans show clear error.

### Story 11: Add stamp

As staff, I want to add a stamp quickly so checkout is not slowed down.

Acceptance criteria:

- Staff taps Add Stamp.
- Stamp event is saved.
- Customer progress updates.
- Wallet pass updates.
- Audit log is written.

### Story 12: Redeem reward

As staff, I want to redeem a customer reward so the loyalty program stays accurate.

Acceptance criteria:

- Redeem button is visible only when reward is available.
- Redemption is saved.
- Stamp balance adjusts based on rule.
- Wallet pass updates.
- Audit log is written.

### Story 13: Add bonus stamp

As staff, I want to add a bonus stamp for approved actions like referral or birthday.

Acceptance criteria:

- Staff can choose bonus reason.
- Bonus stamp is saved separately from normal earn event.
- Reason appears in customer timeline.

## 5. Customer management

### Story 14: View customers

As a business owner, I want to see all enrolled customers so I can understand loyalty activity.

Acceptance criteria:

- Customer table loads.
- User can search by name/email/phone.
- User can filter by inactive, close to reward, reward available.
- User can open customer detail.

### Story 15: View customer timeline

As a business owner, I want to see customer activity history so I understand behavior.

Acceptance criteria:

- Timeline shows enrollments, stamps, bonus stamps, redemptions, and campaigns.
- Timeline is sorted newest first.

### Story 15b: Pass uninstall handling

As a business owner, I want deleted wallet passes tracked so my customer counts stay accurate.

Acceptance criteria:

- When a customer removes a pass, its status becomes `voided`.
- Voided passes are excluded from campaign audiences.
- Voided passes are excluded from inactive-customer counts and shown separately as "removed card".
- Apple unregister endpoint triggers voiding automatically.

## 6. Campaigns and retention

Note: campaigns are wallet card updates, not free-form push notifications. Message title/body must be short enough to render as a pass field, and delivery depends on the customer's Wallet notification settings. UI copy should say "send a card update" and set this expectation.

### Story 16: See inactive customers

As a business owner, I want to see customers who have not visited recently so I can bring them back.

Acceptance criteria:

- Dashboard shows inactive customer count.
- User can view 14/21/30/60 day inactive groups.
- User can start a win-back campaign from this view.

### Story 17: Create manual campaign

As a business owner, I want to send a message to wallet customers so I can promote offers.

Acceptance criteria:

- User can choose audience.
- User can write title/body.
- User can preview message.
- User can send campaign.
- Campaign history records send.

### Story 18: Get suggested campaign

As a business owner, I want the system to suggest a campaign so I do not need to think like a marketer.

Acceptance criteria:

- System identifies a useful audience.
- System suggests title/body.
- System explains why.
- User can edit before sending.

## 7. Billing

### Story 19: Start trial

As a business owner, I want a free trial so I can test before paying.

Acceptance criteria:

- Business starts on trial plan.
- Trial end date is visible.
- Plan limits apply.

### Story 20: Subscribe

As a business owner, I want to subscribe so I can continue using the product.

Acceptance criteria:

- Stripe Checkout opens.
- Subscription status updates through webhook.
- Billing page shows active plan.

## 8. Admin and security

### Story 21: Staff permissions

As a business owner, I want to control staff permissions so only trusted people manage campaigns or billing.

Acceptance criteria:

- Owner/admin can invite staff.
- Roles restrict access.
- Staff cannot manage billing.

### Story 22: Audit log

As a business owner, I want stamp actions logged so I can detect mistakes or abuse.

Acceptance criteria:

- Every stamp, bonus, adjustment, and redemption records actor/time/location.
- Owner/admin can view activity log.
