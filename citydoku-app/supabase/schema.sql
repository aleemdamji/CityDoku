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
-- Private by default: a row is readable by others only when the player opted in to
-- leaderboards (data.public = true). Players can always read their own row.
create policy "players are readable by everyone" on public.players for select
  using (auth.uid() = id or data->'public' = 'true'::jsonb);
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

-- Size caps so one account can't bloat everyone's leaderboard download
alter table public.players drop constraint if exists players_data_size,
  add constraint players_data_size check (pg_column_size(data) < 1048576);
alter table public.feedback drop constraint if exists feedback_data_size,
  add constraint feedback_data_size check (pg_column_size(data) < 16384);

-- The server sets updated_at, so nobody can pin their row to the top of the leaderboard load.
create or replace function public.players_touch() returns trigger
language plpgsql set search_path = public as $$
begin new.updated_at := now(); return new; end $$;
drop trigger if exists players_touch on public.players;
create trigger players_touch before insert or update on public.players
  for each row execute function public.players_touch();

-- Usernames: 3-20 letters, digits, - or _, and username_lc must match (stops look-alike/impersonation names).
alter table public.players drop constraint if exists players_username_ok,
  add constraint players_username_ok check (
    coalesce(jsonb_typeof(data->'username'), 'null') = 'null' or (
      jsonb_typeof(data->'username') = 'string'
      and data->>'username' ~ '^[A-Za-z0-9_-]{3,20}$'
      and data->>'username_lc' = lower(data->>'username')));

-- Merge saves on the server so two devices never erase each other's days or leagues.
create or replace function public.merge_my_data(patch jsonb) returns jsonb
language plpgsql security invoker set search_path = public as $$
declare uid uuid := auth.uid(); result jsonb;
begin
  if uid is null then raise exception 'not signed in' using errcode = '42501'; end if;
  if patch is null or jsonb_typeof(patch) <> 'object' then raise exception 'bad patch' using errcode = '22023'; end if;
  insert into public.players as p (id, data) values (uid, patch)
  on conflict (id) do update set data =
    (p.data || (excluded.data - 'days' - 'leagues'))
    || jsonb_build_object(
      'days', (case when jsonb_typeof(p.data->'days') = 'object' then p.data->'days' else '{}'::jsonb end)
           || (case when jsonb_typeof(excluded.data->'days') = 'object' then excluded.data->'days' else '{}'::jsonb end),
      'leagues', (case when jsonb_typeof(p.data->'leagues') = 'object' then p.data->'leagues' else '{}'::jsonb end)
           || (case when jsonb_typeof(excluded.data->'leagues') = 'object' then excluded.data->'leagues' else '{}'::jsonb end))
  returning p.data into result;
  return result;
end $$;
revoke all on function public.merge_my_data(jsonb) from public, anon;
grant execute on function public.merge_my_data(jsonb) to authenticated;

-- League registry: the code's name is fixed by its creator and can't be renamed or listed.
create table if not exists public.leagues (
  code text primary key check (code ~ '^[A-Z0-9]{6}$'),
  name text not null check (char_length(name) between 3 and 30),
  owner uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.leagues enable row level security;
drop policy if exists "players create their own leagues" on public.leagues;
create policy "players create their own leagues" on public.leagues for insert to authenticated with check (owner = auth.uid());
create or replace function public.league_name(p_code text) returns text
language sql stable security definer set search_path = public as $$
  select name from public.leagues where code = upper(p_code);
$$;
revoke all on function public.league_name(text) from public;
grant execute on function public.league_name(text) to anon, authenticated;

-- Rate limits: feedback (10/hour, 30/day per player) and leagues (20 per player).
create index if not exists feedback_user_time_idx on public.feedback (user_id, created_at desc);
create or replace function public.feedback_rate_limit() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.feedback where user_id = new.user_id and created_at > now() - interval '1 hour') >= 10
     or (select count(*) from public.feedback where user_id = new.user_id and created_at > now() - interval '1 day') >= 30 then
    raise exception 'Too much feedback, try again later' using errcode = 'P0001';
  end if;
  return new;
end $$;
drop trigger if exists feedback_rate_limit on public.feedback;
create trigger feedback_rate_limit before insert on public.feedback for each row execute function public.feedback_rate_limit();
create or replace function public.leagues_limit() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.leagues where owner = new.owner) >= 20 then
    raise exception 'League limit reached' using errcode = 'P0001';
  end if;
  return new;
end $$;
drop trigger if exists leagues_limit on public.leagues;
create trigger leagues_limit before insert on public.leagues for each row execute function public.leagues_limit();

-- Live leaderboard updates
alter publication supabase_realtime add table public.players;

-- In-app account deletion (required by the App Store)
create or replace function public.delete_my_account() returns void
language sql security definer set search_path = public as $$
  delete from auth.users where id = auth.uid();
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
