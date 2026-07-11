import type { Committee } from "./types";

export const STANDING_COMMITTEES: Committee[] = [
  { code: "C001",  name: "의회운영위원회",        shortName: "의회운영",         kind: "standing" },
  { code: "C105",  name: "기획재정위원회",        shortName: "기획재정",         kind: "standing" },
  { code: "C205",  name: "경제노동위원회",        shortName: "경제노동",         kind: "standing" },
  { code: "C301",  name: "안전행정위원회",        shortName: "안전행정",         kind: "standing" },
  { code: "C501",  name: "문화체육관광위원회",    shortName: "문화체육관광",     kind: "standing" },
  { code: "C601",  name: "농정해양위원회",        shortName: "농정해양",         kind: "standing" },
  { code: "C701",  name: "보건복지위원회",        shortName: "보건복지",         kind: "standing" },
  { code: "C807",  name: "건설교통위원회",        shortName: "건설교통",         kind: "standing" },
  { code: "C901",  name: "도시환경위원회",        shortName: "도시환경",         kind: "standing" },
  { code: "C9043", name: "미래과학협력위원회",    shortName: "미래과학협력",     kind: "standing" },
  { code: "C905",  name: "여성가족평생교육위원회", shortName: "여성가족평생교육", kind: "standing" },
  { code: "C908",  name: "교육기획위원회",        shortName: "교육기획",         kind: "standing" },
  { code: "C909",  name: "교육행정위원회",        shortName: "교육행정",         kind: "standing" },
];

// 회의록 타이틀은 "…경기도청예산결산특별위원회" 처럼 공백 없이 붙어 있어
// name 은 그대로 이어쓴 형태를 사용한다.
export const SPECIAL_COMMITTEES: Committee[] = [
  { code: "E001", name: "경기도청예산결산특별위원회",   shortName: "도청 예산결산",   kind: "special" },
  { code: "E002", name: "경기도교육청예산결산특별위원회", shortName: "도교육청 예산결산", kind: "special" },
];

export const COMMITTEES: Committee[] = [
  ...STANDING_COMMITTEES,
  ...SPECIAL_COMMITTEES,
];

export const COMMITTEE_BY_CODE = Object.fromEntries(
  COMMITTEES.map((c) => [c.code, c])
) as Record<string, Committee>;

export const KMS_BASE = "https://kms.ggc.go.kr";
export const CURRENT_DAESU = "11";
