-- ============================================================
-- COLLARIX — SUPABASE SCHEMA
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. PROFILES (extends auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "Users can read/write own profile"
  on profiles for all using (auth.uid() = id);

-- Automatically create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- 2. PETS
create table if not exists pets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  species text default 'dog',
  breed text,
  age int,
  dob date,
  weight numeric,
  height numeric,
  sex text default 'Male',
  photo text default '🐕',
  color text default '#D4A853',
  owner_info jsonb default '{}',
  emergency_contact jsonb default '{}',
  health jsonb default '{"vaccinations":[],"allergies":[],"conditions":["None"],"medications":[]}',
  litter_status text default 'clean',
  litter_last_cleaned timestamptz,
  created_at timestamptz default now()
);
alter table pets enable row level security;
create policy "Users manage own pets"
  on pets for all using (auth.uid() = user_id);

-- 3. FOOD LOGS
create table if not exists food_logs (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  time text,
  meal text,
  item text,
  qty text,
  notes text,
  date date default current_date,
  created_at timestamptz default now()
);
alter table food_logs enable row level security;
create policy "Users manage own food logs"
  on food_logs for all using (auth.uid() = user_id);

-- 4. WATER LOGS
create table if not exists water_logs (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  time text,
  amount text,
  date date default current_date,
  created_at timestamptz default now()
);
alter table water_logs enable row level security;
create policy "Users manage own water logs"
  on water_logs for all using (auth.uid() = user_id);

-- 5. LITTER HISTORY
create table if not exists litter_history (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  cleaned_at timestamptz default now()
);
alter table litter_history enable row level security;
create policy "Users manage own litter history"
  on litter_history for all using (auth.uid() = user_id);

-- 6. VET APPOINTMENTS
create table if not exists vet_appointments (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  date date,
  clinic text,
  reason text,
  vet text,
  notes text,
  is_past boolean default false,
  created_at timestamptz default now()
);
alter table vet_appointments enable row level security;
create policy "Users manage own vet appointments"
  on vet_appointments for all using (auth.uid() = user_id);

-- 7. REMINDERS
create table if not exists reminders (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  type text default 'feeding',
  title text,
  time text,
  active boolean default true,
  created_at timestamptz default now()
);
alter table reminders enable row level security;
create policy "Users manage own reminders"
  on reminders for all using (auth.uid() = user_id);

-- 8. BLOG POSTS (shared/community)
create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete set null,
  author text,
  title text not null,
  excerpt text,
  category text default 'Tips',
  read_time text default '3 min read',
  likes int default 0,
  created_at timestamptz default now()
);
alter table blog_posts enable row level security;
-- Anyone can read; only owners can insert/update/delete their own
create policy "Anyone can read blog posts" on blog_posts for select using (true);
create policy "Users manage own blog posts" on blog_posts for insert with check (auth.uid() = user_id);
create policy "Users update own blog posts" on blog_posts for update using (auth.uid() = user_id);
create policy "Users delete own blog posts" on blog_posts for delete using (auth.uid() = user_id);

-- 9. BLOG LIKES (prevents double-liking)
create table if not exists blog_likes (
  user_id uuid references auth.users on delete cascade,
  post_id uuid references blog_posts on delete cascade,
  primary key (user_id, post_id)
);
alter table blog_likes enable row level security;
create policy "Users manage own likes" on blog_likes for all using (auth.uid() = user_id);

-- ============================================================
-- SEED: Insert sample blog posts (optional)
-- ============================================================
insert into blog_posts (author, title, excerpt, category, read_time, likes) values
  ('Dr. Meera Joshi', 'Understanding Your Cat''s Nutritional Needs', 'Cats are obligate carnivores and require specific nutrients that can only be found in animal tissue. Learn how to read labels and choose the right food.', 'Nutrition', '5 min read', 47),
  ('Dr. Rajesh Kumar', 'Signs Your Dog May Need a Vet Visit', 'Knowing when to take your dog to the vet versus when to monitor at home can be tricky. Here are the top warning signs that require immediate attention.', 'Health', '4 min read', 83),
  ('Team Collarix', 'Grooming Your Pet at Home: A Complete Guide', 'Professional grooming is great, but regular home grooming keeps your pet comfortable and helps you spot health issues early. Here''s how to do it right.', 'Grooming', '6 min read', 62),
  ('Dr. Anika Mehta', 'Vaccination Schedule for Dogs & Cats in India', 'Core and non-core vaccines, when to give them, and what to watch out for after vaccination. A comprehensive guide for Indian pet owners.', 'Vaccination', '7 min read', 91),
  ('Team Collarix', 'Creating a Pet-Friendly Home Environment', 'From toxic plants to safe spaces, here is everything you need to know about making your home safe and comfortable for your furry companion.', 'Lifestyle', '5 min read', 38)
on conflict do nothing;
