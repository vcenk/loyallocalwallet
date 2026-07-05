-- Migration: subscription events (Phase 7 — billing)
--
-- Stripe webhook idempotency + audit. Plan state lives on businesses
-- (plan_key, stripe_customer_id, stripe_subscription_id, trial_ends_at); this
-- table records each processed Stripe event (unique stripe_event_id).
--
-- Schema source of truth: docs/database-schema.md

create table public.subscription_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  stripe_event_id text unique,
  event_type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create index idx_subscription_events_business on public.subscription_events(business_id, created_at desc);

-- RLS: owner/admin read (billing). Inserts happen via the service role in the
-- Stripe webhook handler.
alter table public.subscription_events enable row level security;

create policy "subscription_events_select_admin" on public.subscription_events
  for select to authenticated
  using (public.has_business_role(business_id, array['business_owner', 'business_admin']::public.user_role[]));
