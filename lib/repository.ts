import { getServerClient } from "./supabase";
import type { MeetingRaw, MeetingRecord, MeetingSummary } from "./types";

export async function upsertMeeting(m: MeetingRaw): Promise<void> {
  const sb = getServerClient();
  const { error } = await sb.from("meetings").upsert(
    {
      mnts_id: m.mntsId,
      committee_code: m.committeeCode,
      committee_name: m.committeeName,
      session: m.session,
      round: m.round,
      meeting_date: m.date || null,
      title: m.title,
      body_text: m.bodyText,
      video_url: m.videoUrl ?? null,
      source_url: m.sourceUrl,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "mnts_id" }
  );
  if (error) throw error;
}

export async function saveSummary(
  mntsId: string,
  summary: MeetingSummary
): Promise<void> {
  const sb = getServerClient();
  const { error } = await sb
    .from("meetings")
    .update({
      summary,
      summarized_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("mnts_id", mntsId);
  if (error) throw error;
}

export async function getMeeting(mntsId: string): Promise<MeetingRecord | null> {
  const sb = getServerClient();
  const { data, error } = await sb
    .from("meetings")
    .select("*")
    .eq("mnts_id", mntsId)
    .maybeSingle();
  if (error) throw error;
  return data ? toRecord(data) : null;
}

export async function listRecentMeetings(opts: {
  committeeCode?: string;
  limit?: number;
}): Promise<MeetingRecord[]> {
  const sb = getServerClient();
  let q = sb
    .from("meetings")
    .select("*")
    .order("meeting_date", { ascending: false })
    .limit(opts.limit ?? 50);
  if (opts.committeeCode) q = q.eq("committee_code", opts.committeeCode);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(toRecord);
}

function toRecord(row: any): MeetingRecord {
  return {
    mntsId: row.mnts_id,
    committeeCode: row.committee_code,
    committeeName: row.committee_name,
    session: row.session ?? "",
    round: row.round ?? "",
    date: row.meeting_date ?? "",
    title: row.title,
    bodyText: row.body_text ?? "",
    videoUrl: row.video_url ?? undefined,
    sourceUrl: row.source_url,
    summary: row.summary ?? undefined,
    summarizedAt: row.summarized_at ?? undefined,
  };
}
