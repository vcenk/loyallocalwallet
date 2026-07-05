-- Migration: customers + wallet passes (Phase 3 — enrollment without wallet)
-- Public enrollment creates a customer and a placeholder wallet_pass carrying an
-- opaque serial_number (the token the staff scanner will read). The real pass
-- file is generated in Phase 5.
--
-- Schema source of truth: docs/database-schema.md
--
-- Security: enrollment is unauthenticated, so customer/pass INSERTs are done
-- server-side with the service role key (bypasses RLS). No public/anon policies
-- are added here — the tables stay locked to business members for reads.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.pass_platform as enum ('apple', 'google');
create type public.pass_status as enum ('created', 'installed', 'active', 'voided', 'deleted');

-- ---------------------------------------------------------------------------
-- customers
-- ---------------------------------------------------------------------------
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  first_name text,
  last_name text,
  email text,
  phone text,
  marketing_consent boolean not null default false,
  language text default 'en',
  birth_month integer,
  birth_day integer,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_customers_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

create index idx_customers_business on public.customers(business_id);
create index idx_customers_last_seen on public.customers(business_id, last_seen_at);

-- ---------------------------------------------------------------------------
-- wallet_passes
-- ---------------------------------------------------------------------------
create table public.wallet_passes (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  program_id uuid not null references public.loyalty_programs(id) on delete cascade,
  platform public.pass_platform not null,
  status public.pass_status not null default 'created',
  serial_number text unique not null,
  authentication_token_hash text,
  google_object_id text,
  current_stamps integer not null default 0,
  current_points numeric not null default 0,
  rewards_available integer not null default 0,
  installed_at timestamptz,
  uninstalled_at timestamptz,
  last_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_wallet_passes_updated_at
  before update on public.wallet_passes
  for each row execute function public.set_updated_at();

create index idx_wallet_passes_serial on public.wallet_passes(serial_number);
create index idx_wallet_passes_customer on public.wallet_passes(customer_id);

-- ---------------------------------------------------------------------------
-- RLS: business members read. Writes happen via the service role (enrollment)
-- or the staff API later; owner/admin/manager may edit customer records.
-- ---------------------------------------------------------------------------
alter table public.customers enable row level security;

create policy "customers_select_member" on public.customers
  for select to authenticated
  using (public.is_business_member(business_id));

create policy "customers_update_manager" on public.customers
  for update to authenticated
  using (public.has_business_role(business_id, array['business_owner', 'business_admin', 'manager']::public.user_role[]))
  with check (public.has_business_role(business_id, array['business_owner', 'business_admin', 'manager']::public.user_role[]));

alter table public.wallet_passes enable row level security;

create policy "wallet_passes_select_member" on public.wallet_passes
  for select to authenticated
  using (public.is_business_member(business_id));
