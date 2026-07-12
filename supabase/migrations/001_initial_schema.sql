-- CinePulse initial schema
-- Run in the Supabase SQL editor or via `supabase db push`.

create extension if not exists "pgcrypto";

create table if not exists public.user_media_list (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade default auth.uid(),
  imdb_id          text not null,
  title            text not null,
  year             text not null default '',
  media_type       text not null check (media_type in ('movie', 'series', 'episode')),
  poster           text,
  genres           text[] not null default '{}',
  runtime_minutes  integer not null default 0 check (runtime_minutes >= 0),
  total_episodes   integer check (total_episodes is null or total_episodes >= 0),
  status           text not null default 'plan_to_watch'
                   check (status in ('watching', 'completed', 'plan_to_watch', 'dropped')),
  current_season   integer not null default 1 check (current_season >= 1),
  current_episode  integer not null default 0 check (current_episode >= 0),
  rating           smallint check (rating between 1 and 10),
  notes            text not null default '' check (char_length(notes) <= 2000),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  completed_at     timestamptz,
  constraint user_media_list_unique_title unique (user_id, imdb_id)
);

-- Indexes for the most common access paths
create index if not exists idx_user_media_list_user_status on public.user_media_list (user_id, status);
create index if not exists idx_user_media_list_user_updated on public.user_media_list (user_id, updated_at desc);
create index if not exists idx_user_media_list_genres on public.user_media_list using gin (genres);

-- Keep updated_at honest, regardless of what the client sends
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_media_list_updated_at on public.user_media_list;
create trigger trg_user_media_list_updated_at
  before update on public.user_media_list
  for each row execute function public.set_updated_at();

-- Row Level Security: every statement is filtered by the caller's JWT.
alter table public.user_media_list enable row level security;
alter table public.user_media_list force row level security;

create policy "Users can read own media"
  on public.user_media_list for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own media"
  on public.user_media_list for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own media"
  on public.user_media_list for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own media"
  on public.user_media_list for delete
  to authenticated
  using (auth.uid() = user_id);

-- Anonymous visitors get nothing
revoke all on public.user_media_list from anon;
grant select, insert, update, delete on public.user_media_list to authenticated;
