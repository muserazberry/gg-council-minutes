import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { COMMITTEES } from "@/lib/committees";
import { listRecentMeetings } from "@/lib/repository";
import AddMeetingForm from "./_components/AddMeetingForm";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { committee?: string };
}) {
  noStore(); // 새 회의록 추가 후 즉시 반영되도록 캐시 완전 무효화
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
      <section>
        <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
          상임위원회
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
          상임위를 선택해 요약된 회의록을 확인하세요.
        </p>
        {/* 모바일에서 좌우 스크롤 대신 wrap. 칩 폰트/패딩 축소. */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <Link
            href="/"
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm border ${
              !committee
                ? "bg-black text-white border-black"
                : "bg-white text-gray-700"
            }`}
          >
            전체
          </Link>
          {COMMITTEES.map((c) => (
            <Link
              key={c.code}
              href={`/?committee=${c.code}`}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm border ${
                committee === c.code
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700"
              }`}
            >
              {c.shortName}
            </Link>
          ))}
        </div>
      </section>

      <AddMeetingForm />

      <section>
        <h2 className="text-lg sm:text-xl font-semibold mb-3">최근 회의록</h2>
        {dbError && (
          <div className="rounded border border-amber-300 bg-amber-50 p-3 text-xs sm:text-sm text-amber-800 break-words">
            DB 연결 실패: {dbError}
            <br />
            .env 의 Supabase 키를 설정한 뒤 supabase/schema.sql 을 실행했는지
            확인해 주세요.
          </div>
        )}
        {!dbError && meetings.length === 0 && (
          <div className="rounded border bg-white p-4 sm:p-6 text-xs sm:text-sm text-gray-500">
            아직 등록된 회의록이 없습니다. 위의 입력창에서 mntsId 또는 회의록
            URL 을 추가해 주세요.
          </div>
        )}
        {meetings.length > 0 && (
          <ul className="divide-y border rounded bg-white">
            {meetings.map((m) => (
              <li key={m.mntsId} className="p-3 sm:p-4 hover:bg-gray-50">
                <Link href={`/meeting/${m.mntsId}`} className="block">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] sm:text-xs text-gray-500 mb-1">
                    <span>{m.committeeName}</span>
                    <span>·</span>
                    <span>{m.date || "날짜 미상"}</span>
                    {m.summarizedAt && (
                      <span className="sm:ml-auto text-green-700 font-medium">
                        요약됨
                      </span>
                    )}
                  </div>
                  <div className="text-sm sm:text-base font-medium break-keep">
                    {m.title}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
