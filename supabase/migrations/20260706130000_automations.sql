-- Rule-based marketing automations (welcome / almost-there / win-back) with a
-- per-customer send ledger so the daily cron never double-sends.

create table if not exists public.automations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  key text not null, -- welcome | almost_there | win_back
  enabled boolean not null default false,
  title text not null default '',
  body text not null default '',
  threshold_days int not null default 21,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, key)
);

create trigger set_automations_updated_at
  before update on public.automations
  for each row execute function public.set_updated_at();

alter table public.automations enable row level security;

create policy "automations_select_member" on public.automations
  for select to authenticated
  using (public.is_business_member(business_id));

create policy "automations_write_admin" on public.automations
  for all to authenticated
  using (public.has_business_role(business_id, array['business_owner', 'business_admin']::public.user_role[]))
  with check (public.has_business_role(business_id, array['business_owner', 'business_admin']::public.user_role[]));

-- Dedup ledger. Written only by the service role (RLS on, no policy = deny).
create table if not exists public.automation_sends (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  automation_key text not null,
  sent_at timestamptz not null default now()
);

create index if not exists idx_automation_sends_lookup
  on public.automation_sends(business_id, customer_id, automation_key, sent_at desc);

alter table public.automation_sends enable row level security;
