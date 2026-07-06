-- Google review link on the business, and a "current message" on each wallet
-- pass so Apple's regenerated pass can carry a campaign / review nudge.

alter table public.businesses
  add column if not exists google_review_url text;

alter table public.wallet_passes
  add column if not exists message_body text,
  add column if not exists message_link text,
  add column if not exists message_updated_at timestamptz;
