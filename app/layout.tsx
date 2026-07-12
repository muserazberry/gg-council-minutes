import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "경기도의회 회의록 요약",
  description: "경기도의회 상임위 회의록을 AI로 요약 정리합니다.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#256ef4",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen font-sans antialiased text-[15px] sm:text-base text-krds-gray-90">
        {/* KRDS 정부서비스 헤더 패턴: 상단 컬러 바 + 흰색 네비 */}
        <div className="h-1 bg-krds-primary-50" aria-hidden="true" />
        <header className="border-b border-krds-gray-10 bg-white sticky top-1 z-10">
          <div className="mx-auto max-w-5xl px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
            <a
              href="/"
              className="flex items-center gap-2 font-bold text-krds-gray-90 truncate"
            >
              <span
                className="inline-block w-6 h-6 sm:w-7 sm:h-7 rounded-krds bg-krds-primary-50 text-white text-xs sm:text-sm flex items-center justify-center font-bold shrink-0"
                aria-hidden="true"
              >
                경
              </span>
              <span className="text-sm sm:text-lg truncate">
                경기도의회 회의록 요약
              </span>
            </a>
            <nav className="text-xs sm:text-sm text-krds-gray-60 shrink-0">
              <a
                href="https://kms.ggc.go.kr"
                target="_blank"
                rel="noreferrer"
                className="text-krds-primary-60 hover:text-krds-primary-70 hover:underline"
              >
                원본 ↗
              </a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-5 sm:py-8">{children}</main>
        <footer className="mx-auto max-w-5xl px-4 py-6 text-[11px] sm:text-xs text-krds-gray-50">
          경기도의회 공식 서비스가 아닙니다. 원본 회의록은{" "}
          <a
            href="https://kms.ggc.go.kr"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-krds-primary-60"
          >
            kms.ggc.go.kr
          </a>{" "}
          에서 확인하세요. 요약은 AI가 생성한 것으로 오차가 있을 수 있습니다.
        </footer>
      </body>
    </html>
  );
}
