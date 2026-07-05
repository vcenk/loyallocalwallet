-- Migration: stamp events, redemptions, audit logs (Phase 4 — stamp engine)
--
-- Progress is derived by summing stamp_events.quantity (see calculateProgress in
-- @llw/config). wallet_passes.current_stamps / rewards_available are a cache the
-- stamp/redeem actions keep in sync. A redemption inserts a negative adjustment
-- event so the ledger stays the single source of truth.
--
-- Schema source of truth: docs/database-schema.md
--
-- Writes to these tables happen server-side (validated server actions using the
-- service role). RLS here governs READS: members read; audit is owner/admin only.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.stamp_event_type as enum ('earn', 'bonus', 'adjustment', 'remove');
create type public.reward_status as enum ('available', 'redeemed', 'expired', 'cancelled');

-- ---------------------------------------------------------------------------
-- stamp_events (the ledger)
-- ---------------------------------------------------------------------------
create table public.stamp_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  location_id uuid references public.locations(id) on delete set null,
  customer_id uuid not null references public.customers(id) on delete cascade,
  program_id uuid not null references public.loyalty_programs(id) on delete cascade,
  wallet_pass_id uuid references public.wallet_passes(id) on delete set null,
  staff_member_id uuid references public.staff_members(id) on delete set null,
  event_type public.stamp_event_type not null default 'earn',
  quantity integer not null default 1,
  purchase_amount numeric,
  reason text,
  notes text,
  created_at timestamptz not null default now()
);

create index idx_stamp_events_customer on public.stamp_events(customer_id, created_at desc);
create index idx_stamp_events_business on public.stamp_events(business_id, created_at desc);
create index idx_stamp_events_pass on public.stamp_events(wallet_pass_id);

-- ---------------------------------------------------------------------------
-- reward_redemptions
-- ---------------------------------------------------------------------------
create table public.reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  location_id uuid references public.locations(id) on delete set null,
  customer_id uuid not null references public.customers(id) on delete cascade,
  program_id uuid not null references public.loyalty_programs(id) on delete cascade,
  wallet_pass_id uuid references public.wallet_passes(id) on delete set null,
  staff_member_id uuid references public.staff_members(id) on delete set null,
  reward_title text not null,
  status public.reward_status not null default 'redeemed',
  redeemed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index idx_redemptions_business on public.reward_redemptions(business_id, redeemed_at desc);
create index idx_redemptions_customer on public.reward_redemptions(customer_id, redeemed_at desc);

-- ---------------------------------------------------------------------------
-- audit_logs
-- ---------------------------------------------------------------------------
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_staff_member_id uuid references public.staff_members(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index idx_audit_logs_business on public.audit_logs(business_id, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS (reads only; writes via service role in server actions)
-- ---------------------------------------------------------------------------
alter table public.stamp_events enable row level security;
create policy "stamp_events_select_member" on public.stamp_events
  for select to authenticated
  using (public.is_business_member(business_id));

alter table public.reward_redemptions enable row level security;
create policy "reward_redemptions_select_member" on public.reward_redemptions
  for select to authenticated
  using (public.is_business_member(business_id));

alter table public.audit_logs enable row level security;
create policy "audit_logs_select_admin" on public.audit_logs
  for select to authenticated
  using (public.has_business_role(business_id, array['business_owner', 'business_admin']::public.user_role[]));
