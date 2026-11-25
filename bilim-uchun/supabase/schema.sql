-- BILIM UCHUN: Supabase SQL Editor'da bir marta ishga tushiring.
-- Eslatma: hech qachon service_role kalitini frontendga joylamang.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  role text not null default 'user' check (role in ('user','manager','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  genre text not null default 'Roman',
  age_group text not null default 'Kattalar' check (age_group in ('Bolalar','Kattalar')),
  language text not null default 'uz',
  description text default '',
  cover_url text default '',
  file_url text default '',
  downloads integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id, book_id)
);

create table if not exists public.book_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  request_text text not null,
  status text not null default 'new' check (status in ('new','in_progress','completed','rejected')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','manager')
  );
$$;

alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.favorites enable row level security;
alter table public.book_requests enable row level security;

drop policy if exists "profiles read own or staff" on public.profiles;
create policy "profiles read own or staff" on public.profiles for select
using (id = auth.uid() or public.is_staff());

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles for update
using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "books visible to everyone" on public.books;
create policy "books visible to everyone" on public.books for select using (true);

drop policy if exists "staff manage books" on public.books;
create policy "staff manage books" on public.books for all
using (public.is_staff()) with check (public.is_staff());

drop policy if exists "favorites own rows" on public.favorites;
create policy "favorites own rows" on public.favorites for all
using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "requests own or staff read" on public.book_requests;
create policy "requests own or staff read" on public.book_requests for select
using (user_id = auth.uid() or public.is_staff());

drop policy if exists "users create own requests" on public.book_requests;
create policy "users create own requests" on public.book_requests for insert
with check (user_id = auth.uid());

drop policy if exists "staff update requests" on public.book_requests;
create policy "staff update requests" on public.book_requests for update
using (public.is_staff()) with check (public.is_staff());

-- Kitob fayllari uchun private storage bucket.
insert into storage.buckets (id, name, public)
values ('books','books',false)
on conflict (id) do nothing;

-- Muqovalar uchun public bucket.
insert into storage.buckets (id, name, public)
values ('covers','covers',true)
on conflict (id) do nothing;

drop policy if exists "public read covers" on storage.objects;
create policy "public read covers" on storage.objects for select
using (bucket_id = 'covers');

drop policy if exists "staff upload files" on storage.objects;
create policy "staff upload files" on storage.objects for insert
with check (bucket_id in ('books','covers') and public.is_staff());

drop policy if exists "staff update files" on storage.objects;
create policy "staff update files" on storage.objects for update
using (bucket_id in ('books','covers') and public.is_staff())
with check (bucket_id in ('books','covers') and public.is_staff());

drop policy if exists "staff delete files" on storage.objects;
create policy "staff delete files" on storage.objects for delete
using (bucket_id in ('books','covers') and public.is_staff());

-- Birinchi adminni tayinlash:
-- Avval saytda shu email bilan oddiy ro'yxatdan o'ting.
-- Keyin pastdagi EMAILNI o'zingiznikiga almashtirib, SQL Editor'da alohida bajaring:
-- update public.profiles p set role = 'admin'
-- from auth.users u where p.id = u.id and u.email = 'SIZNING_EMAILINGIZ';
