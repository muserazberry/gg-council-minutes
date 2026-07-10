// 임시 진단: Vercel 서버에서 kms 응답이 어떻게 오는지 확인
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

export async function GET() {
  // 1. 리스트 페이지 방문해서 세션 쿠키 확보
  const listRes = await fetch(
    "https://kms.ggc.go.kr/svc/cms/mnts/MntsLatelyList.do",
    {
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
      },
      cache: "no-store",
    }
  );
  const setCookies = listRes.headers.get("set-cookie") || "";
  const cookieJar = setCookies
    .split(/,(?=[A-Za-z_]+=)/)
    .map((c) => c.split(";")[0].trim())
    .join("; ");

  // 2. 뷰어 페이지 요청 (쿠키 실어서)
  const url = "https://kms.ggc.go.kr/cms/mntsViewer.do?mntsId=15577";
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
      Referer: "https://kms.ggc.go.kr/svc/cms/mnts/MntsLatelyList.do",
      ...(cookieJar ? { Cookie: cookieJar } : {}),
    },
    cache: "no-store",
  });
  const buf = await res.arrayBuffer();
  const asUtf8 = new TextDecoder("utf-8").decode(buf);
  return NextResponse.json({
    listStatus: listRes.status,
    cookieJar: cookieJar.slice(0, 200),
    status: res.status,
    ok: res.ok,
    bytes: buf.byteLength,
    contentType: res.headers.get("content-type"),
    server: res.headers.get("server"),
    utf8Preview: asUtf8.slice(0, 600),
    hasViewerId: asUtf8.includes("mntshtmlviewer"),
    hasContent: asUtf8.includes("경제노동위원회") || asUtf8.includes("위원장"),
  });
}
