import Link from "next/link";
import { PILOT2 } from "@/lib/pilot-results";
import { pilotFacts } from "@/lib/site";
import { PrintButton } from "./PrintButton";

/**
 * "Initial classroom pilot · Pilot 2" record for funders and university partners.
 * Built only from the Pilot 2 evaluation report and AI254 project figures.
 * The system-log section reports what the evaluation found from the pilot system's
 * logs; it does not reproduce individual log entries.
 */
export function PilotRecord() {
  const p = PILOT2;
  const pilot1Sessions = pilotFacts.lectureSessions - 5;
  const maxDelay = 10;
  return (
    <article className="print-light mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <header className="card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Initial classroom pilot · Pilot 2</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Live English–Kiswahili lecture support in a university Biology classroom</h2>
            <p className="mt-2 text-slate-600">
              {p.institution} · {p.unit} · Second of AI254&apos;s two initial classroom pilots
            </p>
          </div>
          <PrintButton />
        </div>
        <dl className="mt-6 grid gap-px overflow-hidden rounded-xl bg-slate-200 sm:grid-cols-4">
          <Fact k="Pilot period" v={p.period} sub="Continuous two weeks" />
          <Fact k="Lecturers" v="2" sub={p.lecturers.join(" · ")} />
          <Fact k="Students" v="40" sub="First-year Biology 101" />
          <Fact k="Sessions" v="5 × 40 min" sub="200 minutes observed" />
        </dl>
      </header>

      {/* 1. System logs */}
      <Section n="1" title="System logs" highlight sub="Recorded by the AI254 LIVE pilot system and analysed in the Pilot 2 evaluation report">
        <div className="grid gap-3 sm:grid-cols-3">
          <Metric v={`${p.delay.average} s`} k="Average translation delay, normal lecture delivery" />
          <Metric v={`${p.delay.shortest} s`} k="Shortest observed delay" />
          <Metric v="Up to 9 s" k="Longest delays, during network disruption" />
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Translation delay by classroom situation</p>
          <ul className="mt-3 space-y-3">
            {p.delay.rows.map((r) => (
              <li key={r.situation} className="grid grid-cols-[8.5rem_1fr_5.5rem] items-center gap-3 text-sm sm:grid-cols-[11rem_1fr_7rem]" title={`${r.situation}: ${r.typical}`}>
                <span className="text-slate-700">{r.situation}</span>
                <div className="relative h-2 rounded-full bg-slate-200" aria-hidden>
                  <div className="absolute h-2 rounded-full bg-cyan-500" style={{ left: `${(r.min / maxDelay) * 100}%`, width: `${Math.max(((r.max - r.min) / maxDelay) * 100, 2)}%` }} />
                </div>
                <span className="text-right tabular-nums text-brand-ink">{r.typical.replace(" seconds", " s").replace(" second", " s")}</span>
              </li>
            ))}
          </ul>
          <div className="mt-1 grid grid-cols-[8.5rem_1fr_5.5rem] gap-3 text-[11px] text-slate-500 sm:grid-cols-[11rem_1fr_7rem]" aria-hidden>
            <span />
            <div className="flex justify-between"><span>0 s</span><span>5 s</span><span>10 s</span></div>
            <span />
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">What the logs recorded</p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
              {["Session activity", "Connection interruptions", "Translation delay", "System errors", "Periods of active use"].map((x) => <Li key={x}>{x}</Li>)}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">What the evaluation found</p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
              <Li>Delay was acceptable at a normal teaching pace and grew during rapid explanations, when several sentences were processed together.</Li>
              <Li>The system performed better during slower, structured explanations than during rapid speech and question-and-answer exchanges.</Li>
              <Li>Network quality directly affected delay; disruptions caused the longest waits.</Li>
            </ul>
          </div>
        </div>
      </Section>

      {/* 2. Student feedback */}
      <Section n="2" title="Student feedback" sub="Questionnaire completed by all 40 students, with classroom observations and student comments">
        <dl className="grid gap-3 sm:grid-cols-3">
          <Metric v="85%" k="Swahili support helped them understand difficult concepts (34)" />
          <Metric v="80%" k="English + Swahili together helped them follow lectures (32)" />
          <Metric v="73%" k="Biology terminology clearer than in Pilot 1 (29)" />
          <Metric v="88%" k="Checked the translation for unfamiliar terms (35)" />
          <Metric v="83%" k="More comfortable following Biology lectures (33)" />
          <Metric v="85%" k="Would use AI254 in another Biology lecture (34)" />
        </dl>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">What students valued</p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
              {p.usability.positive.map((x) => <Li key={x}>{x}</Li>)}
              <Li>Most useful for cellular processes, genetics, definitions, terminology, laboratory procedures and multi-step processes</Li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">What students found difficult</p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
              {p.usability.problems.map((x) => <Li key={x}>{x}</Li>)}
              <Li>11 students (28%) found some translations still difficult to understand</Li>
            </ul>
          </div>
        </div>
        <p className="mt-5 rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">{p.comprehensionEvidence}</p>
      </Section>

      {/* 3. Lecturer feedback */}
      <Section n="3" title="Lecturer feedback" sub={`Interviews with ${p.lecturers.join(" and ")}`}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Where the lecturers saw value</p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-700">{p.lecturerFeedback.value.map((x) => <Li key={x}>{x}</Li>)}</ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Lecturer concerns</p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-700">{p.lecturerFeedback.concerns.map((x) => <Li key={x}>{x}</Li>)}</ul>
          </div>
        </div>
        <p className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">{p.lecturerFeedback.suggestion}</p>
      </Section>

      {/* 4. Pilot overview */}
      <Section n="4" title="Pilot overview">
        <ul className="space-y-2 text-sm text-slate-700">
          <Li>Lecturers taught Biology 101 in English as normal; students followed live English transcription with Kiswahili translation on their own devices.</Li>
          <Li>All five sessions used the updated Swahili Biology glossary, integrated after lessons from Pilot 1. Translation quality was assessed on {p.translation.sampled} sampled segments: {p.translation.acceptablePct}% acceptable.</Li>
          <Li>Evidence: student questionnaire (40 of 40), system logs, lecturer interviews and classroom observations.</Li>
          <Li>A classroom test with participating students and lecturers; not a formal institutional endorsement or partnership agreement.</Li>
        </ul>
        <table className="mt-6 w-full text-left text-sm">
          <caption className="mb-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">AI254 initial classroom pilots</caption>
          <thead className="text-xs uppercase tracking-wider text-slate-500">
            <tr className="border-b border-slate-200">
              <th className="py-2 font-semibold"> </th>
              <th className="py-2 font-semibold">Pilot 1</th>
              <th className="py-2 font-semibold">Pilot 2</th>
              <th className="py-2 font-semibold">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            <tr><td className="py-2">Student participations</td><td>{pilotFacts.pilot1}</td><td>{pilotFacts.pilot2}</td><td>{pilotFacts.participations}</td></tr>
            <tr><td className="py-2">Lecture sessions</td><td>{pilot1Sessions}</td><td>5</td><td>{pilotFacts.lectureSessions}</td></tr>
          </tbody>
        </table>
        <p className="mt-3 text-xs text-slate-500">Some students took part in both pilots, so total participations are not a count of unique individuals.</p>
        <p className="mt-4 text-sm print:hidden">
          <Link href="/live/admin?tab=pilot" className="font-semibold text-cyan-300 underline underline-offset-4">Full evaluation results</Link>
        </p>
      </Section>

      <footer className="border-t border-slate-200 pt-4 text-xs text-slate-500">
        Prepared by AI254 · info@ai254.net · +254 705 771 360
      </footer>
    </article>
  );
}

