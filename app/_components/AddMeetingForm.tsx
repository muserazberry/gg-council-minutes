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
    <section className="rounded-lg border bg-white p-3 sm:p-4">
      <h2 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">
        회의록 추가
      </h2>
      <p className="text-xs sm:text-sm text-gray-600 mb-3">
        <a
          href="https://kms.ggc.go.kr/svc/cms/mnts/MntsLatelyList.do"
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 hover:underline font-medium"
        >
          경기도의회 회의록 ↗
        </a>
        <span className="ml-1">
          에서 뷰어 URL 또는 <code>mntsId</code> 값을 복사해 붙여넣으세요.
        </span>
      </p>
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="URL 또는 mntsId"
          inputMode="url"
          autoComplete="off"
          // iOS Safari 확대 방지: 16px 이상
          className="flex-1 border rounded px-3 py-2 text-base sm:text-sm"
          required
        />
        <button
          type="submit"
          disabled={busy || !input}
          className="rounded bg-black text-white px-4 py-2.5 sm:py-2 text-sm font-medium disabled:opacity-50"
        >
          {busy ? "처리 중…" : "가져와서 요약"}
        </button>
      </form>
      {msg && (
        <div
          className={`mt-3 rounded p-3 text-xs sm:text-sm break-words ${
            errorCode
              ? "border border-amber-300 bg-amber-50 text-amber-900"
              : "text-gray-700"
          }`}
        >
          {msg}
          {errorCode === "geo_blocked" && (
            <div className="mt-2 text-[11px] sm:text-xs text-amber-800">
              💡 로컬 PC(한국 가정용 IP)에서 다음 명령 실행:
              <pre className="mt-1 rounded bg-white/60 px-2 py-1 overflow-x-auto">
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
