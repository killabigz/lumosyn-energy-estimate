create table if not exists public.estimate_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  name text not null,
  whatsapp text not null,
  email text,

  goal text not null,
  budget text not null,
  appliances text[] not null default '{}',
  other_appliance text,
  timeline text not null,

  journey_stage text not null,
  community_status text not null default 'pending',

  recommendation_id text not null,
  recommendation_title text not null,
  system_size_label text not null,
  battery_label text not null,
  inverter_label text not null,
  solar_panel_label text not null,

  source text not null default 'web_estimate'
);

alter table public.estimate_submissions enable row level security;
