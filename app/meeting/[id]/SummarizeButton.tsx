"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SummarizeButton({ mntsId }: { mntsId: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function run() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mntsId }),
      });

      if (res.status === 504) {
        throw new Error(
          "요약 처리 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요."
        );
      }

      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        throw new Error(
          `서버 오류가 발생했습니다. (status ${res.status})`
        );
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "요약 실패");
      router.refresh();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        onClick={run}
        disabled={busy}
        className="rounded-krds bg-krds-primary-50 text-white px-4 py-2.5 text-sm font-bold hover:bg-krds-primary-60 disabled:bg-krds-gray-30 disabled:cursor-not-allowed transition-colors"
      >
        {busy ? "요약 중…" : "지금 요약하기"}
      </button>
      {err && (
        <p className="mt-2 text-sm text-krds-danger-60" role="alert">
          오류: {err}
        </p>
      )}
    </div>
  );
}
