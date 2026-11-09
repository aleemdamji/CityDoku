-- Hardening after the 2026-11-09 audit. Run once in Supabase → SQL Editor, after schema.sql.
-- Safe to re-run. Existing rows are never rewritten.

begin;

-- 1. Username squatting: username_lc used to come from data->>'username_lc', so a player could reserve
--    a name without owning it. Derive it from the username itself instead.
drop index if exists public.players_username_lc_key;
alter table public.players drop column if exists username_lc;
alter table public.players add column username_lc text generated always as (lower(data->>'username')) stored;
create unique index players_username_lc_key on public.players (username_lc) where username_lc is not null;

-- 2. Reject malformed or impossible days. Only days that changed in this write are checked, so old rows keep working.
--    This stops obviously forged scores (n above 9, nonsense keys, huge payloads); it can't prove a score is honest.
create or replace function public.players_validate() returns trigger
language plpgsql set search_path = public as $$
declare k text; v jsonb; old_days jsonb;
begin
  if jsonb_typeof(new.data->'days') is distinct from 'object' then
    if new.data ? 'days' then raise exception 'days must be an object' using errcode = '22023'; end if;
    return new;
  end if;
  if (select count(*) from jsonb_object_keys(new.data->'days')) > 2000 then
    raise exception 'too many days' using errcode = '22023';
  end if;
  old_days := case when tg_op = 'UPDATE' and jsonb_typeof(old.data->'days') = 'object' then old.data->'days' else '{}'::jsonb end;
  for k, v in select key, value from jsonb_each(new.data->'days') loop
    continue when old_days->k is not distinct from v;
    if k !~ '^(global|ca|us|ap):[0-9]{4}-[0-9]{2}-[0-9]{2}$'
       or jsonb_typeof(v) <> 'object'
       or (v ? 'n' and (jsonb_typeof(v->'n') <> 'number' or (v->>'n')::numeric not between 0 and 9))
       or (v ? 'rarity' and jsonb_typeof(v->'rarity') = 'number' and (v->>'rarity')::numeric not between 0 and 1000)
       or (v ? 'cells' and (jsonb_typeof(v->'cells') <> 'array' or jsonb_array_length(v->'cells') <> 9))
       or (v ? 'ck' and (jsonb_typeof(v->'ck') <> 'array' or jsonb_array_length(v->'ck') <> 9))
       or (v ? 'log' and (jsonb_typeof(v->'log') <> 'array' or jsonb_array_length(v->'log') > 12))
    then
      raise exception 'invalid day %', k using errcode = '22023';
    end if;
  end loop;
  return new;
end $$;
drop trigger if exists players_validate on public.players;
create trigger players_validate before insert or update on public.players
  for each row execute function public.players_validate();

-- 3. Tidy: accurate policy name, and trigger functions are not callable as RPC.
drop policy if exists "players are readable by everyone" on public.players;
drop policy if exists "players readable by owner or when public" on public.players;
create policy "players readable by owner or when public" on public.players for select
  using (auth.uid() = id or data->'public' = 'true'::jsonb);
revoke all on function public.players_touch() from public, anon, authenticated;
revoke all on function public.players_validate() from public, anon, authenticated;
revoke all on function public.feedback_rate_limit() from public, anon, authenticated;
revoke all on function public.leagues_limit() from public, anon, authenticated;

commit;

-- 4. Feedback retention (the privacy policy says up to two years). Needs the pg_cron extension
--    (Supabase → Database → Extensions → pg_cron). Skipped quietly if it isn't enabled.
do $$
begin
  perform cron.schedule('feedback-purge', '0 3 * * *', $q$delete from public.feedback where created_at < now() - interval '2 years'$q$);
exception when others then
  raise notice 'pg_cron not available: enable it and re-run this block to purge old feedback (%).', sqlerrm;
end $$;
