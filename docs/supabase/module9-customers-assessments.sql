create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  name text not null,
  whatsapp text not null unique,
  email text,

  journey_stage text not null,
  community_status text not null default 'pending'
);

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  customer_id uuid not null references public.customers(id) on delete cascade,

  goal text not null,
  appliances text[] not null default '{}',
  other_appliance text,
  runtime text not null,
  budget text not null,
  timeline text not null,
  journey_stage text not null,

  recommendation_id text not null,
  recommendation_title text not null,
  system_size_label text not null,
  battery_label text not null,
  inverter_label text not null,
  solar_panel_label text not null,

  source text not null default 'web_estimate',
  is_latest boolean not null default true
);

alter table public.customers enable row level security;
alter table public.assessments enable row level security;
