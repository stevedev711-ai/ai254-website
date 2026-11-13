"use client";

import { useMemo, useState } from "react";

export type PublicTerm = {
  id: string;
  english: string;
  kiswahili: string;
  subject: string;
  topic: string;
  status: "SAMPLE" | "DRAFT" | "IN_REVIEW" | "REVIEWED";
  definitionEn: string | null;
  definitionSw: string | null;
  usageNote: string | null;
};

const STATUS: Record<PublicTerm["status"], { label: string; cls: string }> = {
  REVIEWED: { label: "Reviewed", cls: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/30" },
  IN_REVIEW: { label: "In review", cls: "bg-cyan-400/10 text-cyan-300 ring-cyan-400/40" },
  DRAFT: { label: "Draft", cls: "bg-amber-400/10 text-amber-200 ring-amber-400/30" },
  SAMPLE: { label: "Sample", cls: "bg-slate-100 text-slate-500 ring-slate-200" },
};

export function GlossaryBrowser({ terms }: { terms: PublicTerm[] }) {
  const [q, setQ] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");

  const subjects = useMemo(() => [...new Set(terms.map((t) => t.subject))], [terms]);
  const topics = useMemo(() => [...new Set(terms.filter((t) => !subject || t.subject === subject).map((t) => t.topic))].sort(), [terms, subject]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return terms.filter(
      (t) =>
        (!subject || t.subject === subject) &&
        (!topic || t.topic === topic) &&
        (!needle || t.english.toLowerCase().includes(needle) || t.kiswahili.toLowerCase().includes(needle)),
    );
  }, [terms, q, subject, topic]);

  const groups = useMemo(() => {
    const m = new Map<string, PublicTerm[]>();
    for (const t of shown) {
      const k = `${t.subject} · ${t.topic}`;
      m.set(k, [...(m.get(k) ?? []), t]);
    }
    return [...m];
  }, [shown]);

  return (
    <div>
      <div className="z-20 -mx-4 mb-6 border-b border-slate-200 bg-page/95 px-4 py-4 backdrop-blur sm:sticky sm:top-16 lg:top-[72px]">
        <div className="grid gap-3 sm:grid-cols-[1fr_200px_260px]">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search English or Kiswahili, e.g. osmosis or seli"
            className="input"
            aria-label="Search the glossary"
          />
          <select value={subject} onChange={(e) => { setSubject(e.target.value); setTopic(""); }} className="input" aria-label="Subject">
            <option value="">All subjects</option>
            {subjects.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={topic} onChange={(e) => setTopic(e.target.value)} className="input" aria-label="Topic">
            <option value="">All topics</option>
            {topics.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <p className="mt-2 text-xs text-slate-500" aria-live="polite">
          Showing {shown.length} of {terms.length} terms
        </p>
      </div>

      {groups.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">No terms match your search.</p>}

      <div className="space-y-10">
        {groups.map(([name, list]) => (
          <section key={name} aria-label={name}>
            <h2 className="text-lg font-bold">
              {name} <span className="text-sm font-normal text-slate-500">({list.length})</span>
            </h2>
            <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th scope="col" className="w-[38%] px-4 py-2.5 font-semibold">English</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Kiswahili</th>
                    <th scope="col" className="w-28 px-4 py-2.5 text-right font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {list.map((t) => (
                    <tr key={t.id} className="align-top">
                      <td className="px-4 py-2.5 font-medium text-brand-ink">{t.english}</td>
                      <td className="px-4 py-2.5">
                        <span className="font-semibold text-cyan-200" lang="sw">{t.kiswahili}</span>
                        {t.definitionSw && <p className="mt-1 text-xs text-slate-600" lang="sw">{t.definitionSw}</p>}
                        {t.usageNote && <p className="mt-1 text-xs text-slate-500">{t.usageNote}</p>}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span className={`badge ring-1 ${STATUS[t.status].cls}`}>{STATUS[t.status].label}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
