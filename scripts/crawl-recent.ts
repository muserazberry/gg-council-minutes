// 최근 1개월치 회의록을 모든 상임위에 대해 자동 수집 + 요약.
// 사용: npm run crawl:recent
// 사전 조건: playwright 설치 (npx playwright install chromium)

import "dotenv/config";
import { COMMITTEES } from "../lib/committees";
import { crawlList } from "../lib/crawler/list";
import { fetchAndParseMeeting } from "../lib/crawler/viewer";
import { summarizeMeeting } from "../lib/anthropic";
import { upsertMeeting, saveSummary, getMeeting } from "../lib/repository";

const SINCE_DAYS = 30;

async function main() {
  for (const c of COMMITTEES) {
    console.log(`\n[${c.name}] 목록 조회…`);
    let items: Awaited<ReturnType<typeof crawlList>>;
    try {
      items = await crawlList({ cmtNmCd: c.code, sinceDays: SINCE_DAYS });
    } catch (e) {
      console.warn(`  목록 실패: ${(e as Error).message}`);
      continue;
    }
    console.log(`  ${items.length}건 발견`);

    for (const it of items) {
      try {
        const existing = await getMeeting(it.mntsId);
        if (existing?.summarizedAt) {
          console.log(`  - skip(이미 요약): ${it.mntsId}`);
          continue;
        }
        const m = await fetchAndParseMeeting(it.mntsId);
        await upsertMeeting(m);
        if (m.bodyText.length < 200) {
          console.warn(`  - 본문 짧음, 요약 보류: ${it.mntsId}`);
          continue;
        }
        const { summary } = await summarizeMeeting(m);
        await saveSummary(m.mntsId, summary);
        console.log(`  ✓ ${m.title}`);
      } catch (e) {
        console.warn(`  ✗ ${it.mntsId}: ${(e as Error).message}`);
      }
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
