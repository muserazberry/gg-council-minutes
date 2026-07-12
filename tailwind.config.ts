import type { Config } from "tailwindcss";

// KRDS 디자인 토큰을 Tailwind 네이밍으로 노출.
// 실제 값은 krds_tokens.css 의 CSS 변수 참조 — 토큰 업데이트 시 자동 반영.
const krdsColor = (name: string) => `var(--krds-color-light-${name})`;

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Pretendard GOV"',
          "Pretendard",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      colors: {
        krds: {
          primary: {
            5: krdsColor("primary-5"),
            10: krdsColor("primary-10"),
            30: krdsColor("primary-30"),
            50: krdsColor("primary-50"),
            60: krdsColor("primary-60"),
            70: krdsColor("primary-70"),
          },
          gray: {
            0: krdsColor("gray-0"),
            5: krdsColor("gray-5"),
            10: krdsColor("gray-10"),
            20: krdsColor("gray-20"),
            30: krdsColor("gray-30"),
            40: krdsColor("gray-40"),
            50: krdsColor("gray-50"),
            60: krdsColor("gray-60"),
            70: krdsColor("gray-70"),
            80: krdsColor("gray-80"),
            90: krdsColor("gray-90"),
          },
          danger: {
            5: krdsColor("danger-5"),
            50: "var(--krds-color-light-danger-50)",
            60: "var(--krds-color-light-danger-60)",
          },
        },
      },
      borderRadius: {
        krds: "4px",
      },
    },
  },
  plugins: [],
};

export default config;
