import { PILOT2 } from "@/lib/pilot-results";

/**
 * Administrator view of the Pilot 2 evaluation report. Report figures only:
 * nothing here is read from, or written to, the system's session or log tables.
 */
export function PilotResults() {
  const p = PILOT2;
  return (
    <div className="space-y-10">
      {/* Header */}
      <section className="card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Pilot results</p>
            <h2 className="mt-2 text-2xl font-bold">{p.title}</h2>
            <p className="mt-1 text-slate-600">
              {p.unit} · <strong className="text-brand-ink">{p.period}</strong>
            </p>
            <p className="mt-1 text-sm text-slate-500">{p.periodNote}</p>
          </div>
          <span className="badge bg-navy-400/15 text-cyan-200 ring-1 ring-navy-400/30">Source: {p.source}</span>
        </div>
        <p className="mt-5 max-w-4xl leading-relaxed text-slate-600">{p.summary}</p>
        <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-slate-200 sm:grid-cols-5">
          {p.profile.map((x) => (
            <div key={x.label} className="bg-surface p-4">
              <dt className="text-xs text-slate-500">{x.label}</dt>
              <dd className="mt-1 text-2xl font-bold text-brand-ink">{x.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Headline tiles */}
      <section aria-label="Headline results" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile value="85%" label="said Swahili support helped them understand difficult concepts" />
        <Tile value="82%" label="of 200 sampled translated segments rated acceptable" />
        <Tile value="2.8 s" label="average translation delay during normal lecture delivery" />
        <Tile value="85%" label="would use AI254 in another Biology lecture" />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="5. Student comprehension" sub={`Questionnaire, n = ${p.respondents} students`}>
          <Bars rows={p.comprehension} />
          <p className="mt-4 text-sm leading-relaxed text-slate-600">{p.comprehensionEvidence}</p>
          <Chips items={p.comprehensionUseCases} label="Most useful when lecturers explained" />
        </Section>

        <Section title="6. Translation accuracy and terminology" sub={`${p.translation.sampled} sampled translated segments`}>
          <Composition />
          <List title="Where translation remained weak" items={p.translation.weakAreas} />
          <p className="mt-3 text-sm text-slate-500">{p.translation.note}</p>
        </Section>

        <Section title="7. Translation delay" sub="From system logs">
          <div className="grid grid-cols-2 gap-3">
            <Mini value={`${p.delay.average} s`} label="Average (normal delivery)" />
            <Mini value={`${p.delay.shortest} s`} label="Shortest observed" />
          </div>
          <DelayRanges />
          <p className="mt-4 text-sm leading-relaxed text-slate-600">{p.delay.note}</p>
        </Section>

        <Section title="8. Student participation" sub={`Questionnaire and observation, n = ${p.respondents}`}>
          <Bars rows={p.participation} />
          <p className="mt-4 text-sm leading-relaxed text-slate-600">{p.participationNote}</p>
        </Section>

        <Section title="9. Student confidence" sub={`Students agreeing, n = ${p.respondents}`}>
          <Bars rows={p.confidence} />
          <p className="mt-4 rounded-lg bg-amber-400/10 p-3 text-sm leading-relaxed text-amber-200">{p.confidenceNote}</p>
        </Section>

        <Section title="10. Classroom usability" sub="Student feedback">
          <List title="Positive" items={p.usability.positive} tone="good" />
          <List title="Problems identified" items={p.usability.problems} tone="bad" />
        </Section>

        <Section title="11. Lecturer feedback" sub="Interviews with both lecturers">
          <List title="Where lecturers saw value" items={p.lecturers.value} tone="good" />
          <List title="Lecturer concerns" items={p.lecturers.concerns} tone="bad" />
          <p className="mt-3 text-sm text-slate-600">{p.lecturers.suggestion}</p>
        </Section>

        <Section title="Evaluation objectives and method" sub="Mixed-method evaluation">
          <ol className="list-decimal space-y-1.5 pl-5 text-sm text-slate-600">
            {p.objectives.map((o) => <li key={o}>{o}</li>)}
          </ol>
          <List title="Quantitative data" items={p.methodology.quantitative} />
          <List title="Qualitative data" items={p.methodology.qualitative} />
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="12. What worked well">
          <Outcomes items={p.workedWell} tone="good" />
        </Section>
        <Section title="13. What did not work well">
          <Outcomes items={p.needsWork} tone="bad" />
        </Section>
      </div>

    </div>
  );
}

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="card p-6">
      <h3 className="text-lg font-bold">{title}</h3>
      {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Tile({ value, label }: { value: string; label: string }) {
  return (
    <div className="card p-5">
      <p className="font-display text-4xl font-extrabold text-brand-ink">{value}</p>
      <p className="mt-2 text-sm leading-snug text-slate-600">{label}</p>
    </div>
  );
}

function Mini({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-2xl font-bold text-brand-ink">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

/** One measure per row (share of 40 students): single hue, value labels in text colour. */
function Bars({ rows }: { rows: { finding: string; n: number; pct: number }[] }) {
  return (
    <ul className="space-y-3.5">
      {rows.map((r) => (
        <li key={r.finding} title={`${r.finding}: ${r.n} of 40 students (${r.pct}%)`}>
          <div className="flex items-baseline justify-between gap-4 text-sm">
            <span className="text-slate-700">{r.finding}</span>
            <span className="shrink-0 tabular-nums text-brand-ink">
              <strong>{r.pct}%</strong> <span className="text-slate-500">({r.n})</span>
            </span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-slate-200" aria-hidden>
            <div className="h-2 rounded-full bg-cyan-500" style={{ width: `${r.pct}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Part-to-whole of the 200 sampled segments: segmented bar with 2px gaps + labelled legend. */
function Composition() {
  const { breakdown, sampled, acceptablePct } = PILOT2.translation;
  return (
    <div>
      <p className="text-sm text-slate-600">
        Overall acceptable output: <strong className="text-brand-ink">{acceptablePct}%</strong>
      </p>
      <div className="mt-3 flex h-4 gap-[2px] overflow-hidden rounded-md" role="img" aria-label={breakdown.map((b) => `${b.label}: ${b.n}`).join(", ")}>
        {breakdown.map((b) => (
          <div key={b.label} title={`${b.label}: ${b.n} of ${sampled} (${((b.n / sampled) * 100).toFixed(1)}%)`} style={{ width: `${(b.n / sampled) * 100}%`, background: b.color }} className="min-w-[4px] first:rounded-l-md last:rounded-r-md" />
        ))}
      </div>
      <table className="mt-4 w-full text-sm">
        <caption className="sr-only">Translation assessment of {sampled} sampled segments</caption>
        <tbody className="divide-y divide-slate-100">
          {breakdown.map((b) => (
            <tr key={b.label}>
              <td className="py-2 pr-3">
                <span className="mr-2 inline-block h-2.5 w-2.5 rounded-sm align-middle" style={{ background: b.color }} aria-hidden />
                <span className="text-slate-700">{b.label}</span>
              </td>
              <td className="py-2 text-right tabular-nums text-brand-ink">{b.n}</td>
              <td className="w-16 py-2 text-right tabular-nums text-slate-500">{((b.n / sampled) * 100).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Typical delay ranges on one shared 0–10 s axis. */
function DelayRanges() {
  const max = 10;
  return (
    <div className="mt-5">
      <ul className="space-y-3">
        {PILOT2.delay.rows.map((r) => (
          <li key={r.situation} className="grid grid-cols-[9.5rem_1fr_6.5rem] items-center gap-3 text-sm" title={`${r.situation}: ${r.typical}`}>
            <span className="text-slate-700">{r.situation}</span>
            <div className="relative h-2 rounded-full bg-slate-200" aria-hidden>
              <div
                className="absolute h-2 rounded-full bg-cyan-500"
                style={{ left: `${(r.min / max) * 100}%`, width: `${Math.max(((r.max - r.min) / max) * 100, 2)}%` }}
              />
            </div>
            <span className="text-right tabular-nums text-brand-ink">{r.typical.replace(" seconds", " s").replace(" second", " s")}</span>
          </li>
        ))}
      </ul>
      <div className="mt-1 grid grid-cols-[9.5rem_1fr_6.5rem] gap-3 text-[11px] text-slate-500" aria-hidden>
        <span />
        <div className="flex justify-between"><span>0 s</span><span>5 s</span><span>10 s</span></div>
        <span />
      </div>
    </div>
  );
}

function List({ title, items, tone }: { title: string; items: string[]; tone?: "good" | "bad" }) {
  const mark = tone === "good" ? "✓" : tone === "bad" ? "!" : "•";
  const color = tone === "good" ? "text-emerald-300" : tone === "bad" ? "text-amber-200" : "text-cyan-300";
  return (
    <div className="mt-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
      <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
        {items.map((i) => (
          <li key={i} className="flex gap-2">
            <span className={`w-3 shrink-0 font-bold ${color}`} aria-hidden>{mark}</span>
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Chips({ items, label }: { items: string[]; label: string }) {
  return (
    <div className="mt-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {items.map((i) => <li key={i} className="badge bg-cyan-400/10 text-cyan-200 ring-1 ring-cyan-400/40">{i}</li>)}
      </ul>
    </div>
  );
}

function Outcomes({ items, tone }: { items: { t: string; d: string }[]; tone: "good" | "bad" }) {
  return (
    <ol className="space-y-3">
      {items.map((x, k) => (
        <li key={x.t} className="flex gap-3">
          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${tone === "good" ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-200"}`}>{k + 1}</span>
          <div>
            <p className="font-semibold text-brand-ink">{x.t}</p>
            <p className="text-sm text-slate-600">{x.d}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
