-- Todooo Supabase 스키마
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 실행한다.
--
-- 주의: 로그인이 없는 "공개 모드" 다. 앱 주소를 아는 누구나 모든 Todo 를
-- 읽고 수정·삭제할 수 있다. 강의 시연용이므로 개인 정보는 담지 않는다.

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

-- 2. RLS: 켜 둔 채로 전체 허용 --------------------------------------------
-- RLS 를 끄면 Supabase 가 경고하고, 켜 두고 정책이 없으면 아무것도 못 읽는다.
-- 그래서 켠 상태에서 anon(publishable 키) 과 로그인 사용자에게 전부 허용한다.
alter table public.todos enable row level security;

drop policy if exists "public access" on public.todos;
create policy "public access" on public.todos
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- 3. Data API 노출 -------------------------------------------------------
-- 프로젝트 설정에 따라 새 테이블이 자동으로 노출되지 않을 수 있어 명시한다.
grant select, insert, update, delete on public.todos to anon, authenticated;
