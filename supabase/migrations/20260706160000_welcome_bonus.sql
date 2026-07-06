-- Optional welcome bonus: stamps auto-granted the moment a customer enrolls.

alter table public.businesses
  add column if not exists welcome_bonus_stamps int not null default 0;
