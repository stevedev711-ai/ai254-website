"use client";

import { useState } from "react";

const stages = [
  { key: "mic", t: "Lecturer microphone", d: "Lecturer's voice in the lecture hall" },
  { key: "capture", t: "Audio capture", d: "Browser captures short audio chunks", toggle: true },
  { key: "asr", t: "Speech-to-text", d: "AI254 speech recognition service" },
  { key: "en", t: "English transcript", d: "Sentence-level English text" },
  { key: "sw", t: "Kiswahili translation", d: "AI254 translation pipeline" },
  { key: "terms", t: "Terminology processing", d: "Subject glossary applied and linked" },
  { key: "display", t: "Student display", d: "Phones, tablets, laptops" },
];

export function ArchitectureDiagram() {
  const [capture, setCapture] = useState(true);
  return (
    <figure className="card overflow-hidden p-5 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <figcaption className="text-sm font-semibold text-slate-700">AI254 LIVE processing pipeline</figcaption>
        <button
          type="button"
          role="switch"
          aria-checked={capture}
          onClick={() => setCapture((v) => !v)}
          className="inline-flex items-center gap-3 rounded-full border border-slate-200 py-1.5 pl-4 pr-1.5 text-sm"
        >
          Audio capture: <strong>{capture ? "On" : "Off"}</strong>
          <span className={`relative h-6 w-10 rounded-full transition-colors ${capture ? "bg-cyan-500" : "bg-slate-300"}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${capture ? "left-[18px]" : "left-0.5"}`} />
          </span>
        </button>
      </div>

      <ol className="grid gap-3 lg:grid-cols-7 lg:gap-0">
        {stages.map((s, k) => {
          const downstream = k >= 2;
          const idle = !capture && downstream;
          return (
            <li key={s.key} className="relative flex lg:flex-col lg:items-center">
              {k > 0 && (
                <svg className="absolute -top-3 left-6 h-3 w-1 lg:left-auto lg:right-1/2 lg:top-7 lg:h-1 lg:w-full lg:-translate-x-0" viewBox="0 0 100 4" preserveAspectRatio="none" aria-hidden>
                  <line x1="0" y1="2" x2="100" y2="2" stroke={capture || k < 2 ? "#04A0E1" : "#33497A"} strokeWidth="4" strokeDasharray="6 6" className={capture ? "animate-flow" : ""} />
                </svg>
              )}
              <div className={`relative z-10 flex w-full items-center gap-4 rounded-xl border p-4 transition-all lg:mx-1.5 lg:flex-col lg:p-3 lg:text-center ${idle ? "border-slate-200 bg-slate-50 opacity-50" : s.toggle ? "border-cyan-400 bg-cyan-400/10" : "border-slate-200 bg-surface"}`}>
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-mono text-sm font-bold ${idle ? "bg-slate-200 text-slate-500" : "bg-brand-gradient text-white"}`}>{k + 1}</span>
                <div>
                  <p className="text-sm font-semibold leading-tight">{s.t}</p>
                  <p className="mt-1 text-xs leading-snug text-slate-500">{s.d}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-6 text-sm text-slate-600" aria-live="polite">
        {capture
          ? "Capture is on: each audio chunk moves through recognition, translation and terminology processing before it reaches students."
          : "Capture is off: no audio leaves the lecturer’s device and nothing new is sent to students. The lecturer can switch capture back on at any time."}
      </p>
    </figure>
  );
}
