# Database Schema — Local Loyalty Wallet

Database: Supabase Postgres.

Use UUID primary keys unless noted. Add `created_at timestamptz default now()` and `updated_at timestamptz default now()` to most tables.

## 1. Enums

```sql
create type user_role as enum ('platform_admin', 'business_owner', 'business_admin', 'manager', 'staff');
create type program_type as enum ('stamps', 'points', 'visits');
create type program_status as enum ('draft', 'active', 'paused', 'archived');
create type pass_platform as enum ('apple', 'google');
create type pass_status as enum ('created', 'installed', 'active', 'voided', 'deleted');
create type stamp_event_type as enum ('earn', 'bonus', 'adjustment', 'remove');
create type campaign_status as enum ('draft', 'scheduled', 'sent', 'cancelled', 'failed');
create type reward_status as enum ('available', 'redeemed', 'expired', 'cancelled');
```

## 2. Core tables

### profiles

Stores authenticated user profile.

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### businesses

```sql
create table businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  industry text,
  website text,
  phone text,
  email text,
  logo_url text,
  brand_color text default '#2563EB',
  timezone text default 'America/Vancouver',
  country text default 'CA',
  currency text default 'CAD',
  plan_key text default 'trial',
  trial_ends_at timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### locations

```sql
create table locations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  address_line1 text,
  address_line2 text,
  city text,
  province text,
  postal_code text,
  country text default 'CA',
  latitude numeric,
  longitude numeric,
  phone text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### staff_members

```sql
create table staff_members (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role user_role not null default 'staff',
  location_id uuid references locations(id) on delete set null,
  is_active boolean default true,
  invited_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (business_id, user_id)
);
```

## 3. Loyalty program tables

### loyalty_programs

