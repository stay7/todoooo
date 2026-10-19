-- Todooo Supabase 스키마
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 실행한다.
--
-- 공개 모드: 로그인도 비밀 문구도 없이, 앱에 들어온 누구나 Todo 를 읽고 쓸 수 있다.
-- publishable 키는 브라우저 번들에 그대로 들어가므로, 주소를 아는 사람은 누구나
-- 모든 Todo 를 보고 수정·삭제할 수 있다. 강의 시연용 설정이며 개인 정보는 담지 않는다.

begin;

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

-- 2. RLS: 켜 두고, 모두 허용하는 정책을 명시적으로 둔다 --------------------
-- RLS 를 끄는 대신 이렇게 두면 "의도한 공개"임이 정책에 드러난다.
alter table public.todos enable row level security;
grant select, insert, update, delete on public.todos to anon, authenticated;

drop policy if exists "public access" on public.todos;
create policy "public access" on public.todos
  for all
  to anon, authenticated
  using (true)
  with check (true);

commit;
