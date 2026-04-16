-- TenderTrack schema
-- Run this in the Supabase SQL editor

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Tenders
create table if not exists tender (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  agency text not null,
  sector text not null,
  region text not null,
  status text not null default 'active' check (status in ('active', 'awarded', 'expired')),
  published_at timestamptz,
  deadline timestamptz,
  awarded_at timestamptz,
  description text,
  estimated_value numeric,
  created_at timestamptz default now()
);

-- Companies
create table if not exists company (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sector text,
  region text,
  created_at timestamptz default now()
);

-- Proposals
create table if not exists proposal (
  id uuid primary key default gen_random_uuid(),
  tender_id uuid references tender(id) on delete cascade not null,
  company_id uuid references company(id) on delete cascade not null,
  bid_amount numeric not null,
  is_winner boolean default false,
  rank int,
  submitted_at timestamptz default now()
);

-- Profile extends auth.users
create table if not exists profile (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  updated_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_proposal_tender_id on proposal(tender_id);
create index if not exists idx_proposal_company_id on proposal(company_id);
create index if not exists idx_proposal_is_winner on proposal(is_winner);
create index if not exists idx_tender_status on tender(status);
create index if not exists idx_tender_sector on tender(sector);
create index if not exists idx_tender_agency on tender(agency);

-- Row Level Security
alter table tender enable row level security;
alter table company enable row level security;
alter table proposal enable row level security;
alter table profile enable row level security;

-- Public read policies (data is non-sensitive procurement data)
create policy "Public read tenders" on tender for select using (true);
create policy "Public read companies" on company for select using (true);
create policy "Public read proposals" on proposal for select using (true);

-- Service role handles all writes (import script uses service role key)
-- Profile: owner only
create policy "Users can view own profile" on profile
  for select using (auth.uid() = id);

create policy "Users can insert own profile" on profile
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on profile
  for update using (auth.uid() = id);
