"use client";

import { useEffect, useState } from "react";
import { BIOLOGY_TERMS, DEMO_SCRIPTS } from "@/lib/live/demo-content";

const script = DEMO_SCRIPTS[0];
const lines = script.segments.slice(2, 12);
const termByKey = Object.fromEntries(BIOLOGY_TERMS.map((t) => [t.key, t]));

/**
 * Illustrative depiction of AI254 LIVE: lecturer speaking (left) and a student phone (right).
 * Uses the sample Biology 101 demonstration script — clearly labelled as an illustration.
 */
export function HeroDemo() {
  const [i, setI] = useState(0);
  const [typed, setTyped] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const current = lines[i % lines.length];

  useEffect(() => {
    if (reduced) {
      setTyped(current.en.length);
      return;
    }
    setTyped(0);
    const words = current.en.split(" ");
    let w = 0;
    const t = setInterval(() => {
      w += 1;
      setTyped(words.slice(0, w).join(" ").length);
      if (w >= words.length) clearInterval(t);
    }, 160);
    return () => clearInterval(t);
  }, [i, current.en, reduced]);

  useEffect(() => {
    const t = setTimeout(() => setI((v) => v + 1), reduced ? 8000 : current.en.split(" ").length * 160 + 3600);
    return () => clearTimeout(t);
  }, [i, current.en, reduced]);

  const done = typed >= current.en.length;
  const history = [lines[(i + lines.length - 2) % lines.length], lines[(i + lines.length - 1) % lines.length]].filter(() => i > 0);
  const term = current.terms?.[0] ? termByKey[current.terms[0]] : undefined;

  return (
    <figure className="relative" aria-label="Illustration of AI254 LIVE during a Biology 101 lecture">
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-navy-50 via-white to-cyan-50" aria-hidden />

      <div className="grid items-end gap-4 sm:grid-cols-[1fr_auto]">
        {/* Lecturer console */}
        <div className="card overflow-hidden shadow-xl shadow-navy-900/5">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulseDot" aria-hidden />
              Lecturer · BIO 101
            </div>
            <span className="font-mono text-[11px] text-slate-500">Session BIO101</span>
          </div>
          <div className="p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-500 text-white" aria-hidden>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-2.08A7 7 0 0 0 19 12h-2Z" /></svg>
              </div>
              <Waveform active={!done} />
            </div>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">English transcription</p>
            <p className="mt-1.5 min-h-[4.5rem] text-[15px] leading-relaxed text-brand-ink">
              {current.en.slice(0, typed)}
              {!done && <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 bg-cyan-500 animate-pulseDot" />}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="rounded bg-slate-100 px-2 py-1">Audio capture</span>
              <span aria-hidden>→</span>
              <span className="rounded bg-slate-100 px-2 py-1">Speech-to-text</span>
              <span aria-hidden>→</span>
              <span className={`rounded px-2 py-1 ${done ? "bg-cyan-50 text-cyan-700" : "bg-slate-100"}`}>Kiswahili translation</span>
            </div>
          </div>
        </div>

        {/* Student phone */}
        <div className="mx-auto w-[270px] rounded-[2.2rem] border-[7px] border-brand-ink bg-brand-ink shadow-2xl shadow-navy-900/20 sm:mx-0">
          <div className="overflow-hidden rounded-[1.7rem] bg-white">
            <div className="flex items-center justify-between bg-navy-500 px-4 pb-2.5 pt-4 text-white">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-cyan-200">AI254 LIVE</p>
                <p className="text-sm font-semibold">Biology 101</p>
              </div>
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px]">● Live</span>
            </div>
            <div className="h-[330px] space-y-2.5 overflow-hidden bg-slate-50 p-3">
              {history.map((h, k) => (
                <div key={k} className="rounded-xl bg-white p-2.5 opacity-60 ring-1 ring-slate-200">
                  <p className="text-[11px] leading-snug text-slate-500">{h.en}</p>
                  <p className="mt-1 text-[12px] font-medium leading-snug text-navy-600">{h.sw}</p>
                </div>
              ))}
              <div className="rounded-xl bg-white p-2.5 ring-2 ring-cyan-400">
                <p className="text-[11px] leading-snug text-slate-600">{current.en.slice(0, typed)}</p>
                {done ? (
                  <p key={i} className="mt-1 animate-fadeUp text-[13px] font-semibold leading-snug text-navy-600" lang="sw">
                    {current.sw}
                  </p>
                ) : (
                  <p className="mt-1.5 flex gap-1" aria-hidden>
                    {[0, 1, 2].map((d) => (
                      <span key={d} className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulseDot" style={{ animationDelay: `${d * 0.2}s` }} />
                    ))}
                  </p>
                )}
              </div>
              {done && term && (
                <div key={`t${i}`} className="animate-fadeUp rounded-xl border border-cyan-200 bg-cyan-50 p-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-cyan-700">Istilahi · Term</p>
                  <p className="text-[12px] font-semibold text-brand-ink">
                    {term.english} → <span className="text-navy-600">{term.kiswahili}</span>
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-slate-600" lang="sw">{term.definitionSw}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-5 text-center text-xs text-slate-500 sm:text-left">
        Illustration using sample Biology 101 lecture content. Shows how AI254 LIVE presents the lecture; this is not recorded system output.
      </figcaption>
    </figure>
  );
}

function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex h-10 flex-1 items-center gap-[3px]" aria-hidden>
      {Array.from({ length: 36 }).map((_, k) => (
        <span
          key={k}
          className={`h-full w-[3px] origin-center rounded-full bg-gradient-to-t from-navy-500 to-cyan-500 ${active ? "animate-wave" : "scale-y-[0.12]"}`}
          style={{ animationDelay: `${(k * 137) % 900}ms`, animationDuration: `${700 + ((k * 53) % 500)}ms` }}
        />
      ))}
    </div>
  );
}
