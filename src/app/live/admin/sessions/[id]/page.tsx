import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { PrintButton } from "@/components/live/PrintButton";

export const metadata = { title: "Session log", robots: { index: false } };
export const dynamic = "force-dynamic";

const TZ = "Africa/Nairobi";
const dt = (d: Date) => d.toLocaleString("en-GB", { timeZone: TZ, day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
const time = (d: Date) => d.toLocaleTimeString("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
const mins = (ms: number) => {
  const m = Math.round(ms / 60000);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60} min`;
};
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

/** Detailed log of one lecture session, built entirely from records stored by AI254 LIVE. */
export default async function SessionLogPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/live/login?role=admin");
  const { id } = await params;
  const s = await prisma.lectureSession.findUnique({
    where: { id },
    include: {
      lecturer: { select: { name: true, staffCode: true, email: true } },
      participants: { orderBy: { joinedAt: "asc" } },
      questions: { orderBy: { createdAt: "asc" } },
      segments: { orderBy: { seq: "asc" } },
    },
  });
  if (!s) notFound();
  const sysEvents = await prisma.systemLog.findMany({ where: { sessionId: id }, orderBy: { createdAt: "asc" } });

  const translated = s.segments.filter((x) => x.kiswahili);
  const wordsTranslated = translated.reduce((n, x) => n + words(x.english), 0);
  const end = s.endedAt ?? new Date();
  const recorded = s.startedAt ? end.getTime() - s.startedAt.getTime() : 0;
  const asr = s.segments.filter((x) => x.asrMs != null);
  const tr = s.segments.filter((x) => x.translateMs != null);
  const avg = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null);
  const avgAsr = avg(asr.map((x) => x.asrMs!));
  const avgTr = avg(tr.map((x) => x.translateMs!));

  type Ev = { at: Date; kind: string; text: string };
  const events: Ev[] = [{ at: s.createdAt, kind: "Session", text: `Session created (code ${s.code})` }];
  if (s.startedAt) events.push({ at: s.startedAt, kind: "Session", text: "Class in session" });
  const label: Record<string, string> = {
    pause: "Lecturer paused the session",
    resume: "Lecturer resumed the session",
    "mic-on": "Lecturer microphone switched on",
    "mic-off": "Lecturer microphone switched off",
    "student-mic-on": "Student microphones allowed",
    "student-mic-off": "Student microphones turned off",
  };
  for (const e of sysEvents) {
    const action = e.source === "session" ? e.message.split(" ").pop() ?? "" : "";
    if (label[action]) events.push({ at: e.createdAt, kind: "Session", text: label[action] });
  }
  for (const p of s.participants) {
    events.push({ at: p.joinedAt, kind: "Student", text: `${p.admissionNumber} joined${p.university ? ` · ${p.university}` : ""}` });
    if (p.leftAt) events.push({ at: p.leftAt, kind: "Student", text: `${p.admissionNumber} left` });
  }
  for (const q of s.questions) events.push({ at: q.createdAt, kind: "Question", text: `${q.admissionNumber} asked (${q.language === "sw" ? "Kiswahili" : "English"}): “${q.text}”` });
  if (s.segments.length) {
    events.push({ at: s.segments[0].createdAt, kind: "Translation", text: "First statement transcribed and translated" });
    events.push({ at: s.segments[s.segments.length - 1].createdAt, kind: "Translation", text: `Last statement (#${s.segments[s.segments.length - 1].seq})` });
  }
  for (const e of sysEvents) if (e.level === "ERROR") events.push({ at: e.createdAt, kind: "Error", text: e.message });
  if (s.endedAt) events.push({ at: s.endedAt, kind: "Session", text: "Class ended" });
  events.sort((a, b) => a.at.getTime() - b.at.getTime());
  const dedup = events;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link href="/live/admin?tab=sessions" className="text-sm text-slate-500 hover:text-cyan-300 print:hidden">← All sessions</Link>
      <article className="print-light mt-4 space-y-6">
        <header className="card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Session log</p>
              <h1 className="mt-1 text-2xl font-bold">{s.courseCode} · {s.title}</h1>
              <p className="mt-1 text-sm text-slate-600">
                {s.subject} · Session code <span className="font-mono">{s.code}</span> · Status {s.status}
                {s.mode === "DEMO" && <span className="demo-badge ml-2">Demonstration session</span>}
              </p>
            </div>
            <PrintButton />
          </div>
          <dl className="mt-6 grid gap-px overflow-hidden rounded-xl bg-slate-200 sm:grid-cols-3">
            <Cell k="Class in session" v={s.startedAt ? dt(s.startedAt) : "Not started"} />
            <Cell k="Class ended" v={s.endedAt ? dt(s.endedAt) : s.startedAt ? "In progress" : "—"} />
            <Cell k="Class record time" v={s.startedAt ? `${mins(recorded)}${s.endedAt ? "" : " so far"}` : "—"} />
            <Cell k="Lecturer" v={s.lecturer ? `${s.lecturer.staffCode ? `${s.lecturer.staffCode} – ` : ""}${s.lecturer.name}` : "Public demonstration"} />
            <Cell k="Words translated" v={wordsTranslated.toLocaleString()} sub={`${translated.length} of ${s.segments.length} statements translated`} />
            <Cell k="Students / questions" v={`${s.participants.length} joined · ${s.questions.length} questions`} sub={`${s.questions.filter((q) => q.answered).length} marked answered`} />
          </dl>
          {(avgAsr != null || avgTr != null) && (
            <p className="mt-3 text-xs text-slate-500">
              Average processing time reported by the services: speech recognition {avgAsr ?? "—"} ms · translation {avgTr ?? "—"} ms
            </p>
          )}
        </header>

        <Block title={`Students (${s.participants.length})`}>
          {s.participants.length === 0 ? (
            <Empty>No students joined this session.</Empty>
          ) : (
            <Table head={["Admission no.", "University", "Joined", "Left", "Time in class"]}>
              {s.participants.map((p) => (
                <tr key={p.id}>
                  <td className="px-3 py-2 font-mono">{p.admissionNumber}</td>
                  <td className="px-3 py-2">{p.university ?? "—"}</td>
                  <td className="whitespace-nowrap px-3 py-2">{time(p.joinedAt)}</td>
                  <td className="whitespace-nowrap px-3 py-2">{p.leftAt ? time(p.leftAt) : "—"}</td>
                  <td className="px-3 py-2">{mins((p.leftAt ?? s.endedAt ?? p.lastSeenAt).getTime() - p.joinedAt.getTime())}</td>
                </tr>
              ))}
            </Table>
          )}
        </Block>

        <Block title={`Questions (${s.questions.length})`}>
          {s.questions.length === 0 ? (
            <Empty>No questions were asked.</Empty>
          ) : (
            <Table head={["Time", "Admission no.", "Language", "Question", "Answered"]}>
              {s.questions.map((q) => (
                <tr key={q.id} className="align-top">
                  <td className="whitespace-nowrap px-3 py-2">{time(q.createdAt)}</td>
                  <td className="px-3 py-2 font-mono">{q.admissionNumber}</td>
                  <td className="px-3 py-2">{q.language === "sw" ? "Kiswahili" : "English"}</td>
                  <td className="px-3 py-2" lang={q.language}>{q.text}</td>
                  <td className="px-3 py-2">{q.answered ? "Yes" : "No"}</td>
                </tr>
              ))}
            </Table>
          )}
        </Block>

        <Block title="Timeline">
          <ol className="space-y-1.5 font-mono text-[13px]">
            {dedup.map((e, i) => (
              <li key={i} className="grid grid-cols-[5.5rem_6.5rem_1fr] gap-2">
                <span className="text-slate-500">{time(e.at)}</span>
                <span className={e.kind === "Error" ? "text-red-300" : e.kind === "Question" ? "text-amber-200" : e.kind === "Student" ? "text-cyan-300" : "text-slate-600"}>{e.kind}</span>
                <span className="font-sans text-slate-700">{e.text}</span>
              </li>
            ))}
          </ol>
        </Block>

        <Block title={`Transcript and translation (${s.segments.length} statements)`}>
          {s.segments.length === 0 ? (
            <Empty>No statements recorded.</Empty>
          ) : (
            <details open={s.segments.length <= 30}>
              <summary className="cursor-pointer text-sm font-semibold text-cyan-300 print:hidden">Show all statements</summary>
              <Table head={["#", "Time", "English", "Kiswahili"]}>
                {s.segments.map((x) => (
                  <tr key={x.id} className="align-top">
                    <td className="px-3 py-2 font-mono text-slate-500">{x.seq}</td>
                    <td className="whitespace-nowrap px-3 py-2">{time(x.createdAt)}</td>
                    <td className="px-3 py-2">{x.english}</td>
                    <td className="px-3 py-2 text-cyan-200" lang="sw">{x.kiswahili ?? "—"}</td>
                  </tr>
                ))}
              </Table>
            </details>
          )}
        </Block>
        <p className="text-xs text-slate-500">Times are East Africa Time (EAT). Generated from AI254 LIVE session records.</p>
      </article>
    </main>
  );
}

function Cell({ k, v, sub }: { k: string; v: string; sub?: string }) {
  return (
    <div className="bg-surface p-4">
      <dt className="text-xs text-slate-500">{k}</dt>
      <dd className="mt-1 font-semibold text-brand-ink">{v}</dd>
      {sub && <dd className="text-xs text-slate-500">{sub}</dd>}
    </div>
  );
}
function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card break-inside-avoid p-6">
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
          <tr>{head.map((h) => <th key={h} scope="col" className="px-3 py-2 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  );
}
function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">{children}</p>;
}
