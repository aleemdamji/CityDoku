-- Citydoku database. Run once in Supabase → SQL Editor.

-- One row per player: username, leagues and every daily game ("days"), keyed "<edition>:<date>".
create table if not exists public.players (
  id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  username_lc text generated always as (lower(data->>'username_lc')) stored,
  updated_at timestamptz not null default now()
);
create unique index if not exists players_username_lc_key on public.players (username_lc) where username_lc is not null;
create index if not exists players_updated_at_idx on public.players (updated_at desc);

alter table public.players enable row level security;
-- Leaderboards and pick-rate rarity need everyone's games, so rows are public to read.
create policy "players are readable by everyone" on public.players for select using (true);
create policy "players insert their own row" on public.players for insert with check (auth.uid() = id);
create policy "players update their own row" on public.players for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "players delete their own row" on public.players for delete using (auth.uid() = id);

-- Feedback and corrections: players can send, only you (dashboard / service role) can read.
create table if not exists public.feedback (
  id bigint generated always as identity primary key,
  user_id uuid default auth.uid() references auth.users(id) on delete set null,
  data jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.feedback enable row level security;
create policy "signed-in players can send feedback" on public.feedback for insert to authenticated with check (auth.uid() = user_id);

-- Live leaderboard updates
alter publication supabase_realtime add table public.players;

-- In-app account deletion (required by the App Store)
create or replace function public.delete_my_account() returns void
language sql security definer set search_path = public as $$
  delete from auth.users where id = auth.uid();
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
