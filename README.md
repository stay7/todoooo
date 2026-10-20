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
Supabase 에 연결하려면 `.env.example` 을 `.env.local` 로 복사하고 값을 채운다 (`.env*` 는 커밋되지 않는다).

## Supabase 설정

1. https://supabase.com 에서 프로젝트를 만든다.
2. `supabase/schema.sql` 전체를 대시보드 > **SQL Editor** 에 붙여넣고 실행한다.
3. 대시보드 > **Settings > API Keys** 에서 `Project URL` 과 `publishable` 키(`sb_publishable_...`)를 복사한다.
   예전 방식의 `anon` 키도 그대로 쓸 수 있다. 둘 다 브라우저에 노출돼도 되는 키이고, 접근 범위는 RLS 정책이 정한다.
4. Free 플랜 프로젝트는 1주일 동안 쓰지 않으면 일시정지된다. 시연 전에는 대시보드에 한 번 들어가 풀어 둔다.

### 공개 범위 주의

로그인 없이 누구나 쓸 수 있는 **공개 모드**다. `todos` 테이블은 RLS 를 켠 채 `anon` 과 로그인
사용자에게 읽기·쓰기를 전부 허용한다. 즉 배포 주소를 아는 사람은 누구나 모든 Todo 를 보고
수정·삭제할 수 있다. 강의 시연용이므로 개인 정보는 담지 않는다.

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
  App.tsx                    폰 프레임, 탭 전환, 시트 열고 닫기, 저장소 선택, 토스트
  components/Calendar        접을 수 있는 월간 캘린더 (일요일 시작, 미완료 개수 배지)
  components/TodoRow         Todo 한 줄 (체크 토글, 탭하면 편집 시트)
  components/TodoSheet       추가 / 편집 입력 폼 (삭제 버튼 포함)
  components/Sheet           아래에서 올라오는 시트
  components/TabBar          하단 탭바 (캘린더 · 날짜 미정 · 설정)
  components/SettingsScreen  저장 위치 표시, 로컬 데이터 초기화
  data/                      TodoRepository 인터페이스, Supabase / localStorage 구현
  hooks/useTodos.ts          낙관적 업데이트 상태 관리
public/manifest.webmanifest  홈 화면 추가용 매니페스트
supabase/schema.sql          todos 테이블, 인덱스, RLS 정책
```
