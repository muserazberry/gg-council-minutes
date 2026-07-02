# 경기도의회 회의록 요약 앱

[![Deployed on Vercel](https://img.shields.io/badge/Vercel-live-black)](https://gg-council-minutes.vercel.app)

**Live**: https://gg-council-minutes.vercel.app

경기도의회 상임위 전자회의록과 영상회의록을 가져와 Claude API 로 요약 정리하는 Next.js 웹 앱.

요약 결과는 다음을 포함합니다:
- 회의 일자, 출석/불참 의원
- 안건과 의원별 핵심 발언
- 쟁점과 의결 결과
- 향후 일정

## 빠른 시작

### 1. 의존성 설치

```powershell
cd gg-council-minutes
npm install
# (옵션) 자동 크롤링용
npx playwright install chromium
```

### 2. Supabase 프로젝트 만들기

1. https://supabase.com 에서 프로젝트 생성
2. SQL Editor 에서 `supabase/schema.sql` 실행
3. Settings → API 에서 URL, anon key, service_role key 복사

### 3. 환경 변수 설정

```powershell
copy .env.example .env.local
notepad .env.local
```

```
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Anthropic 키 발급: https://console.anthropic.com

### 4. 개발 서버

```powershell
npm run dev
```

http://localhost:3000 접속.

## 사용법

### 방법 A — 수동 추가 (즉시 동작)

1. https://kms.ggc.go.kr 에서 보고 싶은 회의록을 연다
2. 주소창 URL (예: `…/cms/mntsViewer.do?mntsId=XYZ`) 을 복사
3. 앱 홈의 입력창에 붙여넣고 "가져와서 요약" 클릭

### 방법 B — 최근 1개월 자동 수집

13개 상임위 전체에 대해 최근 30일치 회의록을 자동 크롤 + 요약합니다.

```powershell
npm run crawl:recent
```

> **주의**: kms.ggc.go.kr 은 JavaScript 기반이라 Playwright 헤드리스 브라우저로
> 동작합니다. 실행 전 `npx playwright install chromium` 필요.
> 사이트 구조 변경 시 `lib/crawler/list.ts` 의 셀렉터를 조정해야 할 수 있습니다.

## 구조

```
app/
  page.tsx                    상임위 필터 + 최근 회의록 목록
  meeting/[id]/page.tsx       회의록 상세 + 요약 결과
  _components/                클라이언트 컴포넌트
  api/
    crawl/route.ts            POST: 1건 크롤 + DB 저장
    summarize/route.ts        POST: Claude API 로 요약
lib/
  committees.ts               13개 상임위 코드/이름 상수
  crawler/
    viewer.ts                 mntsViewer.do 파서 (cheerio)
    list.ts                   Playwright 기반 목록 크롤러
  anthropic.ts                Claude 요약 프롬프트 + 스키마
  repository.ts               Supabase CRUD
  supabase.ts                 클라이언트 팩토리
  types.ts                    공용 타입
supabase/schema.sql           DB 스키마
scripts/crawl-recent.ts       1개월치 자동 수집 CLI
```

## AI 요약 비용

- 모델: `claude-opus-4-7` (긴 회의록 요약 품질이 가장 좋음)
- 회의록 1건 ≈ 입력 5만 토큰 / 출력 2천 토큰 수준
- 비용을 줄이려면 `lib/anthropic.ts` 의 `MODEL` 을 `claude-sonnet-4-6` 또는
  `claude-haiku-4-5-20251001` 로 바꾸세요.

## 배포 (Vercel)

```powershell
npm run build
```

Vercel 에 연결한 뒤 환경 변수 4개를 동일하게 설정. **Playwright 자동 크롤은
서버리스에서 동작하지 않으니** 로컬/별도 워커에서만 실행하고, 웹 앱에서는
수동 추가와 결과 조회만 사용하세요.

## 트러블슈팅

**요약 시 "Could not resolve authentication method" 에러**

셸 환경변수에 빈 `ANTHROPIC_API_KEY=`가 이미 설정돼 있으면 `.env.local` 값을 덮어씁니다.
PowerShell 이나 새 터미널에서 dev 서버를 다시 시작하세요:

```powershell
# 셸 변수 지우고 시작
$env:ANTHROPIC_API_KEY = $null
npm run dev
```

**`kms.ggc.go.kr` 에서 429 bytes 만 리턴 / "접근 정책에 의해 차단"**

봇 차단 페이지입니다. 크롤러가 이미 브라우저 UA + Referer 를 붙이므로 대부분 통과하지만,
같은 IP 에서 초당 여러 회 요청하면 임시 차단될 수 있습니다. 1~2초 딜레이를 두고
재시도하세요.

## 한계와 알려진 이슈

- **자동 목록 크롤**: kms.ggc.go.kr 은 동적 페이지라 셀렉터가 변할 수 있음.
  실패 시 수동 추가로 대체 가능.
- **본문 추출**: 일부 회의록은 첨부 HWP/PDF 로만 제공됩니다. 그 경우 본문
  텍스트가 비어 422 에러가 납니다. 향후 HWP/PDF 파싱 추가 가능.
- **영상**: 현재 버전은 영상 URL 만 메타데이터로 저장하고, STT 자동 전사는
  포함하지 않습니다 (사용자 선택: 전자회의록 우선 + 영상 링크).
- **데이터 출처 표기**: 모든 결과 페이지에 원본 회의록 링크를 노출합니다.
  공식 데이터 검증은 항상 원본을 확인해 주세요.

## 라이선스

내부 연구/학습용. 경기도의회 회의록 본문의 저작권은 경기도의회에 있습니다.
