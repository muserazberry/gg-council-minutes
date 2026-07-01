import * as cheerio from "cheerio";
import { KMS_BASE, COMMITTEE_BY_CODE } from "../committees";
import type { MeetingRaw, CommitteeCode } from "../types";

const VIEWER_URL = `${KMS_BASE}/cms/mntsViewer.do`;

export function extractMntsId(input: string): string {
  // mntsId 자체이거나 URL 어디든 mntsId=... 형태면 추출
  const m = input.match(/mntsId=([A-Za-z0-9_-]+)/);
  if (m) return m[1];
  if (/^[A-Za-z0-9_-]{6,}$/.test(input.trim())) return input.trim();
  throw new Error(`mntsId를 찾을 수 없음: ${input}`);
}

export async function fetchViewerHtml(mntsId: string): Promise<string> {
  const url = `${VIEWER_URL}?mntsId=${encodeURIComponent(mntsId)}`;
  // kms.ggc.go.kr 는 브라우저 UA + Referer 없으면 차단 페이지를 리턴.
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
      Referer: `${KMS_BASE}/svc/cms/mnts/MntsLatelyList.do`,
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`viewer fetch failed: ${res.status} ${url}`);
  const html = await res.text();
  // 차단 페이지는 항상 1KB 미만
  if (html.length < 2000 && html.includes("차단")) {
    throw new Error("접근 차단 페이지 리턴 — 헤더/IP 확인 필요");
  }
  return html;
}

export function parseViewer(html: string, mntsId: string): MeetingRaw {
  const $ = cheerio.load(html);

  // <title> 안에 회의명이 정확히 들어있다. 사이트명(|) 뒤는 제거.
  const rawTitle = $("title").text().trim();
  const title = rawTitle.split("|")[0].trim();

  const dateMatch =
    title.match(/(20\d{2})[.\-/]\s*(\d{1,2})[.\-/]\s*(\d{1,2})/) ||
    html.match(/(20\d{2})[.\-/]\s*(\d{1,2})[.\-/]\s*(\d{1,2})/) ||
    [];
  const date = dateMatch[0]
    ? `${dateMatch[1]}-${dateMatch[2].padStart(2, "0")}-${dateMatch[3].padStart(2, "0")}`
    : "";

  const sessionMatch = title.match(/제\s*(\d+)\s*회/);
  const roundMatch = title.match(/제\s*(\d+)\s*차/);

  // 회의록 본문은 #mntshtmlviewer 안에 완전히 들어있음.
  const bodyText = (
    $("#mntshtmlviewer").text() ||
    $("#txt").text() ||
    $(".conts").text() ||
    $("body").text()
  )
    .replace(/\s+/g, " ")
    .trim();

  const committeeCode = guessCommittee(title) ?? "C001";
  const committeeName =
    COMMITTEE_BY_CODE[committeeCode]?.name ?? "상임위원회";

  return {
    mntsId,
    committeeCode,
    committeeName,
    session: sessionMatch?.[1] ?? "",
    round: roundMatch?.[1] ?? "",
    date,
    title: title || `회의록 ${mntsId}`,
    bodyText,
    sourceUrl: `${VIEWER_URL}?mntsId=${mntsId}`,
  };
}

function guessCommittee(title: string): CommitteeCode | undefined {
  for (const [code, c] of Object.entries(COMMITTEE_BY_CODE)) {
    if (title.includes(c.name) || title.includes(c.shortName)) {
      return code as CommitteeCode;
    }
  }
  return undefined;
}

export async function fetchAndParseMeeting(input: string): Promise<MeetingRaw> {
  const mntsId = extractMntsId(input);
  const html = await fetchViewerHtml(mntsId);
  return parseViewer(html, mntsId);
}
