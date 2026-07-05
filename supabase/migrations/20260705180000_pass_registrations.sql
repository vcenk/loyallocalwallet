-- Migration: Apple pass web-service registrations (Phase 5 — wallet updates)
--
-- Apple devices register for pass updates; we push (APNs) when a pass changes,
-- and the device re-fetches the .pkpass. Unregister → the pass is voided.
--
-- Schema source of truth: docs/database-schema.md

-- Plaintext per-pass auth token embedded in the pass and checked by the web
-- service. Server-side use only.
alter table public.wallet_passes add column if not exists authentication_token text;

create table public.pass_registrations (
  id uuid primary key default gen_random_uuid(),
  wallet_pass_id uuid not null references public.wallet_passes(id) on delete cascade,
  device_library_identifier text not null,
  push_token text not null,
  created_at timestamptz not null default now(),
  unique (device_library_identifier, wallet_pass_id)
);

create index idx_pass_registrations_pass on public.pass_registrations(wallet_pass_id);
create index idx_pass_registrations_device on public.pass_registrations(device_library_identifier);

-- RLS enabled with no policies: only the service role (the Apple web-service
-- route handlers) ever touches this table.
alter table public.pass_registrations enable row level security;
