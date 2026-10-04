-- Run this once in the Supabase SQL Editor for your project.

create table if not exists public.brokers (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  opt_out_url text,
  method text,
  notes text default '',
  found_on_search boolean default false,
  status text default 'not_checked',
  last_submitted_date date,
  next_recheck_date date,
  history jsonb default '[]'::jsonb,
  updated_at timestamptz default now(),
  primary key (user_id, id)
);

alter table public.brokers enable row level security;

create policy "Users manage their own brokers"
  on public.brokers
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
