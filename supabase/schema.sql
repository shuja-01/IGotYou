-- Supabase Database Schema for "I Got You!" Food Suitability & Health Advisor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text default '',
  conditions jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

create policy "Users can view their own profile." on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile." on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

-- 2. PRODUCTS TABLE
create table if not exists public.products (
  id text primary key,
  name text not null,
  brand text not null,
  category text not null,
  image_url text not null,
  serving_size text default '100g',
  nutrition_per_100g jsonb not null,
  harmful_tags text[] default '{}',
  description text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on products
alter table public.products enable row level security;

create policy "Anyone can view products." on public.products
  for select using (true);
