-- Migration: campaigns + recipients (Phase 6 — retention)
--
-- A campaign is a wallet-card update: a short title/body sent to an audience.
-- Sending is wired with wallet integration (Phase 5); for now campaigns are
-- created as drafts with their resolved recipient list.
--
-- Schema source of truth: docs/database-schema.md
--
-- Deviation from docs (intentional): campaign_recipients gains `business_id` so
-- RLS isolates it directly instead of joining through campaigns (security rule).

create type public.campaign_status as enum ('draft', 'scheduled', 'sent', 'cancelled', 'failed');

-- ---------------------------------------------------------------------------
-- campaigns
-- ---------------------------------------------------------------------------
create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  program_id uuid references public.loyalty_programs(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  name text not null,
  audience_key text,
  message_title text not null,
  message_body text not null,
  status public.campaign_status not null default 'draft',
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_campaigns_updated_at
  before update on public.campaigns
  for each row execute function public.set_updated_at();

create index idx_campaigns_business on public.campaigns(business_id, created_at desc);

-- ---------------------------------------------------------------------------
-- campaign_recipients
-- ---------------------------------------------------------------------------
create table public.campaign_recipients (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  wallet_pass_id uuid references public.wallet_passes(id) on delete set null,
  status text not null default 'pending',
  sent_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  unique (campaign_id, customer_id)
);

create index idx_campaign_recipients_campaign on public.campaign_recipients(campaign_id);

-- ---------------------------------------------------------------------------
-- RLS: members read; owner/admin/manager manage campaigns. Recipient rows are
-- written server-side (service role) when a campaign is created.
-- ---------------------------------------------------------------------------
alter table public.campaigns enable row level security;

create policy "campaigns_select_member" on public.campaigns
  for select to authenticated
  using (public.is_business_member(business_id));

create policy "campaigns_insert_manager" on public.campaigns
  for insert to authenticated
  with check (public.has_business_role(business_id, array['business_owner', 'business_admin', 'manager']::public.user_role[]));

create policy "campaigns_update_manager" on public.campaigns
  for update to authenticated
  using (public.has_business_role(business_id, array['business_owner', 'business_admin', 'manager']::public.user_role[]))
  with check (public.has_business_role(business_id, array['business_owner', 'business_admin', 'manager']::public.user_role[]));

alter table public.campaign_recipients enable row level security;

create policy "campaign_recipients_select_member" on public.campaign_recipients
  for select to authenticated
  using (public.is_business_member(business_id));
