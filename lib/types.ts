export type CommitteeCode =
  // 상임위원회
  | "C001" | "C105" | "C205" | "C301" | "C501" | "C601"
  | "C701" | "C807" | "C901" | "C9043" | "C905" | "C908" | "C909"
  // 특별위원회
  | "E001" | "E002";

export type CommitteeKind = "standing" | "special";

export interface Committee {
  code: CommitteeCode;
  name: string;      // 회의록 제목 안에 그대로 등장하는 표기 (매칭용)
  shortName: string; // 칩에 표시할 짧은 이름
  kind: CommitteeKind;
}

export interface MeetingRaw {
  mntsId: string;
  committeeCode: CommitteeCode;
  committeeName: string;
  session: string;
  round: string;
  date: string;
  title: string;
  bodyText: string;
  videoUrl?: string;
  sourceUrl: string;
}

export interface MemberStatement {
  name: string;
  role?: string;
  party?: string;
  keyPoints: string[];
}

export interface MeetingSummary {
  attendees: string[];
  absentees?: string[];
  agendaItems: string[];
  memberStatements: MemberStatement[];
  keyIssues: Array<{ topic: string; description: string }>;
  decisions: string[];
  upcomingSchedule: string[];
  overallSummary: string;
}

export interface MeetingRecord extends MeetingRaw {
  summary?: MeetingSummary;
  summarizedAt?: string;
}
