"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  mntsId: string;
  label?: string;
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
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm("이 회의록 요약을 삭제할까요? 되돌릴 수 없습니다.")) {
      return;
    }

    let pin = sessionStorage.getItem("delete_pin") ?? "";
    if (!pin) {
      pin = window.prompt("삭제 PIN 을 입력하세요") ?? "";
      if (!pin) return;
      sessionStorage.setItem("delete_pin", pin);
    }

    setBusy(true);
    try {
      const res = await fetch(`/api/meetings/${mntsId}`, {
        method: "DELETE",
        headers: { "X-Delete-Pin": pin },
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        sessionStorage.removeItem("delete_pin");
        throw new Error("PIN 이 틀렸습니다. 다시 시도해 주세요.");
      }
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
          ? "shrink-0 rounded-krds p-1.5 text-krds-gray-40 hover:text-krds-danger-60 hover:bg-krds-danger-5 disabled:opacity-40 transition-colors"
          : "inline-flex items-center gap-1.5 rounded-krds border border-krds-danger-50 bg-white px-4 py-2 text-sm text-krds-danger-60 font-medium hover:bg-krds-danger-5 disabled:opacity-40 transition-colors"
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
