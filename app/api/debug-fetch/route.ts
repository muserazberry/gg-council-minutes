// 임시 진단: Vercel 서버에서 kms 응답이 어떻게 오는지 확인
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET() {
  const url = "https://kms.ggc.go.kr/cms/mntsViewer.do?mntsId=15577";
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
      Referer: "https://kms.ggc.go.kr/svc/cms/mnts/MntsLatelyList.do",
    },
    cache: "no-store",
  });
  const buf = await res.arrayBuffer();
  const asUtf8 = new TextDecoder("utf-8").decode(buf).slice(0, 800);
  const asEucKr = new TextDecoder("euc-kr").decode(buf).slice(0, 800);
  return NextResponse.json({
    status: res.status,
    ok: res.ok,
    bytes: buf.byteLength,
    contentType: res.headers.get("content-type"),
    server: res.headers.get("server"),
    utf8Preview: asUtf8,
    eucKrPreview: asEucKr,
    hasBlockText: asUtf8.includes("차단") || asEucKr.includes("차단"),
    hasViewerId: asUtf8.includes("mntshtmlviewer") || asEucKr.includes("mntshtmlviewer"),
  });
}
