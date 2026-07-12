"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddMeetingForm() {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErrorCode(null);
    setBusy(true);
    try {
      const crawlRes = await fetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const crawl = await crawlRes.json();
      if (!crawlRes.ok) {
        if (crawl.code) setErrorCode(crawl.code);
        throw new Error(crawl.error ?? "크롤링 실패");
      }

      setMsg(`회의록 가져옴: ${crawl.title} (요약 진행 중…)`);

      const sumRes = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mntsId: crawl.mntsId }),
      });
      const sum = await sumRes.json();
      if (!sumRes.ok) throw new Error(sum.error ?? "요약 실패");

      setMsg("요약 완료. 상세 페이지로 이동합니다.");
      router.push(`/meeting/${crawl.mntsId}`);
      router.refresh();
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-krds border border-krds-gray-10 bg-white p-4 sm:p-5">
      <h2 className="text-base sm:text-lg font-bold mb-1 sm:mb-2 text-krds-gray-90">
        회의록 추가
      </h2>
      <p className="text-xs sm:text-sm text-krds-gray-60 mb-3">
        <a
          href="https://kms.ggc.go.kr/svc/cms/mnts/MntsLatelyList.do"
          target="_blank"
          rel="noreferrer"
          className="text-krds-primary-60 hover:text-krds-primary-70 hover:underline font-medium"
        >
          경기도의회 회의록 ↗
        </a>
        <span className="ml-1">
          에서 뷰어 URL 또는 <code className="text-krds-gray-80">mntsId</code>{" "}
          값을 복사해 붙여넣으세요.
        </span>
      </p>
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2">
        <label htmlFor="meeting-input" className="sr-only">
          회의록 URL 또는 mntsId
        </label>
        <input
          id="meeting-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="URL 또는 mntsId"
          inputMode="url"
          autoComplete="off"
          className="flex-1 border border-krds-gray-20 rounded-krds px-3 py-2.5 text-base sm:text-sm bg-white focus:border-krds-primary-50 focus:ring-2 focus:ring-krds-primary-10 outline-none"
          required
        />
        <button
          type="submit"
          disabled={busy || !input}
          className="rounded-krds bg-krds-primary-50 text-white px-4 py-2.5 text-sm font-bold hover:bg-krds-primary-60 disabled:bg-krds-gray-30 disabled:cursor-not-allowed transition-colors"
        >
          {busy ? "처리 중…" : "가져와서 요약"}
        </button>
      </form>
      {msg && (
        <div
          className={`mt-3 rounded-krds p-3 text-xs sm:text-sm break-words ${
            errorCode
              ? "border border-krds-danger-50 bg-krds-danger-5 text-krds-danger-60"
              : "text-krds-gray-70"
          }`}
          role={errorCode ? "alert" : undefined}
        >
          {msg}
          {errorCode === "geo_blocked" && (
            <div className="mt-2 text-[11px] sm:text-xs">
              💡 로컬 PC(한국 가정용 IP)에서 다음 명령 실행:
              <pre className="mt-1 rounded-krds bg-white px-2 py-1 overflow-x-auto text-krds-gray-80 border border-krds-gray-10">
{`cd gg-council-minutes
npm run crawl:recent`}
              </pre>
              수집된 회의록은 이 페이지에도 자동 표시됩니다.
            </div>
          )}
        </div>
      )}
    </section>
  );
}
