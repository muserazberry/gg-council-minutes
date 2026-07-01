-- 경기도의회 회의록 요약 앱 스키마
-- Supabase SQL Editor 에서 실행

create table if not exists meetings (
  mnts_id           text primary key,
  committee_code    text not null,
  committee_name    text not null,
  session           text,
  round             text,
  meeting_date      date not null,
  title             text not null,
  body_text         text,
  video_url         text,
  source_url        text not null,
  summary           jsonb,
  summarized_at     timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists meetings_committee_date_idx
  on meetings (committee_code, meeting_date desc);

create index if not exists meetings_date_idx
  on meetings (meeting_date desc);

-- 요약 호출 로그 (재시도/디버깅용, optional)
create table if not exists summary_runs (
  id            uuid primary key default gen_random_uuid(),
  mnts_id       text not null references meetings(mnts_id) on delete cascade,
  model         text not null,
  input_tokens  int,
  output_tokens int,
  error         text,
  created_at    timestamptz not null default now()
);

-- meetings: 공개 read 허용
alter table meetings enable row level security;
create policy "public read meetings"
  on meetings for select using (true);

-- summary_runs: 내부 로그 — 클라이언트 접근 차단
-- RLS 켜고 정책 없이 두면 anon/authenticated 는 접근 불가.
-- 서버 쪽은 service_role 키를 쓰므로 RLS 자체를 우회해 정상 동작.
alter table summary_runs enable row level security;
