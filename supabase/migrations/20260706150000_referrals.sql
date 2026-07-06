-- Refer-a-friend: a shareable code per customer + a referral ledger. Each
-- referred customer is credited once (unique). Bonus stamps go to both sides.

alter table public.customers
  add column if not exists referral_code text;

create unique index if not exists idx_customers_referral_code
  on public.customers(referral_code)
  where referral_code is not null;

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  program_id uuid references public.loyalty_programs(id) on delete set null,
  referrer_customer_id uuid not null references public.customers(id) on delete cascade,
  referred_customer_id uuid not null references public.customers(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (referred_customer_id)
);

create index if not exists idx_referrals_referrer
  on public.referrals(referrer_customer_id);

alter table public.referrals enable row level security;

create policy "referrals_select_member" on public.referrals
  for select to authenticated
  using (public.is_business_member(business_id));
