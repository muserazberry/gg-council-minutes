import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
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
