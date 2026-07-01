import { NextResponse } from "next/server";
import { z } from "zod";
import { summarizeMeeting } from "@/lib/anthropic";
import { getMeeting, saveSummary } from "@/lib/repository";

const Body = z.object({ mntsId: z.string().min(3) });

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { mntsId } = Body.parse(await req.json());
    const meeting = await getMeeting(mntsId);
    if (!meeting) {
      return NextResponse.json(
        { error: "회의록을 먼저 /api/crawl 로 가져와 주세요." },
        { status: 404 }
      );
    }
    const { summary, inputTokens, outputTokens } = await summarizeMeeting(
      meeting
    );
    await saveSummary(mntsId, summary);
    return NextResponse.json({ mntsId, summary, inputTokens, outputTokens });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "unknown error" },
      { status: 500 }
    );
  }
}
