import type { Committee } from "./types";

export const COMMITTEES: Committee[] = [
  { code: "C001",  name: "의회운영위원회",        shortName: "의회운영" },
  { code: "C105",  name: "기획재정위원회",        shortName: "기획재정" },
  { code: "C205",  name: "경제노동위원회",        shortName: "경제노동" },
  { code: "C301",  name: "안전행정위원회",        shortName: "안전행정" },
  { code: "C501",  name: "문화체육관광위원회",    shortName: "문화체육관광" },
  { code: "C601",  name: "농정해양위원회",        shortName: "농정해양" },
  { code: "C701",  name: "보건복지위원회",        shortName: "보건복지" },
  { code: "C807",  name: "건설교통위원회",        shortName: "건설교통" },
  { code: "C901",  name: "도시환경위원회",        shortName: "도시환경" },
  { code: "C9043", name: "미래과학협력위원회",    shortName: "미래과학협력" },
  { code: "C905",  name: "여성가족평생교육위원회", shortName: "여성가족평생교육" },
  { code: "C908",  name: "교육기획위원회",        shortName: "교육기획" },
  { code: "C909",  name: "교육행정위원회",        shortName: "교육행정" },
];

export const COMMITTEE_BY_CODE = Object.fromEntries(
  COMMITTEES.map((c) => [c.code, c])
) as Record<string, Committee>;

export const KMS_BASE = "https://kms.ggc.go.kr";
export const CURRENT_DAESU = "11";
