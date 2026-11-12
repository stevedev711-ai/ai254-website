"use client";

import { useState } from "react";
import { BIOLOGY_TERMS, DEMO_SCRIPTS } from "@/lib/live/demo-content";

const bio = DEMO_SCRIPTS[0];
const segs = bio.segments.slice(7, 11);
const terms = BIOLOGY_TERMS.filter((t) => ["mitochondria", "cellular-respiration", "powerhouse", "ribosome"].includes(t.key));

const tabs = [
  { id: "join", label: "Session joining" },
  { id: "student", label: "Student view" },
  { id: "lecturer", label: "Lecturer console" },
  { id: "terms", label: "Terminology support" },
] as const;

type Tab = (typeof tabs)[number]["id"];

export function LivePreview() {
  const [tab, setTab] = useState<Tab>("student");
  return (
    <div className="card overflow-hidden shadow-xl shadow-navy-900/5">
      <div role="tablist" aria-label="AI254 LIVE preview" className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-slate-50 p-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === t.id ? "bg-surface text-cyan-300 shadow-sm ring-1 ring-slate-200" : "text-slate-600 hover:text-brand-ink"}`}
          >
            {t.label}
          </button>
        ))}
        <span className="demo-badge ml-auto hidden shrink-0 self-center sm:inline-flex">Preview · sample content</span>
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="min-h-[420px] bg-surface p-5 sm:p-8">
        {tab === "join" && <JoinPanel />}
        {tab === "student" && <StudentPanel />}
        {tab === "lecturer" && <LecturerPanel />}
        {tab === "terms" && <TermsPanel />}
      </div>
    </div>
  );
}

function JoinPanel() {
  return (
    <div className="mx-auto grid max-w-3xl items-center gap-8 md:grid-cols-2">
      <div className="space-y-4">
        <div>
          <p className="label">Admission number</p>
          <div className="input font-mono text-slate-500">S/BIO/0123/2025</div>
        </div>
        <div>
          <p className="label">Active lectures</p>
          <ul className="space-y-2">
            {DEMO_SCRIPTS.slice(0, 3).map((s, k) => (
              <li key={s.id} className={`flex items-center justify-between rounded-lg border px-3.5 py-3 text-sm ${k === 0 ? "border-cyan-400 bg-cyan-400/10" : "border-slate-200"}`}>
                <span>
                  <span className="font-semibold">{s.courseCode}</span> <span className="text-slate-600">· {s.subject}</span>
                </span>
                <span className="text-xs text-emerald-300">● Live</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="btn-primary w-full">Join lecture</div>
      </div>
      <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center">
        <p className="text-sm text-slate-600">Or scan the code shown by the lecturer</p>
        <div className="mx-auto mt-4 grid h-36 w-36 grid-cols-7 gap-1 rounded-lg bg-surface p-2 ring-1 ring-slate-200" aria-hidden>
          {Array.from({ length: 49 }).map((_, k) => (
            <span key={k} className={`rounded-[2px] ${[0, 1, 2, 7, 14, 15, 16, 4, 5, 6, 13, 20, 28, 35, 42, 43, 44, 24, 26, 31, 33, 38, 40, 46, 10, 18].includes(k) ? "bg-bezel" : "bg-transparent"}`} />
          ))}
        </div>
        <p className="mt-4 font-mono text-2xl font-bold tracking-[0.3em] text-cyan-300">BIO101</p>
        <p className="mt-1 text-xs text-slate-500">Session code</p>
      </div>
    </div>
  );
}

function StudentPanel() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">BIO 101 · Session BIO101</p>
            <p className="text-lg font-bold">The Cell: Structure and Function</p>
          </div>
          <div className="flex rounded-lg bg-slate-100 p-1 text-xs font-medium">
            <span className="rounded-md bg-surface px-3 py-1.5 shadow-sm">English + Kiswahili</span>
            <span className="px-3 py-1.5 text-slate-500">Kiswahili only</span>
          </div>
        </div>
        <ul className="mt-5 space-y-3">
          {segs.map((s, k) => (
            <li key={k} className={`rounded-xl border p-4 ${k === segs.length - 1 ? "border-cyan-400 bg-cyan-400/10" : "border-slate-200"}`}>
              <p className="text-sm text-slate-600">{s.en}</p>
              <p className="mt-1.5 font-medium text-cyan-200" lang="sw">{s.sw}</p>
            </li>
          ))}
        </ul>
      </div>
      <aside className="space-y-4">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ask a question</p>
          <div className="mt-2 flex gap-2 text-xs">
            <span className="rounded-md bg-navy-500 px-2.5 py-1 text-white">English</span>
            <span className="rounded-md bg-surface px-2.5 py-1 ring-1 ring-slate-200">Kiswahili</span>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-surface p-2.5 text-xs text-slate-500 ring-1 ring-slate-200">
            <span className="h-2 w-2 rounded-full bg-red-500" /> Tap the microphone to speak
          </div>
        </div>
        <div className="rounded-xl border border-cyan-400/40 bg-cyan-400/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">Term in this statement</p>
          <p className="mt-1 font-semibold">Powerhouse of the cell</p>
          <p className="text-sm text-cyan-200">Kituo cha nishati cha seli</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">My notes</p>
          <p className="mt-2 text-sm text-slate-600">Mitochondria → upumuaji wa seli (si kupumua)</p>
        </div>
      </aside>
    </div>
  );
}

function LecturerPanel() {
  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <div className="space-y-4">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Session</p>
          <p className="mt-1 font-semibold">BIO 101 · Biology</p>
          <p className="font-mono text-sm text-cyan-300">Code BIO101</p>
        </div>
        <div className="space-y-2.5 rounded-xl border border-slate-200 p-4 text-sm">
          <Toggle on label="Lecturer microphone" />
          <Toggle on label="Student questions (mic)" />
          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-600">Connected students</span>
            <span className="font-semibold">Shown live</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <span className="btn-outline btn-sm">Pause</span>
          <span className="btn-danger btn-sm">End session</span>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200">
        <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <p className="p-3">English transcription</p>
          <p className="border-l border-slate-200 p-3">Kiswahili output</p>
        </div>
        {segs.map((s, k) => (
          <div key={k} className="grid grid-cols-2 border-b border-slate-100 text-sm last:border-0">
            <p className="p-3 text-slate-700">{s.en}</p>
            <p className="border-l border-slate-100 p-3 text-cyan-200" lang="sw">{s.sw}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TermsPanel() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {terms.map((t) => (
        <div key={t.key} className="rounded-xl border border-slate-200 p-5">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-semibold">{t.english}</p>
            <p className="text-right font-semibold text-cyan-300" lang="sw">{t.kiswahili}</p>
          </div>
          <p className="mt-2 text-sm text-slate-600">{t.definitionEn}</p>
          <p className="mt-1 text-sm text-slate-600" lang="sw">{t.definitionSw}</p>
          {t.usageNote && <p className="mt-3 rounded-lg bg-amber-400/10 px-3 py-2 text-xs text-amber-200">{t.usageNote}</p>}
        </div>
      ))}
    </div>
  );
}

function Toggle({ on, label }: { on?: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-600">{label}</span>
      <span className={`relative h-6 w-10 rounded-full ${on ? "bg-cyan-500" : "bg-slate-300"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[18px]" : "left-0.5"}`} />
      </span>
    </div>
  );
}
