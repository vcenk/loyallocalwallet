-- Card + stamp visual style for the dashboard card preview/editor.

alter table public.card_designs
  add column if not exists card_style text default 'modern',
  add column if not exists stamp_style text default 'circles';
