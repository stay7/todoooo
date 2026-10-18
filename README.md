# Todooo

캘린더에서 날짜를 골라 그날의 할 일을 관리하는 개인용 Todo 웹.
기획 내용은 [기획서.md](./기획서.md) 참고.

- 프론트엔드: React + Vite + TypeScript
- 데이터: Supabase (PostgreSQL)
- 배포: GitHub Pages → https://stay7.github.io/todoooo/

## 로컬에서 실행

```bash
npm install
npm run dev
```

Supabase 환경변수가 없으면 **로컬 저장 모드**로 동작한다 (브라우저 localStorage 에만 저장, 화면 상단에 표시).
Supabase 에 연결하려면 `.env.example` 을 `.env` 로 복사하고 값을 채운다.

## Supabase 설정

1. https://supabase.com 에서 프로젝트를 만든다.
2. `supabase/schema.sql` 을 열어 맨 아래 `<비밀문구>` 를 본인만 아는 문구로 바꾼다.
3. Supabase 대시보드 > **SQL Editor** 에 전체 내용을 붙여넣고 실행한다.
4. 대시보드 > **Project Settings > API** 에서 `Project URL` 과 `anon public` 키를 복사한다.

비밀 문구는 서버에 해시로만 저장된다. 앱 첫 실행 때 같은 문구를 입력하면 브라우저에 저장되고,
매 요청 헤더(`x-owner-key`)로 보내져 RLS 정책이 검사한다. 문구가 다르면 아무것도 읽고 쓸 수 없다.

## GitHub Pages 배포

`main` 에 push 하면 `.github/workflows/deploy.yml` 이 빌드해서 Pages 에 올린다.

1. 저장소 **Settings > Pages > Source** 를 `GitHub Actions` 로 둔다.
2. 저장소 **Settings > Secrets and variables > Actions** 에 아래 두 개를 추가한다.
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. 시크릿이 없으면 배포된 사이트는 로컬 저장 모드로 동작한다. 시크릿을 넣고 다시 push 하면 Supabase 모드가 된다.

## 폴더 구조

```
src/
  App.tsx                 화면 구성, 비밀 문구 게이트, 토스트
  components/Calendar     월간 캘린더 (일요일 시작, 미완료 개수 배지)
  components/TodoPanel    선택한 날짜의 Todo 목록 + 날짜 미정 섹션
  components/TodoItem     Todo 한 줄 (체크, 인라인 편집, 삭제)
  components/TodoForm     새 Todo 입력 폼
  data/                   TodoRepository 인터페이스, Supabase / localStorage 구현
  hooks/useTodos.ts       낙관적 업데이트 상태 관리
supabase/schema.sql       테이블, RLS, 비밀 문구 검증 함수
```
