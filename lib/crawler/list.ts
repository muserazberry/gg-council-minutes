// 자동 목록 크롤링 — Playwright 기반 (devDependency).
// 서버리스 환경에서는 사용 불가. 로컬 또는 별도 워커에서 실행.

import type { CommitteeCode } from "../types";
import { KMS_BASE, CURRENT_DAESU } from "../committees";

export interface ListItem {
  mntsId: string;
  title: string;
  date: string;
  session?: string;
  round?: string;
}

export interface ListOptions {
  daesu?: string;
  cmtNmCd: CommitteeCode;
  sinceDays?: number;
}

export async function crawlList(opts: ListOptions): Promise<ListItem[]> {
  // Lazy import — Playwright는 옵션이라 require 시점에 로딩
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext({ locale: "ko-KR" });
    const page = await ctx.newPage();
    const url = `${KMS_BASE}/svc/cms/mnts/MntsTreeCmmtList.do`;
    await page.goto(url, { waitUntil: "networkidle" });

    await page.evaluate(
      ([daesu, code]) => {
        // 페이지 정의 함수 호출로 목록 로드
        // @ts-expect-error - kms.ggc.go.kr 페이지에 정의된 전역 함수
        if (typeof goMntsTreeCmmtPage === "function") {
          // @ts-expect-error
          goMntsTreeCmmtPage(daesu, "C", code, "");
        }
      },
      [opts.daesu ?? CURRENT_DAESU, opts.cmtNmCd]
    );

    await page.waitForTimeout(2500);

    const items: ListItem[] = await page.$$eval("a", (links) =>
      links
        .map((a) => {
          const href = a.getAttribute("href") || "";
          const onclick = a.getAttribute("onclick") || "";
          const m =
            href.match(/mntsId=([A-Za-z0-9_-]+)/) ||
            onclick.match(/['"]([A-Za-z0-9_-]{8,})['"]/);
          if (!m) return null;
          return {
            mntsId: m[1],
            title: a.textContent?.trim() || "",
            date: "",
          } as ListItem;
        })
        .filter(Boolean) as ListItem[]
    );

    const cutoff = opts.sinceDays
      ? Date.now() - opts.sinceDays * 86400 * 1000
      : 0;

    return items.filter((it) => {
      if (!cutoff) return true;
      if (!it.date) return true;
      return new Date(it.date).getTime() >= cutoff;
    });
  } finally {
    await browser.close();
  }
}
