export type CommitteeCode =
  | "C001" | "C105" | "C205" | "C301" | "C501" | "C601"
  | "C701" | "C807" | "C901" | "C9043" | "C905" | "C908" | "C909";

export interface Committee {
  code: CommitteeCode;
  name: string;
  shortName: string;
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
