alter table public.customers
  add column if not exists whatsapp_welcome_sent_at timestamptz,
  add column if not exists whatsapp_last_reply_at timestamptz,
  add column if not exists whatsapp_last_reply text,
  add column if not exists whatsapp_opt_in_source text;
