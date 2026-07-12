import Link from "next/link";
import { notFound } from "next/navigation";
import { getMeeting } from "@/lib/repository";
import SummarizeButton from "./SummarizeButton";
import DeleteMeetingButton from "@/app/_components/DeleteMeetingButton";

export const dynamic = "force-dynamic";

export default async function MeetingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const meeting = await getMeeting(params.id).catch(() => null);
  if (!meeting) notFound();

  const s = meeting.summary;

  return (
    <article className="space-y-5 sm:space-y-6">
      <header className="rounded-krds border border-krds-gray-10 bg-white p-4 sm:p-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs sm:text-sm text-krds-gray-60 hover:text-krds-primary-60 hover:underline"
        >
          <span aria-hidden="true">←</span> 목록으로
        </Link>
        <h1 className="text-lg sm:text-2xl font-bold mt-2 break-keep leading-snug text-krds-gray-90">
          {meeting.title}
        </h1>
        <div className="text-xs sm:text-sm text-krds-gray-60 mt-3 flex flex-wrap gap-x-2 sm:gap-x-3 gap-y-1 items-center">
          <span className="inline-flex items-center rounded-krds bg-krds-primary-5 text-krds-primary-60 px-2 py-0.5 font-medium">
            {meeting.committeeName}
          </span>
          <span>{meeting.date || "날짜 미상"}</span>
          {meeting.session && <span>제{meeting.session}회</span>}
          {meeting.round && <span>제{meeting.round}차</span>}
          <a
            className="text-krds-primary-60 hover:text-krds-primary-70 hover:underline sm:ml-auto font-medium"
            href={meeting.sourceUrl}
            target="_blank"
            rel="noreferrer"
          >
            원본 회의록 ↗
          </a>
        </div>
      </header>

      {!s && (
        <section className="rounded-krds border border-krds-gray-10 bg-white p-4 sm:p-5">
          <p className="text-sm text-krds-gray-70 mb-3">
            아직 요약되지 않은 회의록입니다.
          </p>
          <SummarizeButton mntsId={meeting.mntsId} />
        </section>
      )}

      {s && (
        <>
          <Section title="전체 요약">
            <p className="leading-relaxed whitespace-pre-line">
              {s.overallSummary}
            </p>
          </Section>

          <Section title={`출석 의원 (${s.attendees.length}명)`}>
            <p className="text-sm">{s.attendees.join(", ") || "—"}</p>
            {s.absentees && s.absentees.length > 0 && (
              <p className="text-sm text-krds-gray-60 mt-2">
                불참: {s.absentees.join(", ")}
              </p>
            )}
          </Section>

          <Section title="안건">
            <ol className="list-decimal pl-5 space-y-1 text-sm">
              {s.agendaItems.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ol>
          </Section>

          <Section title="의원별 핵심 발언">
            <ul className="space-y-3">
              {s.memberStatements.map((ms, i) => (
                <li
                  key={i}
                  className="border border-krds-gray-10 rounded-krds p-3 bg-krds-gray-5"
                >
                  <div className="text-sm font-bold flex flex-wrap gap-x-2 text-krds-gray-90">
                    <span>{ms.name}</span>
                    {ms.role && (
                      <span className="text-krds-gray-60 font-medium">
                        ({ms.role})
                      </span>
                    )}
                    {ms.party && (
                      <span className="text-krds-gray-50 font-normal">
                        · {ms.party}
                      </span>
                    )}
                  </div>
                  <ul className="list-disc pl-5 mt-1.5 text-sm text-krds-gray-80 space-y-0.5 break-keep">
                    {ms.keyPoints.map((k, j) => (
                      <li key={j}>{k}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="쟁점">
            <ul className="space-y-3">
              {s.keyIssues.map((k, i) => (
                <li
                  key={i}
                  className="border-l-4 border-krds-primary-50 pl-3 py-0.5"
                >
                  <div className="font-bold text-sm text-krds-gray-90">
                    {k.topic}
                  </div>
                  <div className="text-sm text-krds-gray-70 mt-1">
                    {k.description}
                  </div>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="의결 결과">
            <ul className="list-disc pl-5 text-sm space-y-1">
              {s.decisions.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </Section>

          <Section title="향후 일정">
            <ul className="list-disc pl-5 text-sm space-y-1">
              {s.upcomingSchedule.map((u, i) => (
                <li key={i}>{u}</li>
              ))}
            </ul>
          </Section>
        </>
      )}

      <div className="pt-2 flex justify-end">
        <DeleteMeetingButton
          mntsId={meeting.mntsId}
          label="이 회의록 삭제"
          redirectTo="/"
        />
      </div>
    </article>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-krds border border-krds-gray-10 bg-white p-4 sm:p-5">
      <h2 className="font-bold mb-3 text-sm sm:text-base text-krds-gray-90 pb-2 border-b border-krds-gray-10">
        {title}
      </h2>
      <div className="text-sm break-keep text-krds-gray-80">{children}</div>
    </section>
  );
}
