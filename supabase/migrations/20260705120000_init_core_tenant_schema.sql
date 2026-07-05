-- Migration: init core tenant schema (Phase 1)
-- Creates the foundational auth/tenant tables: profiles, businesses, locations,
-- staff_members. Enables RLS with tenant-isolation policies driven by
-- staff_members membership.
--
-- Schema source of truth: docs/database-schema.md
-- Security model: docs/security.md (§3 tenant isolation, §4 role permissions)
--
-- Notes:
--   * Membership/role checks live in SECURITY DEFINER helper functions
--     (is_business_member / has_business_role). This is deliberate: an RLS
--     policy on staff_members that queried staff_members directly would recurse.
--     A SECURITY DEFINER function bypasses RLS internally and breaks the cycle.
--   * Only the `user_role` enum is created here — the other enums arrive with
--     the tables that use them in later migrations.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.user_role as enum (
  'platform_admin',
  'business_owner',
  'business_admin',
  'manager',
  'staff'
);

-- ---------------------------------------------------------------------------
-- Shared trigger: keep updated_at fresh
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- profiles: one row per authenticated user, keyed to auth.users.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- businesses: the tenant root.
create table public.businesses (
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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_businesses_updated_at
  before update on public.businesses
  for each row execute function public.set_updated_at();

-- locations: physical sites belonging to a business.
create table public.locations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
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
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_locations_updated_at
  before update on public.locations
  for each row execute function public.set_updated_at();

-- staff_members: links a user to a business with a role. This is the table RLS
-- reads to decide tenant access.
create table public.staff_members (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.user_role not null default 'staff',
  location_id uuid references public.locations(id) on delete set null,
  is_active boolean not null default true,
  invited_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, user_id)
);

create trigger set_staff_members_updated_at
  before update on public.staff_members
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index idx_staff_members_user on public.staff_members(user_id);
create index idx_staff_members_business on public.staff_members(business_id);
create index idx_locations_business on public.locations(business_id);

-- ---------------------------------------------------------------------------
-- Auth/onboarding triggers
-- ---------------------------------------------------------------------------

-- On signup, create the profile row (Story 1: "a profile row is created").
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- When a business is created by an authenticated user, make that user the owner.
-- Runs as SECURITY DEFINER so the initial staff_members row is written before
-- any RLS membership check exists for the new business (breaks the chicken/egg).
create or replace function public.handle_new_business()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null then
    insert into public.staff_members (business_id, user_id, role, is_active)
    values (new.id, auth.uid(), 'business_owner', true)
    on conflict (business_id, user_id) do nothing;
  end if;
  return new;
end;
$$;

create trigger on_business_created
  after insert on public.businesses
  for each row execute function public.handle_new_business();

-- ---------------------------------------------------------------------------
-- RLS helper functions (SECURITY DEFINER — see header note on recursion)
-- ---------------------------------------------------------------------------

-- True if the current user is an active staff member of the business.
create or replace function public.is_business_member(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.staff_members sm
    where sm.business_id = p_business_id
      and sm.user_id = auth.uid()
      and sm.is_active = true
  );
$$;

-- True if the current user is an active staff member with one of the given roles.
create or replace function public.has_business_role(
  p_business_id uuid,
  p_roles public.user_role[]
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.staff_members sm
    where sm.business_id = p_business_id
      and sm.user_id = auth.uid()
      and sm.is_active = true
      and sm.role = any(p_roles)
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

-- profiles: users manage only their own profile.
alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using (id = auth.uid());

create policy "profiles_insert_own" on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- businesses: members read; any authenticated user may create (they become
-- owner via handle_new_business); only owner/admin may edit.
alter table public.businesses enable row level security;

create policy "businesses_select_member" on public.businesses
  for select to authenticated
  using (public.is_business_member(id));

create policy "businesses_insert_authenticated" on public.businesses
  for insert to authenticated
  with check (auth.uid() is not null);

create policy "businesses_update_admin" on public.businesses
  for update to authenticated
  using (public.has_business_role(id, array['business_owner', 'business_admin']::public.user_role[]))
  with check (public.has_business_role(id, array['business_owner', 'business_admin']::public.user_role[]));

-- locations: members read; owner/admin write.
alter table public.locations enable row level security;

create policy "locations_select_member" on public.locations
  for select to authenticated
  using (public.is_business_member(business_id));

create policy "locations_insert_admin" on public.locations
  for insert to authenticated
  with check (public.has_business_role(business_id, array['business_owner', 'business_admin']::public.user_role[]));

create policy "locations_update_admin" on public.locations
  for update to authenticated
  using (public.has_business_role(business_id, array['business_owner', 'business_admin']::public.user_role[]))
  with check (public.has_business_role(business_id, array['business_owner', 'business_admin']::public.user_role[]));

create policy "locations_delete_admin" on public.locations
  for delete to authenticated
  using (public.has_business_role(business_id, array['business_owner', 'business_admin']::public.user_role[]));

-- staff_members: members read the roster; owner/admin manage it.
alter table public.staff_members enable row level security;

create policy "staff_members_select_member" on public.staff_members
  for select to authenticated
  using (public.is_business_member(business_id));

create policy "staff_members_insert_admin" on public.staff_members
  for insert to authenticated
  with check (public.has_business_role(business_id, array['business_owner', 'business_admin']::public.user_role[]));

create policy "staff_members_update_admin" on public.staff_members
  for update to authenticated
  using (public.has_business_role(business_id, array['business_owner', 'business_admin']::public.user_role[]))
  with check (public.has_business_role(business_id, array['business_owner', 'business_admin']::public.user_role[]));

create policy "staff_members_delete_admin" on public.staff_members
  for delete to authenticated
  using (public.has_business_role(business_id, array['business_owner', 'business_admin']::public.user_role[]));