```sql
create table loyalty_programs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  description text,
  program_type program_type not null default 'stamps',
  status program_status not null default 'draft',
  stamps_required integer default 10,
  points_per_dollar numeric default 1,
  reward_title text not null,
  reward_description text,
  terms text,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### card_designs

```sql
create table card_designs (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references loyalty_programs(id) on delete cascade,
  logo_url text,
  icon_url text,
  background_color text default '#2563EB',
  foreground_color text default '#FFFFFF',
  label_color text default '#E5E7EB',
  stamp_icon text default 'star',
  apple_pass_type_identifier text,
  google_class_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### customers

```sql
create table customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  first_name text,
  last_name text,
  email text,
  phone text,
  marketing_consent boolean default false,
  language text default 'en',
  birth_month integer,
  birth_day integer,
  first_seen_at timestamptz default now(),
  last_seen_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### wallet_passes

```sql
create table wallet_passes (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  program_id uuid not null references loyalty_programs(id) on delete cascade,
  platform pass_platform not null,
  status pass_status not null default 'created',
  serial_number text unique not null,
  authentication_token_hash text,
  google_object_id text,
  current_stamps integer default 0,
  current_points numeric default 0,
  rewards_available integer default 0,
  installed_at timestamptz,
  uninstalled_at timestamptz,
  last_updated_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### stamp_events

```sql
create table stamp_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  location_id uuid references locations(id) on delete set null,
  customer_id uuid not null references customers(id) on delete cascade,
  program_id uuid not null references loyalty_programs(id) on delete cascade,
  wallet_pass_id uuid references wallet_passes(id) on delete set null,
  staff_member_id uuid references staff_members(id) on delete set null,
  event_type stamp_event_type not null default 'earn',
  quantity integer not null default 1,
  purchase_amount numeric,
  reason text,
  notes text,
  created_at timestamptz default now()
);
```

### reward_redemptions

```sql
create table reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  location_id uuid references locations(id) on delete set null,
  customer_id uuid not null references customers(id) on delete cascade,
  program_id uuid not null references loyalty_programs(id) on delete cascade,
  wallet_pass_id uuid references wallet_passes(id) on delete set null,
  staff_member_id uuid references staff_members(id) on delete set null,
  reward_title text not null,
  status reward_status not null default 'redeemed',
  redeemed_at timestamptz default now(),
  created_at timestamptz default now()
);
```

## 4. Campaign tables

### campaigns

```sql
create table campaigns (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  program_id uuid references loyalty_programs(id) on delete set null,
  created_by uuid references auth.users(id),
  name text not null,
  audience_key text,
  message_title text not null,
  message_body text not null,
  status campaign_status not null default 'draft',
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### campaign_recipients

```sql
create table campaign_recipients (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  wallet_pass_id uuid references wallet_passes(id) on delete set null,
  status text default 'pending',
  sent_at timestamptz,
  error_message text,
  created_at timestamptz default now(),
  unique (campaign_id, customer_id)
);
```

## 5. Referral and bonus tables

### referrals

```sql
create table referrals (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  program_id uuid references loyalty_programs(id) on delete cascade,
  referrer_customer_id uuid not null references customers(id) on delete cascade,
  referred_customer_id uuid references customers(id) on delete set null,
  referral_code text not null,
  status text default 'pending',
  completed_at timestamptz,
  created_at timestamptz default now()
);
```

### bonus_stamp_rules

```sql
create table bonus_stamp_rules (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  program_id uuid not null references loyalty_programs(id) on delete cascade,
  name text not null,
  reason_key text not null,
  quantity integer default 1,
  requires_staff_approval boolean default true,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

## 6. Audit and billing tables

### audit_logs

```sql
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_staff_member_id uuid references staff_members(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb default '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz default now()
);
```

### subscription_events

```sql
create table subscription_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  stripe_event_id text unique,
  event_type text not null,
  payload jsonb not null,
  created_at timestamptz default now()
);
```

## 7. Helpful views

### customer_summary

Create a view or materialized view later for dashboard speed.

Fields:

- customer_id
- business_id
- total_stamps
- total_redemptions
- last_visit_at
- days_since_last_visit
- active_program_count
- current_progress
- rewards_available
- risk_level

## 8. RLS policy guidance

Enable RLS on all tenant-owned tables.

Basic policy idea:

```sql
-- user can read rows for businesses where they are active staff/admin
exists (
  select 1 from staff_members sm
  where sm.business_id = table.business_id
    and sm.user_id = auth.uid()
    and sm.is_active = true
)
```

Role-specific writes:

- owner/admin: full business management
- manager: program, staff activity, campaigns, customers
- staff: scan, stamp, redeem only

## 9. Indexes

Add these early:

```sql
create index idx_staff_members_user on staff_members(user_id);
create index idx_staff_members_business on staff_members(business_id);
create index idx_customers_business on customers(business_id);
create index idx_customers_last_seen on customers(business_id, last_seen_at);
create index idx_wallet_passes_serial on wallet_passes(serial_number);
create index idx_wallet_passes_customer on wallet_passes(customer_id);
create index idx_stamp_events_customer on stamp_events(customer_id, created_at desc);
create index idx_stamp_events_business on stamp_events(business_id, created_at desc);
create index idx_redemptions_business on reward_redemptions(business_id, redeemed_at desc);
```

## 10. Implemented migrations

Migrations live in `supabase/migrations/`. This section tracks what has actually
been applied (the tables above remain the full target schema).

### 20260705120000_init_core_tenant_schema

Creates the foundational tenant/auth layer.

- **Enum:** `user_role`. (Remaining enums are created alongside the tables that
  use them in later migrations.)
- **Tables:** `profiles`, `businesses`, `locations`, `staff_members` — with
  `not null` on `created_at`/`updated_at` and `is_active`.
- **Indexes:** `idx_staff_members_user`, `idx_staff_members_business`,
  `idx_locations_business`.
- **Triggers / functions:**
  - `set_updated_at()` — `before update` on all four tables, refreshes `updated_at`.
  - `handle_new_user()` — `after insert on auth.users`; creates the `profiles`
    row (fulfils "a profile row is created" on signup).
  - `handle_new_business()` — `after insert on businesses`; inserts the creating
    user as `business_owner` in `staff_members` (fulfils "user becomes
    business_owner"). `SECURITY DEFINER` so it runs before any RLS membership
    check exists for the new business.
  - `is_business_member(uuid)` / `has_business_role(uuid, user_role[])` —
    `SECURITY DEFINER` helpers used by policies. They are `SECURITY DEFINER` on
    purpose: a policy on `staff_members` that queried `staff_members` directly
    would recurse; the definer function bypasses RLS internally and breaks the
    cycle.
- **RLS:** enabled on all four tables. `profiles` = own row only. `businesses` /
  `locations` / `staff_members` = members read (`is_business_member`), owner/admin
  write (`has_business_role`). `businesses` insert is allowed for any
  authenticated user (they become owner via the trigger above).

### 20260705130000_loyalty_programs_and_card_designs

Adds the stamp-card program model (Phase 2).

- **Enums:** `program_type`, `program_status`.
- **Tables:** `loyalty_programs`, `card_designs`.
- **Deviation from §3 (intentional):** `card_designs` gains a `business_id`
  column (not in the original spec above). The security rule requires every
  tenant table to carry `business_id` so RLS isolates it directly rather than
  joining through `loyalty_programs`. `card_designs.program_id` is also `unique`
  (one design per program).
- **Indexes:** `idx_loyalty_programs_business`, `idx_card_designs_program`.
- **Triggers:** `set_updated_at` on both tables.
- **RLS:** members read (`is_business_member`); **owner/admin/manager** write
  (`has_business_role`) — matches "Create/edit program" in docs/security.md §4.

### 20260705140000_customers_and_wallet_passes

Adds enrollment (Phase 3 — enrollment without wallet).

- **Enums:** `pass_platform`, `pass_status`.
- **Tables:** `customers`, `wallet_passes` (placeholder pass carrying an opaque
  `serial_number` — the scanner token; real pass file is Phase 5).
- **Indexes:** `idx_customers_business`, `idx_customers_last_seen`,
  `idx_wallet_passes_serial`, `idx_wallet_passes_customer`.
- **Triggers:** `set_updated_at` on both.
- **RLS:** members read both tables; owner/admin/manager may update `customers`.
  There are **no anon/public policies** — public enrollment INSERTs run
  server-side with the **service role key** (`lib/supabase/admin.ts`), which
  bypasses RLS. This keeps the tables locked to members for all reads.

### 20260705150000_stamp_events_redemptions_audit

The stamp engine (Phase 4).

- **Enums:** `stamp_event_type`, `reward_status`.
- **Tables:** `stamp_events` (the ledger), `reward_redemptions`, `audit_logs`.
- **Indexes:** customer/business/pass on events; business/customer on
  redemptions; business on audit.
- **Progress model:** progress is the sum of `stamp_events.quantity`
  (`calculateProgress()` in `@llw/config`, the single shared function per the
  CLAUDE.md rule). `wallet_passes.current_stamps` / `rewards_available` are a
  cache the stamp/redeem actions keep in sync. **Redemption inserts a negative
  `adjustment` event** (`-stamps_required`) so the ledger stays the source of
  truth and the remainder carries over.
- **RLS:** members read `stamp_events` / `reward_redemptions`; `audit_logs` is
  **owner/admin read only**. All writes happen in validated server actions using
  the service role (they check the pass belongs to the actor's business first).

### 20260705160000_campaigns

Retention campaigns (Phase 6).

- **Enum:** `campaign_status`.
- **Tables:** `campaigns`, `campaign_recipients`.
- **Deviation (intentional):** `campaign_recipients` gains `business_id` for
  direct RLS isolation (same pattern as `card_designs`).
- **Model:** creating a campaign resolves an audience (`inactive_21_days`,
  `close_to_reward`, `all_active`) into recipient rows. `message_title` ≤ 40 /
  `message_body` ≤ 140 (renders as a wallet pass field). Status stays `draft` —
  **delivery is wired with wallet integration (Phase 5)**.
- **RLS:** members read; owner/admin/manager manage campaigns. Recipient rows are
  written server-side (service role) at creation time.

### 20260705170000_subscription_events

Stripe billing (Phase 7).

- **Table:** `subscription_events` — Stripe webhook idempotency + audit
  (`stripe_event_id` unique; the handler acks and skips duplicates).
- Plan state itself lives on `businesses` (`plan_key`, `stripe_customer_id`,
  `stripe_subscription_id`, `trial_ends_at`), synced by the webhook.
- **RLS:** owner/admin read. Inserts happen via the service role in the webhook.
- **Enforcement:** `PLAN_LIMITS` (`@llw/config`) is enforced server-side — e.g.
  creating a loyalty card checks the plan's `programs` limit.

### 20260705180000_pass_registrations

Apple pass web-service (Phase 5 — live wallet updates).

- Adds `wallet_passes.authentication_token` (plaintext per-pass token embedded in
  the pass and checked by the web service).
- **Table:** `pass_registrations` (device ↔ pass ↔ push token). RLS enabled with
  **no policies** — only the service-role web-service routes touch it.
- **Flow:** device registers → we APNs-push on every stamp/redeem → device
  re-fetches the `.pkpass`. **Unregister → the pass is voided** (`status='voided'`,
  `uninstalled_at` set), excluding it from audiences/inactive counts.
