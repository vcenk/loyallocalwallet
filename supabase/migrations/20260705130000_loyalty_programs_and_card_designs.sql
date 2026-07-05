-- Migration: loyalty programs + card designs (Phase 2)
-- Adds the stamp-card program model and its visual design, with tenant RLS.
--
-- Schema source of truth: docs/database-schema.md
--
-- Deviation from docs (intentional): card_designs gains a `business_id` column.
-- The docs keyed it only by program_id, but the security rule (CLAUDE.md /
-- docs/security.md) requires every tenant table to carry business_id so RLS can
-- isolate it directly instead of joining through loyalty_programs. Docs updated
-- to match.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.program_type as enum ('stamps', 'points', 'visits');
create type public.program_status as enum ('draft', 'active', 'paused', 'archived');

-- ---------------------------------------------------------------------------
-- loyalty_programs
-- ---------------------------------------------------------------------------
create table public.loyalty_programs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  description text,
  program_type public.program_type not null default 'stamps',
  status public.program_status not null default 'draft',
  stamps_required integer default 10,
  points_per_dollar numeric default 1,
  reward_title text not null,
  reward_description text,
  terms text,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_loyalty_programs_updated_at
  before update on public.loyalty_programs
  for each row execute function public.set_updated_at();

create index idx_loyalty_programs_business on public.loyalty_programs(business_id);

-- ---------------------------------------------------------------------------
-- card_designs (one per program)
-- ---------------------------------------------------------------------------
create table public.card_designs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  program_id uuid not null unique references public.loyalty_programs(id) on delete cascade,
  logo_url text,
  icon_url text,
  background_color text default '#2563EB',
  foreground_color text default '#FFFFFF',
  label_color text default '#E5E7EB',
  stamp_icon text default 'star',
  apple_pass_type_identifier text,
  google_class_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_card_designs_updated_at
  before update on public.card_designs
  for each row execute function public.set_updated_at();

create index idx_card_designs_program on public.card_designs(program_id);

-- ---------------------------------------------------------------------------
-- RLS: members read; owner/admin/manager write (create/edit program).
-- ---------------------------------------------------------------------------
alter table public.loyalty_programs enable row level security;

create policy "loyalty_programs_select_member" on public.loyalty_programs
  for select to authenticated
  using (public.is_business_member(business_id));

create policy "loyalty_programs_insert_manager" on public.loyalty_programs
  for insert to authenticated
  with check (public.has_business_role(business_id, array['business_owner', 'business_admin', 'manager']::public.user_role[]));

create policy "loyalty_programs_update_manager" on public.loyalty_programs
  for update to authenticated
  using (public.has_business_role(business_id, array['business_owner', 'business_admin', 'manager']::public.user_role[]))
  with check (public.has_business_role(business_id, array['business_owner', 'business_admin', 'manager']::public.user_role[]));

create policy "loyalty_programs_delete_manager" on public.loyalty_programs
  for delete to authenticated
  using (public.has_business_role(business_id, array['business_owner', 'business_admin', 'manager']::public.user_role[]));

alter table public.card_designs enable row level security;

create policy "card_designs_select_member" on public.card_designs
  for select to authenticated
  using (public.is_business_member(business_id));

create policy "card_designs_insert_manager" on public.card_designs
  for insert to authenticated
  with check (public.has_business_role(business_id, array['business_owner', 'business_admin', 'manager']::public.user_role[]));

create policy "card_designs_update_manager" on public.card_designs
  for update to authenticated
  using (public.has_business_role(business_id, array['business_owner', 'business_admin', 'manager']::public.user_role[]))
  with check (public.has_business_role(business_id, array['business_owner', 'business_admin', 'manager']::public.user_role[]));

create policy "card_designs_delete_manager" on public.card_designs
  for delete to authenticated
  using (public.has_business_role(business_id, array['business_owner', 'business_admin', 'manager']::public.user_role[]));
