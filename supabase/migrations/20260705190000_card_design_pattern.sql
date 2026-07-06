-- Migration: card background pattern (dashboard card designer)
-- A visual texture selectable in the card builder (dashboard preview).

alter table public.card_designs add column if not exists pattern text default 'none';
