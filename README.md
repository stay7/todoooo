# Todooo

캘린더에서 날짜를 골라 그날의 할 일을 관리하는 개인용 Todo 앱.
모바일 앱 화면을 기준으로 만들었고, PC 브라우저에서는 가운데 폰 프레임 안에 보인다. 홈 화면에 추가하면 앱처럼 열린다.
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
2. Supabase 대시보드 > **SQL Editor** 에 `supabase/schema.sql` 전체 내용을 붙여넣고 실행한다. 테이블과 RLS 접근 규칙을 만든다.
3. 프로젝트 홈의 `Project URL` 과 **Settings > API Keys** 의 `publishable` 키(`sb_publishable_...`)를 복사해 `.env.local` 에 넣는다. 개발 서버가 실행 중이었다면 다시 시작한다.
   예전 방식의 `anon` 키도 그대로 쓸 수 있다.
4. Free 플랜 프로젝트는 1주일 동안 쓰지 않으면 일시정지된다. 시연 전에는 대시보드에 한 번 들어가 풀어 둔다.

> **공개 모드 주의**
> 로그인도 비밀 문구도 없다. RLS 정책이 `anon` 에게 모든 읽기·쓰기를 허용하고,
> publishable 키는 브라우저 번들에 그대로 들어간다. 즉 **배포 주소를 아는 누구나**
> 모든 Todo 를 보고 수정·삭제할 수 있다. 강의 시연용 설정이므로 개인 정보는 담지 않는다.
> 기존 브라우저 저장 데이터는 그대로 남으며 서버로 자동 전송되지 않는다.

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
  App.tsx                    폰 프레임, 탭 전환, 시트 열고 닫기, 토스트
  components/Calendar        접을 수 있는 월간 캘린더 (일요일 시작, 미완료 개수 배지)
  components/TodoRow         Todo 한 줄 (체크 토글, 탭하면 편집 시트)
  components/TodoSheet       추가 / 편집 입력 폼 (삭제 버튼 포함)
  components/Sheet           아래에서 올라오는 시트
  components/TabBar          하단 탭바 (캘린더 · 날짜 미정 · 설정)
  components/SettingsScreen  저장 모드 표시, 로컬 데이터 초기화
  data/                      TodoRepository 인터페이스, Supabase / localStorage 구현
  hooks/useTodos.ts          낙관적 업데이트 상태 관리
public/manifest.webmanifest  홈 화면 추가용 매니페스트
supabase/schema.sql          테이블, 공개 접근 RLS 정책
```
