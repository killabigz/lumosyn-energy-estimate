-- Module 15: Lumosyn HQ V1 lead assessment view.
-- Internal/server-side HQ usage only. Do not grant public or client read access.

create or replace view public.lead_assessments
with (security_invoker = on)
as
select
  a.id as assessment_id,
  a.created_at as assessment_created_at,
  c.id as customer_id,
  c.name as customer_name,
  c.whatsapp as customer_whatsapp,
  c.community_status,
  a.goal,
  a.appliances,
  a.runtime,
  a.budget,
  a.timeline,
  a.journey_stage,
  a.recommendation_title,
  a.inverter_label,
  a.battery_label,
  a.solar_panel_label,
  a.utm_source,
  a.utm_medium,
  a.utm_campaign,
  a.source,
  a.is_latest
from public.assessments as a
join public.customers as c
  on c.id = a.customer_id;

comment on view public.lead_assessments is
  'Internal/server-side Lumosyn HQ usage only. Do not grant public or client read access.';

revoke all on public.lead_assessments from anon;
revoke all on public.lead_assessments from authenticated;
