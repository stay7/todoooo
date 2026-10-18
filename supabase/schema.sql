-- Todooo Supabase 스키마
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 실행한다.
-- 실행 전에 맨 아래 "비밀 문구 등록" 부분의 <비밀문구> 를 본인 문구로 바꾼다.

create extension if not exists pgcrypto with schema extensions;

-- 1. todos 테이블 --------------------------------------------------------
create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 100),
  description text check (description is null or char_length(description) <= 200),
  estimated_minutes integer check (estimated_minutes is null or estimated_minutes > 0),
  due_date date,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists todos_due_date_created_at_idx
  on public.todos (due_date, created_at);

-- 2. 비밀 문구 저장 (API 에 노출되지 않는 스키마) -------------------------
create schema if not exists private;

create table if not exists private.owner_secret (
  id boolean primary key default true check (id),  -- 행을 1개만 허용
  key_hash text not null
);

-- 3. 요청 헤더 x-owner-key 가 저장된 해시와 일치하는지 검사 --------------
create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from private.owner_secret s
    where s.key_hash = encode(
      extensions.digest(
        coalesce(current_setting('request.headers', true)::json ->> 'x-owner-key', ''),
        'sha256'
      ),
      'hex'
    )
  );
$$;

grant execute on function public.is_owner() to anon;

-- 4. RLS: 비밀 문구가 맞을 때만 읽기/쓰기 허용 ----------------------------
alter table public.todos enable row level security;

drop policy if exists "owner only" on public.todos;
create policy "owner only" on public.todos
  for all
  to anon
  using (public.is_owner())
  with check (public.is_owner());

-- 5. 비밀 문구 등록 (한 번만. 바꾸고 싶으면 다시 실행) ---------------------
insert into private.owner_secret (id, key_hash)
values (true, encode(extensions.digest('<비밀문구>', 'sha256'), 'hex'))
on conflict (id) do update set key_hash = excluded.key_hash;
