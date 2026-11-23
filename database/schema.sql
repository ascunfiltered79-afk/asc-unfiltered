-- ASC UNFILTERED — Supabase schema / security setup
-- Execute once in Supabase -> SQL Editor. You must also create an admin user
-- and insert that user's UUID into public.site_admins (see README).
-- Never put your service_role key in a public GitHub repository.

create extension if not exists pgcrypto;

create table if not exists public.site_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.site_admins enable row level security;

create or replace function public.is_site_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.site_admins a where a.user_id = (select auth.uid()));
$$;
revoke all on function public.is_site_admin() from public;
grant execute on function public.is_site_admin() to anon, authenticated;

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('confession','meme','tea','question','media')),
  nickname text check (char_length(nickname) <= 32),
  body text not null check (char_length(body) between 8 and 700),
  media_url text check (media_url is null or (char_length(media_url) <= 1500 and media_url ~ '^https://')),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  consent boolean not null default false,
  created_at timestamptz not null default now(),
  published_at timestamptz
);
create index if not exists posts_status_created_idx on public.posts(status,created_at desc);
alter table public.posts enable row level security;

drop policy if exists public_read_approved_posts on public.posts;
create policy public_read_approved_posts on public.posts for select to anon,authenticated
using (status = 'approved' or (select public.is_site_admin()));
drop policy if exists public_submit_pending_posts on public.posts;
create policy public_submit_pending_posts on public.posts for insert to anon,authenticated
with check (status = 'pending' and published_at is null and consent = true);
drop policy if exists admin_add_posts on public.posts;
create policy admin_add_posts on public.posts for insert to authenticated
with check ((select public.is_site_admin()));
drop policy if exists admin_change_posts on public.posts;
create policy admin_change_posts on public.posts for update to authenticated
using ((select public.is_site_admin())) with check ((select public.is_site_admin()));
drop policy if exists admin_delete_posts on public.posts;
create policy admin_delete_posts on public.posts for delete to authenticated
using ((select public.is_site_admin()));

create table if not exists public.polls (
  id uuid primary key default gen_random_uuid(),
  question text not null check (char_length(question) between 8 and 180),
  options jsonb not null check (
    jsonb_typeof(options) = 'array' and jsonb_array_length(options) between 2 and 5
  ),
  is_open boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.polls enable row level security;
drop policy if exists everyone_reads_polls on public.polls;
create policy everyone_reads_polls on public.polls for select to anon,authenticated using (true);
drop policy if exists admins_create_polls on public.polls;
create policy admins_create_polls on public.polls for insert to authenticated
with check ((select public.is_site_admin()));
drop policy if exists admins_edit_polls on public.polls;
create policy admins_edit_polls on public.polls for update to authenticated
using ((select public.is_site_admin())) with check ((select public.is_site_admin()));
drop policy if exists admins_delete_polls on public.polls;
create policy admins_delete_polls on public.polls for delete to authenticated
using ((select public.is_site_admin()));

create table if not exists public.poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  option_index integer not null check (option_index >= 0),
  created_at timestamptz not null default now()
);
create index if not exists poll_votes_poll_idx on public.poll_votes(poll_id);
alter table public.poll_votes enable row level security;
drop policy if exists public_vote_on_open_polls on public.poll_votes;
create policy public_vote_on_open_polls on public.poll_votes for insert to anon,authenticated
with check (exists (
  select 1 from public.polls p where p.id = poll_id and p.is_open
  and option_index < jsonb_array_length(p.options)
));
-- No SELECT policy on poll_votes: raw votes are not publicly readable.
create or replace function public.get_poll_results(p_poll_id uuid)
returns table(option_index integer,votes bigint) language sql stable security definer set search_path = '' as $$
  select v.option_index,count(*)::bigint from public.poll_votes v
  join public.polls p on p.id=v.poll_id
  where v.poll_id=p_poll_id group by v.option_index order by v.option_index;
$$;
revoke all on function public.get_poll_results(uuid) from public;
grant execute on function public.get_poll_results(uuid) to anon,authenticated;

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  reason text not null check (reason in ('bullying','privacy','false_claim','copyright','other')),
  details text check (char_length(details) <= 500),
  created_at timestamptz not null default now()
);
alter table public.reports enable row level security;
drop policy if exists public_create_reports on public.reports;
create policy public_create_reports on public.reports for insert to anon,authenticated
with check (exists (select 1 from public.posts p where p.id = post_id and p.status = 'approved'));
drop policy if exists admins_read_reports on public.reports;
create policy admins_read_reports on public.reports for select to authenticated
using ((select public.is_site_admin()));
drop policy if exists admins_remove_reports on public.reports;
create policy admins_remove_reports on public.reports for delete to authenticated
using ((select public.is_site_admin()));

-- Explicit privileges; row-level policies above still apply.
grant select,insert,update,delete on public.posts to anon,authenticated;
grant select,insert,update,delete on public.polls to anon,authenticated;
grant select,insert on public.poll_votes to anon,authenticated;
grant select,insert,delete on public.reports to anon,authenticated;
revoke all on public.site_admins from anon,authenticated;

-- After making your admin user in Authentication -> Users, run this separately
-- with your real admin user UUID (NEVER publish a personal password):
-- insert into public.site_admins(user_id)
-- values ('PASTE-AUTH-USER-UUID-HERE') on conflict (user_id) do nothing;
