import { NextResponse } from "next/server";
import { z } from "zod";
import { fetchAndParseMeeting } from "@/lib/crawler";
import { upsertMeeting } from "@/lib/repository";

const Body = z.object({ input: z.string().min(3) });

// kms.ggc.go.kr 가 AWS Seoul 등 클라우드 IP 대역에서
// 회의록 본문을 렌더하지 않음. 프로덕션에서는 크롤이 실패하므로
// 명확한 안내를 반환한다.
const GEO_BLOCK_MSG =
  "kms.ggc.go.kr 가 클라우드 서버 IP를 차단해 회의록 본문을 가져올 수 없습니다. " +
  "로컬(한국 가정용 IP)에서 npm run crawl:recent 로 수집하시면 이 페이지에서 조회 가능합니다.";

export async function POST(req: Request) {
  try {
    const { input } = Body.parse(await req.json());
    const meeting = await fetchAndParseMeeting(input);
    if (!meeting.bodyText || meeting.bodyText.length < 200) {
      return NextResponse.json(
        { error: GEO_BLOCK_MSG, code: "geo_blocked" },
        { status: 422 }
      );
    }
    await upsertMeeting(meeting);
    return NextResponse.json({
      mntsId: meeting.mntsId,
      title: meeting.title,
      date: meeting.date,
      committee: meeting.committeeName,
      bodyLength: meeting.bodyText.length,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "unknown error" },
      { status: 500 }
    );
  }
}
