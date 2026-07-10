-- Module 21: Customer identity and safe lead cleanup.
-- Internal/server-side HQ usage only. Do not grant public or client read access.
-- Phone number is stronger than name. Existing duplicates are not auto-merged.

alter table public.customers
add column if not exists phone_normalized text;

update public.customers
set phone_normalized = nullif(regexp_replace(coalesce(whatsapp, ''), '\D', '', 'g'), '')
where phone_normalized is null;

comment on column public.customers.phone_normalized is
  'Derived digits-only phone/WhatsApp value used for internal customer identity matching. Do not expose publicly.';

create index if not exists customers_phone_normalized_idx
on public.customers (phone_normalized)
where phone_normalized is not null;

alter table public.assessments
add column if not exists is_archived boolean;

update public.assessments
set is_archived = false
where is_archived is null;

alter table public.assessments
alter column is_archived set default false,
alter column is_archived set not null;

alter table public.assessments
add column if not exists archived_at timestamptz;

alter table public.assessments
add column if not exists archived_reason text;

comment on column public.assessments.is_archived is
  'Internal HQ flag for hiding an assessment from normal lead lists without deleting customer or assessment data.';

comment on column public.assessments.archived_at is
  'Timestamp when an HQ user archived this assessment. Null means active or restored.';

comment on column public.assessments.archived_reason is
  'Optional internal reason for archiving an assessment. HQ-only operational note.';

-- Recreate the internal/server-side HQ reporting view so the new identity and
-- archive fields are available only through protected HQ server reads.
drop view if exists public.lead_assessments;

create or replace view public.lead_assessments
with (security_invoker = on)
as
select
  a.id as assessment_id,
  a.created_at as assessment_created_at,
  c.id as customer_id,
  c.name as customer_name,
  c.whatsapp as customer_whatsapp,
  c.phone_normalized,
  count(a.id) over (partition by c.id)::integer as assessment_count_for_customer,
  c.community_status,
  a.goal,
  a.appliances,
  a.appliance_quantities,
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
  a.is_latest,
  a.lead_status,
  a.lead_priority,
  a.internal_note,
  a.last_contacted_at,
  a.follow_up_at,
  a.lead_updated_at,
  a.is_archived,
  a.archived_at,
  a.archived_reason
from public.assessments as a
join public.customers as c
  on c.id = a.customer_id;

comment on view public.lead_assessments is
  'Internal/server-side Lumosyn HQ usage only. Do not grant public or client read access.';

revoke all on public.lead_assessments from anon;
revoke all on public.lead_assessments from authenticated;

-- Manual duplicate diagnostics for Daniel.
-- Existing duplicate customer rows may remain until manually reviewed. Future
-- submissions should reuse an existing customer once phone_normalized is
-- present. A manual merge workflow can be added in a later module.

-- Summary of duplicate normalized phones:
-- select phone_normalized, count(*)
-- from public.customers
-- where phone_normalized is not null
-- group by phone_normalized
-- having count(*) > 1;

-- Duplicate customer review detail:
-- select
--   phone_normalized,
--   id as customer_id,
--   name,
--   whatsapp,
--   email,
--   created_at,
--   updated_at
-- from public.customers
-- where phone_normalized in (
--   select phone_normalized
--   from public.customers
--   where phone_normalized is not null
--   group by phone_normalized
--   having count(*) > 1
-- )
-- order by phone_normalized, created_at;
