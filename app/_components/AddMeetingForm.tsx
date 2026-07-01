"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddMeetingForm() {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      const crawlRes = await fetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const crawl = await crawlRes.json();
      if (!crawlRes.ok) throw new Error(crawl.error ?? "크롤링 실패");

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
      setMsg(`오류: ${e.message}`);
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
        kms.ggc.go.kr 뷰어 URL 또는 <code>mntsId</code> 값을 붙여넣으세요.
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
        <p className="mt-3 text-xs sm:text-sm text-gray-700 break-words">
          {msg}
        </p>
      )}
    </section>
  );
}
