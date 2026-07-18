-- Module 12B: WhatsApp welcome message activation.
-- Internal/server-side send audit fields only. Do not grant public or client
-- access to customer or assessment data.

alter table public.customers
  add column if not exists whatsapp_welcome_sent_at timestamptz,
  add column if not exists whatsapp_welcome_status text,
  add column if not exists whatsapp_welcome_error text,
  add column if not exists whatsapp_opt_in_source text;

comment on column public.customers.whatsapp_welcome_sent_at is
  'Timestamp for the first consent-based WhatsApp welcome template sent to this customer. Used to prevent repeat welcome spam.';

comment on column public.customers.whatsapp_welcome_status is
  'Last server-side welcome template outcome: sent, skipped, or failed.';

comment on column public.customers.whatsapp_welcome_error is
  'Minimal non-secret server error summary for the last welcome template failure or skip.';

comment on column public.customers.whatsapp_opt_in_source is
  'Internal source marker for the consent/status event used for WhatsApp welcome sending.';
