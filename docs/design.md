# Design Specification — Local Loyalty Wallet

## 1. Product personality

The product should feel:

- Simple
- Local
- Trustworthy
- Fast
- Friendly
- Practical
- Small-business focused

It should not feel like a heavy enterprise CRM.

## 2. Design principles

### No customer-app friction

Customers should enroll with a QR code and save the card to Apple Wallet or Google Wallet. Avoid screens that push customers to install a new app.

### Fast at the counter

Staff should scan, stamp, and redeem in under 5 seconds. The staff interface should use large buttons, clear status, and minimal typing.

### Business owner clarity

Use simple language: customers, stamps, rewards, visits, messages, inactive customers. Avoid jargon like lifecycle orchestration, cohort segmentation, and omni-channel activation in the dashboard.

### Action over analytics

Analytics should answer: Who came back? Who disappeared? Who is close to a reward? What campaign should I send?

### Mobile-first but desktop-comfortable

Business owners may use desktop during setup and phone during store operations. The dashboard must work well on desktop and tablet. The staff app is mobile-first.

## 3. Visual direction

### Style

Clean SaaS dashboard with warm local-business touches.

### Suggested palette

Use as default design tokens; final brand can change later.

```txt
Primary:     #2563EB  blue
Primary dark:#1E40AF
Accent:      #F59E0B  warm amber
Success:     #16A34A
Warning:     #F97316
Danger:      #DC2626
Ink:         #111827
Muted:       #6B7280
Border:      #E5E7EB
Background:  #F9FAFB
Card:        #FFFFFF
```

### Typography

- Dashboard: Inter, Geist, or system sans-serif
- Marketing site headings: Inter/Geist with strong weight
- Avoid playful fonts inside operational screens

### UI shape

- Rounded cards: 12–16px
- Buttons: 10–12px radius
- Dashboard panels: soft borders, subtle shadows
- Staff app buttons: large, high-contrast, thumb-friendly

## 4. Dashboard information architecture

```txt
Dashboard
  Overview
  Customers
  Loyalty Cards
  Campaigns
  Staff
  Locations
  Analytics
  Settings
  Billing
```

### Overview page

Cards:

- Total customers
- New customers this week
- Stamps issued this week
- Rewards redeemed this week
- Inactive customers
- Customers close to reward

Primary action:

- Create campaign
- View inactive customers

### Loyalty Cards page

- Card list
- Create card
- Edit design
- Reward rules
- Enrollment QR code
- Preview Apple/Google card

### Customers page

Table columns:

- Customer
- Wallet status
- Stamps/points
- Last visit
- Reward status
- Risk
- Actions

Customer detail page:

- Profile
- Timeline
- Stamp history
- Redemption history
- Campaign history
- Notes

### Campaigns page

- Manual campaign composer
- Suggested win-back campaign
- Birthday campaign
- Reward reminder
- Campaign history

### Staff page

- Invite staff
- Role assignment
- Staff activity log

## 5. Staff app UX

### Main screens

```txt
Login
Select Business/Location
Scanner
Customer Result
Stamp Added Confirmation
Redeem Reward
Bonus Stamp Reason
Activity History
```

### Scanner result states

- Customer found
- Card inactive
- Reward available
- Customer not found
- QR expired/invalid
- Network issue

### Customer result screen

Show:

- Customer name or anonymous label
- Card name
- Progress, e.g. 7/10 stamps
- Reward status
- Last visit

Actions:

- Add stamp
- Redeem reward
- Bonus stamp
- View history

### Bonus stamp reasons

- Referral
- Social share shown to staff
- Birthday
- Manager bonus
- Apology/service recovery
- Special event
- Manual adjustment

## 6. Customer enrollment UX

Flow:

1. Customer scans QR code.
2. Landing page opens.
3. Customer enters first name and optional email/phone.
4. Customer accepts terms and marketing consent if applicable.
5. Customer taps “Add to Apple Wallet” or “Save to Google Wallet.”
6. Customer sees confirmation screen.

Keep enrollment under 45 seconds.

## 7. Wallet pass design

### Apple/Google Wallet fields

- Business logo
- Card title
- Customer first name or member ID
- Stamp/points progress
- Reward text
- QR/barcode for staff scan
- Location/address
- Terms link

### Pass copy examples

- “7 of 10 stamps earned”
- “3 more visits until your free coffee”
- “Reward available: Free drink”
- “Show this card at checkout”

## 8. Empty states

Examples:

- No customers yet: “Print your QR code and place it at the counter to start enrolling customers.”
- No campaigns yet: “Send your first message to customers who have not visited recently.”
- No staff yet: “Invite staff so they can scan and stamp customer cards.”

## 9. Accessibility

- Minimum 4.5:1 text contrast
- Buttons at least 44px tall
- Clear focus states
- No color-only status labels
- Screen-reader labels for icons
- Large tap targets in staff app

## 10. Design system components

Start with:

- Button
- Input
- Select
- Textarea
- Card
- Badge
- Dialog
- Toast
- Table
- EmptyState
- StatCard
- ProgressBar
- QRCodeDisplay
- WalletPreview
- CampaignComposer
- CustomerTimeline
- ScannerResult
