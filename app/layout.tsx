import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "경기도의회 회의록 요약",
  description: "경기도의회 상임위 회의록을 AI로 요약 정리합니다.",
};

// 모바일 사파리 확대 방지 + 노치 대응
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen font-sans antialiased text-[15px] sm:text-base">
        <header className="border-b bg-white sticky top-0 z-10">
          <div className="mx-auto max-w-5xl px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
            <a href="/" className="text-base sm:text-lg font-semibold truncate">
              경기도의회 회의록 요약
            </a>
            <nav className="text-xs sm:text-sm text-gray-600 shrink-0">
              <a
                href="https://kms.ggc.go.kr"
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                원본 ↗
              </a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-5 sm:py-8">{children}</main>
      </body>
    </html>
  );
}
