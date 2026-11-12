"use client";

import { useEffect, useState } from "react";

const stages = [
  {
    title: "The lecturer begins teaching",
    body: "A lecturer starts a session using AI254 LIVE and continues delivering the lecture in English. Students join using a session code or QR code.",
    icon: "M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-2.08A7 7 0 0 0 19 12h-2Z",
    sample: "“Cells are surrounded by a cell membrane…”",
  },
  {
    title: "AI254 captures the lecture",
    body: "The system processes the lecturer's speech and generates English transcription. Technical terms and sentence structure are processed as part of the transcription workflow.",
    icon: "M3 12h2m3-5v10m4-13v16m4-11v6m4-3h1",
    sample: "Cells are surrounded by a [cell membrane], which controls…",
  },
  {
    title: "The lecture is translated into Kiswahili",
    body: "The transcribed explanation is translated using the system's language processing pipeline and subject-specific terminology resources. For Biology, the system draws on a glossary developed and reviewed with language specialists.",
    icon: "M4 5h7M7.5 5v2m2.5 0c-1 4-4 7-6.5 8M6 10c1.5 2 3.5 3.5 6 4.5M13 19l3.5-8 3.5 8m-6-2h5",
    sample: "cell membrane → utando wa seli",
  },
  {
    title: "Students follow the lecture live",
    body: "Students receive the translated text on their phones, tablets or laptops. They can view the Kiswahili explanation alongside the English transcription while the lecturer continues teaching.",
    icon: "M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm3 17h2",
    sample: "Seli zimezungukwa na utando wa seli…",
  },
];

export function ProcessFlow() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setActive((a) => (a + 1) % stages.length), 3200);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {/* Connector track (desktop) */}
      <div className="relative hidden lg:block" aria-hidden>
        <svg viewBox="0 0 1000 40" className="h-10 w-full" preserveAspectRatio="none">
          <line x1="125" y1="20" x2="875" y2="20" stroke="#E2E8F0" strokeWidth="3" />
          <line
            x1="125"
            y1="20"
            x2={125 + active * 250}
            y2="20"
            stroke="url(#flow-g)"
            strokeWidth="3"
            style={{ transition: "all .8s ease" }}
          />
          <line x1="125" y1="20" x2="875" y2="20" stroke="#04A0E1" strokeWidth="3" strokeDasharray="4 20" className="animate-flow" opacity=".5" />
          <defs>
            <linearGradient id="flow-g">
              <stop offset="0" stopColor="#264AA0" />
              <stop offset="1" stopColor="#04A0E1" />
            </linearGradient>
          </defs>
          {stages.map((_, k) => (
            <circle key={k} cx={125 + k * 250} cy="20" r={k === active ? 9 : 6} fill={k <= active ? (k === active ? "#04A0E1" : "#264AA0") : "#CBD5E1"} style={{ transition: "all .4s" }} />
          ))}
        </svg>
      </div>

      <ol className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stages.map((s, k) => (
          <li key={s.title}>
            <button
              type="button"
              onClick={() => setActive(k)}
              aria-pressed={k === active}
              className={`h-full w-full rounded-2xl border p-6 text-left transition-all ${k === active ? "border-cyan-400 bg-white shadow-lg shadow-cyan-900/5" : "border-slate-200 bg-white/60 hover:border-slate-300"}`}
            >
              <div className="flex items-center gap-3">
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${k === active ? "bg-brand-gradient text-white" : "bg-navy-50 text-navy-500"}`}>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d={s.icon} />
                  </svg>
                </span>
                <span className="font-mono text-sm font-semibold text-slate-400">0{k + 1}</span>
              </div>
              <h3 className="mt-4 text-lg font-bold leading-snug">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.body}</p>
              <p className={`mt-4 rounded-lg px-3 py-2 font-mono text-xs transition-colors ${k === active ? "bg-cyan-50 text-cyan-800" : "bg-slate-50 text-slate-500"}`} lang={k === 3 ? "sw" : "en"}>
                {s.sample}
              </p>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
