-- Optional birth month/day for the birthday automation (no year — privacy).

alter table public.customers
  add column if not exists birth_month int,
  add column if not exists birth_day int;
