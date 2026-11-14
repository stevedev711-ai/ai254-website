import Link from "next/link";
import { PILOT2 } from "@/lib/pilot-results";
import { pilotFacts } from "@/lib/site";
import { PrintButton } from "./PrintButton";

/**
 * "Pilot 2 record": a factual summary of the second classroom pilot for funders and
 * university partners. Every item comes from the Pilot 2 evaluation report or AI254's
 * project figures. No session-level dates or student identities are shown.
 */
export function PilotRecord() {
  const p = PILOT2;
  const pilot1Sessions = pilotFacts.lectureSessions - 5;
  return (
    <article className="print-light mx-auto max-w-4xl space-y-8">
      <header className="card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Pilot 2 record</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Classroom pilot: AI254 live English–Kiswahili lecture support</h2>
            <p className="mt-2 text-slate-600">
              {p.institution} · {p.unit}
            </p>
          </div>
          <PrintButton />
        </div>
        <dl className="mt-6 grid gap-px overflow-hidden rounded-xl bg-slate-200 sm:grid-cols-3">
          <Fact k="Pilot period" v={p.period} sub="Continuous two-week classroom pilot" />
          <Fact k="Evaluation" v="August 2026" sub="Following the second classroom pilot" />
          <Fact k="Institution" v={p.institution} sub={`${p.unit} classroom`} />
        </dl>
      </header>

      <Section n="1" title="Participants">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Biology 101 lecturers</p>
            <ul className="mt-3 space-y-2">
              {p.lecturers.map((name) => (
                <li key={name} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-400/15 text-sm font-bold text-cyan-200" aria-hidden>
                    {name.replace(/^(Mr|Dr|Mrs|Ms|Prof)\.\s*/, "").split(" ").map((x) => x[0]).join("")}
                  </span>
                  <span className="font-semibold text-brand-ink">{name}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Students</p>
            <p className="mt-3 text-3xl font-bold text-brand-ink">40</p>
            <p className="text-sm text-slate-600">First-year Biology 101 students. Students are not identified individually in this record.</p>
          </div>
        </div>
      </Section>

      <Section n="2" title="Pilot design">
        <dl className="grid gap-px overflow-hidden rounded-xl bg-slate-200 sm:grid-cols-4">
          <Fact k="Lecture sessions" v="5" />
          <Fact k="Per session" v="~40 min" />
          <Fact k="Observed teaching time" v="200 min" />
          <Fact k="Questionnaires completed" v="40 of 40" />
        </dl>
        <ul className="mt-5 space-y-2 text-sm text-slate-700">
          <Li>Lecturers taught Biology 101 in English as normal; students followed live English transcription with Kiswahili translation on their own devices.</Li>
          <Li>All five sessions used the updated Swahili Biology glossary, integrated after lessons from Pilot 1.</Li>
          <Li>The pilot was a classroom test with participating students and lecturers; it is not a formal institutional endorsement or partnership agreement.</Li>
        </ul>
      </Section>

      <Section n="3" title="Evaluation objectives">
        <ol className="list-decimal space-y-1.5 pl-5 text-sm text-slate-700">
          {p.objectives.map((o) => <li key={o}>{o}</li>)}
        </ol>
      </Section>

      <Section n="4" title="Evidence collected">
        <div className="grid gap-4 sm:grid-cols-2">
          <Evidence title="Student questionnaire" body="Completed by all 40 participating students: understanding, usefulness of Swahili translation, terminology clarity, following difficult explanations, confidence, willingness to reuse, participation, usability and technical problems." />
          <Evidence title="System logs" body="Session activity, connection interruptions, translation delay, system errors and periods of active use." />
          <Evidence title="Lecturer interviews" body="Both Biology 101 lecturers were interviewed about classroom fit, output quality and concerns." />
          <Evidence title="Classroom observations" body="Observation notes from the five sessions, including when students checked the translated text, plus student comments." />
        </div>
        <p className="mt-4 text-sm text-slate-600">Translation quality was assessed on {p.translation.sampled} sampled translated segments from the five sessions.</p>
      </Section>

      <Section n="5" title="Key results">
        <dl className="grid gap-3 sm:grid-cols-2">
          <Result v="85%" k="said Swahili support helped them understand difficult concepts (34 of 40)" />
          <Result v="82%" k={`of ${p.translation.sampled} sampled translated segments rated acceptable (164)`} />
          <Result v="2.8 s" k="average translation delay in normal lecture delivery (shortest 1.8 s)" />
          <Result v="88%" k="checked the translation when they met unfamiliar terms (35 of 40)" />
          <Result v="83%" k="felt more comfortable following Biology lectures with Swahili support (33 of 40)" />
          <Result v="85%" k="would use AI254 in another Biology lecture (34 of 40)" />
        </dl>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">What worked well</p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-700">{p.workedWell.map((x) => <Li key={x.t}>{x.t}</Li>)}</ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Areas for development</p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-700">{p.needsWork.map((x) => <Li key={x.t}>{x.t}</Li>)}</ul>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-600 print:hidden">
          Full findings: <Link href="/live/admin?tab=pilot" className="font-semibold text-cyan-300 underline underline-offset-4">Pilot results</Link>
        </p>
      </Section>

      <Section n="6" title="Context: AI254 classroom pilots">
        <table className="w-full text-left text-sm">
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
            <tr><td className="py-2">Unit</td><td colSpan={3}>{pilotFacts.subject}, {pilotFacts.institution}</td></tr>
          </tbody>
        </table>
        <p className="mt-3 text-xs text-slate-500">Some students took part in both pilots, so total participations are not a count of unique individuals.</p>
      </Section>

      <footer className="border-t border-slate-200 pt-4 text-xs text-slate-500">
        Source: {p.source}. Prepared by AI254 · info@ai254.net · +254 705 771 360
      </footer>
    </article>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="card break-inside-avoid p-6 sm:p-8">
      <h3 className="flex items-center gap-3 text-lg font-bold">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-navy-400/15 text-xs text-cyan-300">{n}</span>
        {title}
      </h3>
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

function Result({ v, k }: { v: string; k: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <dt className="sr-only">{k}</dt>
      <dd className="text-2xl font-extrabold text-brand-ink">{v}</dd>
      <dd className="mt-1 text-sm text-slate-600">{k}</dd>
    </div>
  );
}

function Evidence({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="font-semibold text-brand-ink">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">{body}</p>
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
