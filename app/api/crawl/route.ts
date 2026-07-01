import { NextResponse } from "next/server";
import { z } from "zod";
import { fetchAndParseMeeting } from "@/lib/crawler";
import { upsertMeeting } from "@/lib/repository";

const Body = z.object({ input: z.string().min(3) });

export async function POST(req: Request) {
  try {
    const { input } = Body.parse(await req.json());
    const meeting = await fetchAndParseMeeting(input);
    if (!meeting.bodyText || meeting.bodyText.length < 200) {
      return NextResponse.json(
        { error: "회의록 본문이 비어있음. mntsId가 정확한지 확인해 주세요." },
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
