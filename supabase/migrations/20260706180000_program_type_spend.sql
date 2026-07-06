-- Money/spend reward model. The stamp engine already sums quantity ÷ required,
-- so 'spend' works by storing dollars as the event quantity.

alter type public.program_type add value if not exists 'spend';
