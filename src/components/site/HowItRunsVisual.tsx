"use client";

import { useEffect, useState } from "react";

/**
 * Animated, looping illustration of the AI254 pipeline for page headers.
 * Uses the sample Biology 101 statement from the demonstration content.
 */
const EN = "Mitochondria release energy from glucose through cellular respiration.";
const SW = "Mitokondria hutoa nishati kutoka kwa glukosi kupitia upumuaji wa seli.";

const scenes = [
  { key: "capture", label: "Capturing the lecture" },
  { key: "transcribe", label: "English transcription" },
  { key: "translate", label: "Kiswahili translation" },
  { key: "terms", label: "Scientific terminology" },
  { key: "devices", label: "On students' devices" },
] as const;

const SCENE_MS = 3600;

export function HowItRunsVisual() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);
  useEffect(() => {
    if (paused || reduced) return;
    const t = setInterval(() => setI((v) => (v + 1) % scenes.length), SCENE_MS);
    return () => clearInterval(t);
  }, [paused, reduced]);

  const scene = scenes[i].key;

  return (
    <figure
      className="relative mx-auto w-full max-w-[460px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Animated illustration of how AI254 processes a lecture"
    >
      <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-navy-700/30 via-page to-cyan-800/30 blur-[2px]" aria-hidden />
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-surface/80 shadow-2xl shadow-navy-900/10 backdrop-blur">
        {/* Header bar */}
        <div className="flex items-center justify-between bg-brand-gradient px-5 py-3 text-white">
          <span className="text-sm font-semibold">AI254 LIVE · BIO 101</span>
          <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulseDot" aria-hidden /> Live
          </span>
        </div>

        {/* Stage */}
        <div className="relative h-[300px] px-6 py-6">
          <div key={scene} className="absolute inset-0 animate-fadeUp px-6 py-6">
            {scene === "capture" && <Capture />}
            {scene === "transcribe" && <Typing text={EN} />}
            {scene === "translate" && <Translate />}
            {scene === "terms" && <Terms />}
            {scene === "devices" && <Devices />}
          </div>
        </div>

        {/* Steps */}
        <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300" aria-live="polite">
            {i + 1}. {scenes[i].label}
          </p>
          <div className="mt-2 flex gap-1.5" role="tablist" aria-label="Steps">
            {scenes.map((s, k) => (
              <button
                key={s.key}
                role="tab"
                aria-selected={k === i}
                aria-label={s.label}
                onClick={() => setI(k)}
                className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200"
              >
                <span
                  key={`${k}-${i}`}
                  className={`block h-full rounded-full bg-brand-gradient ${k < i ? "w-full" : k === i ? (paused || reduced ? "w-full" : "w-0 animate-[grow_3.6s_linear_forwards]") : "w-0"}`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-xs text-slate-500">Illustration using sample Biology 101 content.</figcaption>
    </figure>
  );
}

function Capture() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-cyan-400/30 animate-ping" aria-hidden />
        <span className="absolute inset-2 rounded-full bg-cyan-400/30" aria-hidden />
        <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-navy-500 text-white shadow-lg">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden><path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-2.08A7 7 0 0 0 19 12h-2Z" /></svg>
        </span>
      </div>
      <div className="flex h-16 w-full items-center justify-center gap-[3px]" aria-hidden>
        {Array.from({ length: 42 }).map((_, k) => (
          <span
            key={k}
            className="h-full w-[4px] origin-center rounded-full bg-gradient-to-t from-navy-500 to-cyan-500 animate-wave"
            style={{ animationDelay: `${(k * 97) % 900}ms`, animationDuration: `${650 + ((k * 61) % 500)}ms` }}
          />
        ))}
      </div>
      <p className="text-sm text-slate-600">Lecturer speaking in English</p>
    </div>
  );
}

function Typing({ text }: { text: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const words = text.split(" ");
    let w = 0;
    const t = setInterval(() => {
      w += 1;
      setN(words.slice(0, w).join(" ").length);
      if (w >= words.length) clearInterval(t);
    }, 230);
    return () => clearInterval(t);
  }, [text]);
  return (
    <div className="flex h-full flex-col justify-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Speech-to-text</p>
      <div className="mt-3 rounded-2xl border border-slate-200 bg-surface p-5 shadow-sm">
        <p className="text-lg leading-relaxed text-brand-ink">
          {text.slice(0, n)}
          <span className="ml-0.5 inline-block h-5 w-0.5 translate-y-1 bg-cyan-500 animate-pulseDot" aria-hidden />
        </p>
      </div>
      <div className="mt-4 flex gap-2 text-[11px] text-slate-500">
        <span className="rounded-full bg-slate-100 px-2.5 py-1">Audio chunk processed</span>
        <span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-cyan-300">Sentence detected</span>
      </div>
    </div>
  );
}

