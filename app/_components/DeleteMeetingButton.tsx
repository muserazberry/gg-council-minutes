"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  mntsId: string;
  /** 텍스트 라벨. 생략하면 아이콘만 (목록용) */
  label?: string;
  /** 삭제 성공 시 이동할 경로. 생략하면 현재 페이지 refresh (목록용) */
  redirectTo?: string;
}

export default function DeleteMeetingButton({
  mntsId,
  label,
  redirectTo,
}: Props) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function handleClick(e: React.MouseEvent) {
    // 부모 <Link> 클릭 방지
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm("이 회의록 요약을 삭제할까요? 되돌릴 수 없습니다.")) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/meetings/${mntsId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "삭제 실패");
      if (redirectTo) {
        router.push(redirectTo);
      }
      router.refresh();
    } catch (err: any) {
      window.alert(`삭제 실패: ${err.message}`);
    } finally {
      setBusy(false);
    }
  }

  const iconOnly = !label;
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-label={label ?? "회의록 삭제"}
      title="삭제"
      className={
        iconOnly
          ? "shrink-0 rounded p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-40"
          : "inline-flex items-center gap-1.5 rounded border border-red-200 bg-white px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-40"
      }
    >
      <svg
        width={iconOnly ? 16 : 15}
        height={iconOnly ? 16 : 15}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1.5 14a2 2 0 0 1-2 2H8.5a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      </svg>
      {label && <span>{busy ? "삭제 중…" : label}</span>}
    </button>
  );
}
