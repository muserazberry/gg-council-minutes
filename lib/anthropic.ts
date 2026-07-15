import Anthropic from "@anthropic-ai/sdk";
import type { MeetingRaw, MeetingSummary } from "./types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = "claude-sonnet-5";
const MAX_INPUT_CHARS = 180_000; // 입력 안전 컷오프

const SYSTEM = `당신은 경기도의회 회의록을 정확하게 요약하는 보조자입니다.
출력은 반드시 지정된 JSON 스키마 그대로만 반환하고, 추측이나 외부지식은 더하지 마세요.
회의록 본문에 없는 내용은 빈 배열/빈 문자열로 비워두세요.`;

const SCHEMA_HINT = `{
  "attendees": ["출석 의원 이름 …"],
  "absentees": ["불참 의원 이름 (확인 가능한 경우만)"],
  "agendaItems": ["안건 1", "안건 2"],
  "memberStatements": [
    { "name": "의원명", "role": "위원장|간사|위원 등", "party": "정당(있으면)", "keyPoints": ["핵심 발언 1", "핵심 발언 2"] }
  ],
  "keyIssues": [
    { "topic": "쟁점 제목", "description": "쟁점 내용 한 문단" }
  ],
  "decisions": ["가결/부결/계류 등 의결 결과"],
  "upcomingSchedule": ["향후 일정 (소위·간담회·차기 회의 등)"],
  "overallSummary": "회의 전체를 3~5문장으로 요약"
}`;

export async function summarizeMeeting(meeting: MeetingRaw): Promise<{
  summary: MeetingSummary;
  inputTokens?: number;
  outputTokens?: number;
}> {
  const body = meeting.bodyText.slice(0, MAX_INPUT_CHARS);

  const userMsg = `다음은 경기도의회 ${meeting.committeeName} 회의록입니다.
회의명: ${meeting.title}
회의 일자: ${meeting.date || "(미상)"}

[회의록 본문]
${body}

위 회의록을 분석해 아래 JSON 스키마에 맞춰 한국어로 요약해 주세요.
반드시 JSON 객체만 출력하고 다른 설명은 붙이지 마세요.

스키마:
${SCHEMA_HINT}`;

  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM,
    messages: [{ role: "user", content: userMsg }],
  });

  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  const summary = parseJsonLoose(text);

  return {
    summary,
    inputTokens: res.usage?.input_tokens,
    outputTokens: res.usage?.output_tokens,
  };
}

function parseJsonLoose(s: string): MeetingSummary {
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("AI 응답에서 JSON 못 찾음");
  const slice = s.slice(start, end + 1);
  const obj = JSON.parse(slice);
  return {
    attendees: obj.attendees ?? [],
    absentees: obj.absentees ?? [],
    agendaItems: obj.agendaItems ?? [],
    memberStatements: obj.memberStatements ?? [],
    keyIssues: obj.keyIssues ?? [],
    decisions: obj.decisions ?? [],
    upcomingSchedule: obj.upcomingSchedule ?? [],
    overallSummary: obj.overallSummary ?? "",
  };
}