function Section({ n, title, sub, highlight, children }: { n: string; title: string; sub?: string; highlight?: boolean; children: React.ReactNode }) {
  return (
    <section className={`card break-inside-avoid p-6 sm:p-8 ${highlight ? "border-cyan-400/60 ring-1 ring-cyan-400/30" : ""}`}>
      <h3 className="flex items-center gap-3 text-xl font-bold">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-400/15 text-sm text-cyan-300">{n}</span>
        {title}
      </h3>
      {sub && <p className="mt-1 pl-11 text-sm text-slate-500">{sub}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Fact({ k, v, sub }: { k: string; v: string; sub?: string }) {
  return (
    <div className="bg-surface p-4">
      <dt className="text-xs text-slate-500">{k}</dt>
      <dd className="mt-1 font-bold text-brand-ink">{v}</dd>
      {sub && <dd className="text-xs text-slate-500">{sub}</dd>}
    </div>
  );
}

function Metric({ v, k }: { v: string; k: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <dt className="sr-only">{k}</dt>
      <dd className="text-2xl font-extrabold text-brand-ink">{v}</dd>
      <dd className="mt-1 text-sm leading-snug text-slate-600">{k}</dd>
    </div>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500" aria-hidden />
      <span>{children}</span>
    </li>
  );
}
