import Anthropic from "@anthropic-ai/sdk";
import type { MeetingRaw, MeetingSummary } from "./types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = "claude-sonnet-5";
const MAX_INPUT_CHARS = 180_000; // 입력 안전 컷오프
const MAX_TOKENS = 4096;

const SYSTEM = `당신은 경기도의회 회의록을 정확하게 요약하는 보조자입니다.
반드시 record_meeting_summary 도구를 호출해 결과를 반환하고, 추측이나 외부지식은 더하지 마세요.
회의록 본문에 없는 내용은 빈 배열/빈 문자열로 비워두세요.
분량이 많은 회의는 memberStatements의 keyPoints를 인물당 최대 3개로, keyIssues의 description을 1~2문장으로 간결하게 유지하세요.`;

const SUMMARY_TOOL: Anthropic.Tool = {
  name: "record_meeting_summary",
  description: "분석한 경기도의회 회의록 요약을 구조화된 형태로 기록한다.",
  input_schema: {
    type: "object",
    properties: {
      attendees: { type: "array", items: { type: "string" }, description: "출석 의원 이름" },
      absentees: { type: "array", items: { type: "string" }, description: "불참 의원 이름 (확인 가능한 경우만)" },
      agendaItems: { type: "array", items: { type: "string" }, description: "안건 목록" },
      memberStatements: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            role: { type: "string", description: "위원장|간사|위원 등" },
            party: { type: "string", description: "정당(있으면)" },
            keyPoints: { type: "array", items: { type: "string" } },
          },
          required: ["name", "keyPoints"],
        },
      },
      keyIssues: {
        type: "array",
        items: {
          type: "object",
          properties: {
            topic: { type: "string" },
            description: { type: "string" },
          },
          required: ["topic", "description"],
        },
      },
      decisions: { type: "array", items: { type: "string" }, description: "가결/부결/계류 등 의결 결과" },
      upcomingSchedule: { type: "array", items: { type: "string" }, description: "향후 일정 (소위·간담회·차기 회의 등)" },
      overallSummary: { type: "string", description: "회의 전체를 3~5문장으로 요약" },
    },
    required: [
      "attendees",
      "agendaItems",
      "memberStatements",
      "keyIssues",
      "decisions",
      "upcomingSchedule",
      "overallSummary",
    ],
  },
};

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

위 회의록을 분석해 record_meeting_summary 도구를 호출해 한국어로 요약해 주세요.`;

  const res = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: SYSTEM,
    tools: [SUMMARY_TOOL],
    tool_choice: { type: "tool", name: "record_meeting_summary" },
    messages: [{ role: "user", content: userMsg }],
  });

  if (res.stop_reason === "max_tokens") {
    throw new Error(
      `AI 응답이 최대 토큰(${MAX_TOKENS})을 초과해 잘렸습니다. 회의록 분량이 너무 많습니다.`
    );
  }

  const toolUse = res.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
  );
  if (!toolUse) {
    throw new Error("AI 응답에서 요약 결과를 찾지 못했습니다.");
  }

  const summary = normalizeSummary(toolUse.input);

  return {
    summary,
    inputTokens: res.usage?.input_tokens,
    outputTokens: res.usage?.output_tokens,
  };
}

function normalizeSummary(obj: any): MeetingSummary {
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
