import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  // 서버에 DELETE_PIN 이 세팅돼 있을 때만 PIN 검사.
  // 로컬 dev 편의를 위해 unset 이면 검사 스킵.
  const configured = process.env.DELETE_PIN;
  if (configured) {
    const given = req.headers.get("x-delete-pin") ?? "";
    if (given !== configured) {
      return NextResponse.json(
        { error: "PIN이 일치하지 않습니다.", code: "bad_pin" },
        { status: 401 }
      );
    }
  }

  try {
    const sb = getServerClient();
    const { error } = await sb
      .from("meetings")
      .delete()
      .eq("mnts_id", params.id);
    if (error) throw error;
    return NextResponse.json({ ok: true, mntsId: params.id });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "삭제 실패" },
      { status: 500 }
    );
  }
}
