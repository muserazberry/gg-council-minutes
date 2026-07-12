import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import {
  STANDING_COMMITTEES,
  SPECIAL_COMMITTEES,
} from "@/lib/committees";
import { listRecentMeetings } from "@/lib/repository";
import AddMeetingForm from "./_components/AddMeetingForm";
import DeleteMeetingButton from "./_components/DeleteMeetingButton";
import type { Committee } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { committee?: string };
}) {
  noStore();
  const committee = searchParams.committee;
  let meetings: Awaited<ReturnType<typeof listRecentMeetings>> = [];
  let dbError: string | null = null;
  try {
    meetings = await listRecentMeetings({
      committeeCode: committee,
      limit: 50,
    });
  } catch (e: any) {
    dbError = e?.message ?? "DB 연결 실패";
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="rounded-krds border border-krds-gray-10 bg-white p-4 sm:p-5">
        <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 text-krds-gray-90">
          위원회
        </h1>
        <p className="text-xs sm:text-sm text-krds-gray-60 mb-3 sm:mb-4">
          위원회를 선택해 요약된 회의록을 확인하세요.
        </p>

        <div className="mb-2 flex flex-wrap gap-1.5 sm:gap-2">
          <Link href="/" className={chipClass(!committee)}>
            전체
          </Link>
        </div>

        <CommitteeGroup
          label="상임위원회"
          items={STANDING_COMMITTEES}
          selected={committee}
        />
        <CommitteeGroup
          label="특별위원회"
          items={SPECIAL_COMMITTEES}
          selected={committee}
        />
      </section>

      <AddMeetingForm />

      <section>
        <h2 className="text-lg sm:text-xl font-bold mb-3 text-krds-gray-90">
          최근 회의록
        </h2>
        {dbError && (
          <div
            className="rounded-krds border border-krds-danger-50 bg-krds-danger-5 p-3 text-xs sm:text-sm text-krds-danger-60 break-words"
            role="alert"
          >
            DB 연결 실패: {dbError}
            <br />
            .env 의 Supabase 키를 설정한 뒤 supabase/schema.sql 을 실행했는지
            확인해 주세요.
          </div>
        )}
        {!dbError && meetings.length === 0 && (
          <div className="rounded-krds border border-krds-gray-10 bg-white p-4 sm:p-6 text-xs sm:text-sm text-krds-gray-50">
            아직 등록된 회의록이 없습니다. 위의 입력창에서 mntsId 또는 회의록
            URL 을 추가해 주세요.
          </div>
        )}
        {meetings.length > 0 && (
          <ul className="divide-y divide-krds-gray-10 border border-krds-gray-10 rounded-krds bg-white overflow-hidden">
            {meetings.map((m) => (
              <li
                key={m.mntsId}
                className="p-3 sm:p-4 hover:bg-krds-gray-5 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <Link
                    href={`/meeting/${m.mntsId}`}
                    className="block flex-1 min-w-0"
                  >
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] sm:text-xs text-krds-gray-60 mb-1">
                      <span>{m.committeeName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{m.date || "날짜 미상"}</span>
                      {m.summarizedAt && (
                        <span className="sm:ml-auto inline-flex items-center gap-1 rounded-krds bg-krds-primary-5 text-krds-primary-60 px-2 py-0.5 font-medium">
                          요약됨
                        </span>
                      )}
                    </div>
                    <div className="text-sm sm:text-base font-medium break-keep text-krds-gray-90">
                      {m.title}
                    </div>
                  </Link>
                  <DeleteMeetingButton mntsId={m.mntsId} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function chipClass(active: boolean) {
  return `px-3 py-1.5 rounded-krds text-xs sm:text-sm border font-medium transition-colors ${
    active
      ? "bg-krds-primary-50 text-white border-krds-primary-50"
      : "bg-white text-krds-gray-70 border-krds-gray-20 hover:border-krds-primary-50 hover:text-krds-primary-60"
  }`;
}

function CommitteeGroup({
  label,
  items,
  selected,
}: {
  label: string;
  items: Committee[];
  selected?: string;
}) {
  return (
    <div className="mt-3">
      <div className="text-[11px] sm:text-xs text-krds-gray-50 mb-1.5 font-bold uppercase tracking-wide">
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {items.map((c) => (
          <Link
            key={c.code}
            href={`/?committee=${c.code}`}
            className={chipClass(selected === c.code)}
          >
            {c.shortName}
          </Link>
        ))}
      </div>
    </div>
  );
}