function Translate() {
  return (
    <div className="flex h-full flex-col justify-center gap-3">
      <div className="rounded-2xl border border-slate-200 bg-surface p-4 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">English</p>
        <p className="mt-1 text-[15px] text-slate-700">{EN}</p>
      </div>
      <div className="flex items-center justify-center gap-2 text-cyan-300" aria-hidden>
        <span className="h-px w-10 bg-gradient-to-r from-transparent to-cyan-400" />
        <svg viewBox="0 0 24 24" className="h-5 w-5 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 5v14m0 0-5-5m5 5 5-5" /></svg>
        <span className="h-px w-10 bg-gradient-to-l from-transparent to-cyan-400" />
      </div>
      <div className="animate-fadeUp rounded-2xl border-2 border-cyan-400 bg-cyan-400/10 p-4 shadow-sm [animation-delay:500ms]">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-cyan-300">Kiswahili</p>
        <p className="mt-1 text-[15px] font-semibold text-cyan-200" lang="sw">{SW}</p>
      </div>
    </div>
  );
}

function Terms() {
  return (
    <div className="flex h-full flex-col justify-center gap-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Biology glossary applied</p>
      {[
        ["Mitochondria", "Mitokondria"],
        ["Cellular respiration", "Upumuaji wa seli"],
      ].map(([en, sw], k) => (
        <div key={en} className="flex animate-fadeUp items-center justify-between rounded-xl border border-slate-200 bg-surface px-4 py-3 shadow-sm" style={{ animationDelay: `${k * 350}ms` }}>
          <span className="font-semibold">{en}</span>
          <span className="text-slate-400" aria-hidden>→</span>
          <span className="font-semibold text-cyan-200" lang="sw">{sw}</span>
        </div>
      ))}
      <p className="animate-fadeUp rounded-xl bg-amber-400/10 px-4 py-3 text-xs leading-relaxed text-amber-200 [animation-delay:800ms]">
        Not the same as breathing (“kupumua”). The translation keeps the scientific meaning.
      </p>
    </div>
  );
}

function Devices() {
  return (
    <div className="flex h-full items-end justify-center gap-2 sm:gap-3">
      {[0, 1, 2].map((k) => (
        <div
          key={k}
          className={`animate-fadeUp rounded-[1.4rem] border-[5px] border-bezel bg-bezel shadow-xl ${k === 1 ? "h-[220px] w-[112px] sm:h-[240px] sm:w-[132px]" : "h-[184px] w-[92px] sm:h-[200px] sm:w-[110px]"}`}
          style={{ animationDelay: `${k * 250}ms` }}
        >
          <div className="h-full overflow-hidden rounded-[1rem] bg-surface">
            <div className="bg-navy-500 px-2 py-1.5 text-[8px] font-semibold text-white">BIO 101 · Live</div>
            <div className="space-y-1.5 p-2">
              <p className="text-[7.5px] leading-snug text-slate-500">{EN}</p>
              <p className="rounded bg-cyan-400/10 p-1 text-[8.5px] font-semibold leading-snug text-cyan-200" lang="sw">{SW}</p>
              <p className="text-[7px] text-cyan-300">Upumuaji wa seli →</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
