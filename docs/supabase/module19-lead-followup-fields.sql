-- Module 19: Lead follow-up fields for protected Lumosyn HQ.
-- Internal/server-side HQ usage only. Do not grant public or client read access.

alter table public.assessments
add column if not exists lead_status text default 'new';

alter table public.assessments
add column if not exists lead_priority text default 'normal';

alter table public.assessments
add column if not exists internal_note text;

alter table public.assessments
add column if not exists last_contacted_at timestamptz;

alter table public.assessments
add column if not exists follow_up_at timestamptz;

alter table public.assessments
add column if not exists lead_updated_at timestamptz default now();

comment on column public.assessments.lead_status is
  'Stores Daniel''s internal follow-up state. Allowed values: new, contacted, follow_up, quoted, closed_won, closed_lost, not_ready.';

comment on column public.assessments.lead_priority is
  'Stores internal priority level. Allowed values: low, normal, high.';

comment on column public.assessments.internal_note is
  'Stores private HQ-only notes.';

comment on column public.assessments.last_contacted_at is
  'Stores when Daniel last contacted the lead.';

comment on column public.assessments.follow_up_at is
  'Stores planned follow-up time/date.';

comment on column public.assessments.lead_updated_at is
  'Stores last internal lead update time.';

-- NOT VALID avoids failing this migration if an environment already has
-- exploratory values, while still enforcing allowed values for new writes.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'assessments_lead_status_check'
      and conrelid = 'public.assessments'::regclass
  ) then
    alter table public.assessments
    add constraint assessments_lead_status_check
    check (
      lead_status is null
      or lead_status in (
        'new',
        'contacted',
        'follow_up',
        'quoted',
        'closed_won',
        'closed_lost',
        'not_ready'
      )
    ) not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'assessments_lead_priority_check'
      and conrelid = 'public.assessments'::regclass
  ) then
    alter table public.assessments
    add constraint assessments_lead_priority_check
    check (
      lead_priority is null
      or lead_priority in ('low', 'normal', 'high')
    ) not valid;
  end if;
end $$;

-- Recreate the internal/server-side HQ reporting view so the new fields are
-- available only through protected HQ server reads.
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
  a.lead_updated_at
from public.assessments as a
join public.customers as c
  on c.id = a.customer_id;

comment on view public.lead_assessments is
  'Internal/server-side Lumosyn HQ usage only. Do not grant public or client read access.';

revoke all on public.lead_assessments from anon;
revoke all on public.lead_assessments from authenticated;
