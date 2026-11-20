"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BIOLOGY_TERMS, DEMO_SCRIPTS } from "@/lib/live/demo-content";
import { Avatar, MOTIONS, REST, fingerspell, mixPose, type Motion, type Pose } from "./avatar";

/**
 * Concept demo of AI254 KSL in a lecture: speech -> captions -> signing avatar,
 * and a student reply via the sensor glove. Fully scripted, with illustrative
 * (not authentic KSL) avatar motion, and labelled as such on the page.
 */

type Gloss = { word: string; motion: Motion; spelled?: boolean };
type LectureStep = { kind: "lecture"; en: string; sw: string; terms: string[]; glosses: Gloss[] };
type GloveStep = { kind: "glove"; sign: string; spoken: string; bends: number[] };
type Step = LectureStep | GloveStep;

const g = (word: string, motion: keyof typeof MOTIONS): Gloss => ({ word, motion: MOTIONS[motion] });
const fs = (word: string): Gloss => ({ word, motion: fingerspell(word), spelled: true });

const bio = DEMO_SCRIPTS[0].segments;
const termByKey = Object.fromEntries(BIOLOGY_TERMS.map((t) => [t.key, t]));

const STEPS: Step[] = [
  { kind: "lecture", ...bio[0], terms: bio[0].terms ?? [], glosses: [g("GOOD-MORNING", "greet"), g("ALL", "sweep"), g("TODAY", "today"), g("CELL", "cell"), g("LIFE", "life"), g("BASIC", "basic")] },
  { kind: "lecture", ...bio[2], terms: bio[2].terms ?? [], glosses: [g("CELL", "cell"), g("MEMBRANE", "surround"), g("CONTROL", "control"), g("IN-OUT", "inout")] },
  { kind: "lecture", ...bio[8], terms: bio[8].terms ?? [], glosses: [fs("MITOCHONDRIA"), g("GLUCOSE", "sweet"), g("ENERGY", "energy"), g("RELEASE", "release"), g("RESPIRATION", "breathe")] },
  { kind: "lecture", ...bio[9], terms: bio[9].terms ?? [], glosses: [g("THAT'S-WHY", "why"), fs("MITOCHONDRIA"), g("POWER", "energy"), g("HOUSE", "house"), g("CELL", "cell")] },
  { kind: "glove", sign: "repeat", spoken: "Could you repeat that, please?", bends: [0.9, 0.1, 0.1, 0.9, 0.9] },
  {
    kind: "lecture",
    en: "Of course. The mitochondria release the energy the cell needs. That is why we call them the powerhouse of the cell.",
    sw: "Bila shaka. Mitokondria hutoa nishati ambayo seli inahitaji. Ndiyo maana tunaziita kituo cha nishati cha seli.",
    terms: ["powerhouse"],
    glosses: [g("OF-COURSE", "yes"), fs("MITOCHONDRIA"), g("ENERGY", "energy"), g("CELL", "cell"), g("NEED", "need"), g("POWER", "energy"), g("HOUSE", "house")],
  },
  { kind: "glove", sign: "thank you", spoken: "Thank you, that's clear now.", bends: [0.6, 0, 0, 0, 0] },
];

// Timing (seconds)
const WORD = 0.3;          // lecturer speech pace
const SIGN_LAG = 1.1;      // avatar starts after the first words are recognised
const SIGN = 1.05;         // one sign
const SPELL = 1.9;         // a fingerspelled term
const TRANSITION = 0.22;   // fraction of a sign spent blending from the previous pose
const G = { read: 0.4, result: 2.3, confirm: 3.3, speak: 3.8, end: 6.4 };

type Timed = { step: Step; start: number; end: number; signs: { gloss: Gloss; start: number; end: number }[]; typed: number; swAt: number };

function buildTimeline(): { items: Timed[]; total: number } {
  let t = 0.6;
  const items: Timed[] = [];
  for (const step of STEPS) {
    if (step.kind === "glove") {
      items.push({ step, start: t, end: t + G.end, signs: [], typed: 0, swAt: 0 });
      t += G.end;
      continue;
    }
    const typed = step.en.split(" ").length * WORD;
    let s = SIGN_LAG;
    const signs = step.glosses.map((gloss) => {
      const d = gloss.spelled ? SPELL : SIGN;
      const item = { gloss, start: t + s, end: t + s + d };
      s += d;
      return item;
    });
    const swAt = typed + 0.6;
    const len = Math.max(swAt + 1.8, s + 0.7);
    items.push({ step, start: t, end: t + len, signs, typed, swAt });
    t += len + 0.3;
  }
  return { items, total: t + 2.5 };
}

function poseAt(items: Timed[], t: number): Pose {
  const signs = items.flatMap((i) => i.signs);
  let prev: Pose = REST;
  for (let k = 0; k < signs.length; k++) {
    const s = signs[k];
    if (t < s.start) {
      // Between signs: relax toward rest if the gap is long, otherwise hold.
      const gap = s.start - (k > 0 ? signs[k - 1].end : 0);
      if (gap > 1.2) return mixPose(prev, REST, Math.min(1, (t - (s.start - gap)) / 0.6));
      return prev;
    }
    if (t <= s.end) {
      const p = (t - s.start) / (s.end - s.start);
      const pose = s.gloss.motion(p);
      if (p < TRANSITION) {
        const from = k > 0 && s.start - signs[k - 1].end < 1.2 ? signs[k - 1].gloss.motion(1) : prev;
        const w = p / TRANSITION;
        return mixPose(from, pose, w * w * (3 - 2 * w));
      }
      return pose;
    }
    prev = s.gloss.motion(1);
  }
  return mixPose(prev, REST, Math.min(1, (t - (signs.at(-1)?.end ?? 0)) / 0.6));
}

function speak(text: string, who: "lecturer" | "student") {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-GB";
  u.rate = who === "lecturer" ? 1.0 : 1.05;
  u.pitch = who === "lecturer" ? 0.9 : 1.25;
  window.speechSynthesis.speak(u);
}

export function KslInAction() {
  const { items, total } = useMemo(buildTimeline, []);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [sound, setSound] = useState(false);
  const [started, setStarted] = useState(false);
  const tRef = useRef(0);
  const spoken = useRef(new Set<string>());
  const root = useRef<HTMLDivElement>(null);

  // Start automatically (muted) the first time the demo scrolls into view.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) { setStarted(true); setPlaying(true); }
    }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, [started]);

  useEffect(() => {
    if (!playing) return;
    let raf = 0, last = performance.now(), acc = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      tRef.current += dt;
      if (tRef.current >= total) { tRef.current = 0; spoken.current.clear(); }
      acc += dt;
      if (acc > 1 / 40) { acc = 0; setT(tRef.current); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, total]);

  const idx = items.findIndex((i) => t >= i.start && t < i.end + 0.3);
  const cur = idx >= 0 ? items[idx] : null;
  const local = cur ? t - cur.start : 0;
  const lastLecture = [...items].reverse().find((i) => i.step.kind === "lecture" && i.start <= t);

  // Voices
  useEffect(() => {
    if (!sound || !playing || !cur) return;
    const key = `${idx}`;
    if (cur.step.kind === "lecture" && !spoken.current.has(key)) {
      spoken.current.add(key);
      speak(cur.step.en, "lecturer");
    }
    if (cur.step.kind === "glove" && local >= G.speak && !spoken.current.has(key)) {
      spoken.current.add(key);
      speak(cur.step.spoken, "student");
    }
  }, [sound, playing, cur, idx, local]);

  const restart = useCallback(() => {
    window.speechSynthesis?.cancel();
    spoken.current.clear();
    tRef.current = 0;
    setT(0);
    setPlaying(true);
    setStarted(true);
  }, []);
  const toggle = () => { if (playing) window.speechSynthesis?.cancel(); setPlaying((p) => !p); setStarted(true); };
  const toggleSound = () => {
    if (sound) window.speechSynthesis?.cancel();
    else spoken.current = new Set(items.map((_, k) => `${k}`).filter((k) => Number(k) < idx || (Number(k) === idx && local > 0.5)));
    setSound((s) => !s);
  };

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const pose = poseAt(items, t);
  const blink = (() => { const c = t % 3.7; return c < 0.14 ? Math.sin((c / 0.14) * Math.PI) : 0; })();
  const signing = items.flatMap((i) => i.signs).find((s) => t >= s.start && t <= s.end);

  // Lecture view state
  const lec = cur?.step.kind === "lecture" ? cur : null;
  const lecStep = lec?.step as LectureStep | undefined;
  const words = lecStep ? lecStep.en.split(" ") : [];
  const typedWords = lec ? Math.min(words.length, Math.floor(local / WORD) + 1) : 0;
  const speaking = !!lec && local < lec.typed;
  const showSw = !!lec && local >= lec.swAt;
  const shownLecture = lec ?? (lastLecture && cur?.step.kind !== "glove" ? lastLecture : null);
  const term = lecStep && showSw ? termByKey[lecStep.terms.at(-1) ?? ""] : undefined;

  // Glove view state
  const glove = cur?.step.kind === "glove" ? (cur.step as GloveStep) : null;
  const gp = glove ? Math.min(1, Math.max(0, (local - G.read) / 1.4)) : 0;
  const stage = !glove ? "idle" : local < G.result ? "reading" : local < G.confirm ? "result" : local < G.speak ? "confirmed" : "spoken";
  const lastGlove = [...items].reverse().find((i) => i.step.kind === "glove" && i.start + G.speak <= t)?.step as GloveStep | undefined;

  const progress = t / total;
  const stageLabel = glove ? "Student replying with the glove" : speaking ? "Lecturer speaking" : signing ? "Avatar signing" : "Listening";

  return (
    <figure ref={root} aria-label="Concept demo of AI254 KSL in a Biology 101 lecture">
      <div className="relative">
        <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-navy-800/50 via-page to-cyan-900/30 sm:-inset-6" aria-hidden />
        <div className="grid gap-5 lg:grid-cols-12">
          {/* Lecturer console */}
          <div className="card flex flex-col overflow-hidden lg:col-span-5">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <span className={`h-2 w-2 rounded-full ${speaking ? "bg-red-500 animate-pulseDot" : "bg-slate-400"}`} aria-hidden />
                Lecturer · BIO 101
              </div>
              <span className="font-mono text-[11px] text-slate-500">Lecture hall</span>
            </div>
            <div className="flex flex-1 flex-col p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy-500 text-white" aria-hidden>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-2.08A7 7 0 0 0 19 12h-2Z" /></svg>
                </div>
                <Waveform active={speaking && playing} />
              </div>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Speech-to-text</p>
              <p className="mt-1.5 min-h-[6.5rem] text-[15px] leading-relaxed text-brand-ink sm:text-base">
                {shownLecture ? (shownLecture === lec ? words.slice(0, typedWords).join(" ") : (shownLecture.step as LectureStep).en) : <span className="text-slate-500">Listening…</span>}
                {speaking && <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 bg-cyan-500 animate-pulseDot" />}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                <Chip on={speaking}>Speech-to-text</Chip><span aria-hidden>→</span>
                <Chip on={showSw && !glove}>Kiswahili</Chip><span aria-hidden>→</span>
                <Chip on={!!signing}>KSL avatar</Chip>
              </div>

              <div className="mt-auto pt-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">From the student</p>
                <div className="mt-2 min-h-[64px] rounded-xl border border-slate-200 bg-page p-3">
                  {stage === "spoken" && glove ? (
                    <Speech text={glove.spoken} fresh />
                  ) : lastGlove ? (
                    <Speech text={lastGlove.spoken} />
                  ) : (
                    <p className="text-sm text-slate-500">The student&apos;s glove replies are spoken aloud here.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Student tablet */}
          <div className="lg:col-span-7">
            <div className="rounded-[1.8rem] border-[7px] border-bezel bg-bezel shadow-2xl shadow-navy-900/30">
              <div className="overflow-hidden rounded-[1.3rem] bg-surface">
                <div className="flex items-center justify-between bg-navy-500 px-4 py-2.5 text-white">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-cyan-200">AI254 LIVE · KSL</p>
                    <p className="text-sm font-semibold">Biology 101 · The Cell</p>
                  </div>
                  <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px]">● Live</span>
                </div>
                <div className="grid sm:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
                  {/* Avatar */}
                  <div className="relative bg-gradient-to-b from-navy-600 to-navy-800">
                    <div className="mx-auto aspect-[28/33] max-h-[360px] w-full">
                      <Avatar pose={pose} blink={blink} breathe={Math.sin(t * 1.7) * 1.4} look={signing ? Math.sin(t * 0.9) * 2 : 0} />
                    </div>
                    <div className="absolute left-3 top-3 rounded-full bg-black/35 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
                      KSL avatar
                    </div>
                    <div className="border-t border-white/10 bg-black/25 px-3 py-2.5">
                      <p className="sr-only">Signs</p>
                      <div className="flex min-h-[30px] flex-wrap gap-1.5">
                        {(lecStep ?? (lastLecture?.step as LectureStep | undefined))?.glosses.map((gl, k) => {
                          const timed = (lec ?? lastLecture)!.signs[k];
                          const active = signing === timed;
                          const done = t > timed.end;
                          return (
                            <span key={k} className={`rounded-md px-2 py-1 font-mono text-[10.5px] font-semibold tracking-wide transition-colors ${active ? "bg-cyan-500 text-white" : done ? "bg-white/15 text-white" : "bg-white/5 text-white/40"}`}>
                              {gl.word}{gl.spelled && <span className="ml-1 font-sans font-normal opacity-80">· spelled</span>}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Captions + glove */}
                  <div className="flex flex-col gap-3 bg-slate-50 p-4">
                    <div className="rounded-xl bg-surface p-3 ring-2 ring-cyan-400/70">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-cyan-300">Manukuu · Captions</p>
                      {shownLecture && cur?.step.kind !== "glove" ? (
                        <>
                          <p className="mt-1 text-[12px] leading-snug text-slate-500">{shownLecture === lec ? words.slice(0, typedWords).join(" ") : (shownLecture.step as LectureStep).en}</p>
                          {(shownLecture !== lec || showSw) ? (
                            <p key={idx} className="mt-1.5 animate-fadeUp text-[15px] font-semibold leading-snug text-cyan-300" lang="sw">{(shownLecture.step as LectureStep).sw}</p>
                          ) : (
                            <p className="mt-2 flex gap-1" aria-hidden>{[0, 1, 2].map((d) => <span key={d} className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulseDot" style={{ animationDelay: `${d * 0.2}s` }} />)}</p>
                          )}
                        </>
                      ) : (
                        <p className="mt-1 text-[13px] text-slate-500">{glove ? "Student is replying with the glove." : "Captions appear as the lecturer speaks."}</p>
                      )}
                    </div>

                    {term && (
                      <div key={`t${idx}`} className="animate-fadeUp rounded-xl border border-cyan-400/40 bg-cyan-400/10 p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-cyan-300">Istilahi · Term</p>
                        <p className="text-[13px] font-semibold text-brand-ink">{term.english} → <span className="text-cyan-300">{term.kiswahili}</span></p>
                        <p className="mt-0.5 text-[11.5px] leading-snug text-slate-600" lang="sw">{term.definitionSw}</p>
                      </div>
                    )}

                    <div className={`mt-auto rounded-xl border p-3 transition-colors ${glove ? "border-amber-300/50 bg-amber-400/10" : "border-slate-200 bg-surface"}`}>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Sensor glove</p>
                        <span className="flex items-center gap-1 text-[10px] text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />Connected</span>
                      </div>
                      <div className="mt-2 flex h-12 items-end gap-1.5" aria-hidden>
                        {["T", "I", "M", "R", "L"].map((f, k) => {
                          const target = glove ? glove.bends[k] : 0.08;
                          const v = glove ? 0.08 + (target - 0.08) * gp + (gp > 0 && gp < 1 ? Math.sin(t * 9 + k) * 0.03 : 0) : 0.08 + Math.sin(t * 1.3 + k) * 0.02;
                          return (
                            <div key={f} className="flex flex-1 flex-col items-center gap-1">
                              <div className="relative h-9 w-full overflow-hidden rounded bg-page">
                                <div className="absolute inset-x-0 bottom-0 bg-brand-gradient" style={{ height: `${Math.max(4, v * 100)}%` }} />
                              </div>
                              <span className="text-[9px] text-slate-500">{f}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-2 min-h-[40px] text-[12.5px]">
                        {stage === "idle" && <p className="text-slate-500">Ready. The student taps <em>Read one sign</em> to reply.</p>}
                        {stage === "reading" && <p className="text-slate-600">Reading sign…</p>}
                        {glove && stage !== "idle" && stage !== "reading" && (
                          <div className="animate-fadeUp">
                            <p className="font-semibold text-brand-ink">Recognised: <span className="text-cyan-300">“{glove.sign}”</span> <span className="font-normal text-slate-500">· 96%</span></p>
                            <p className="mt-0.5 text-slate-600">
                              {stage === "result" ? "Waiting for the student to confirm…" : stage === "confirmed" ? "✓ Confirmed by the student" : "🔊 Spoken to the lecturer"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button type="button" onClick={toggle} className="btn-cyan min-w-[118px]" aria-pressed={playing}>
            {playing ? <><PauseIcon /> Pause</> : <><PlayIcon /> {started ? "Resume" : "Play demo"}</>}
          </button>
          <button type="button" onClick={restart} className="btn-outline"><RestartIcon /> Restart</button>
          <button type="button" onClick={toggleSound} className="btn-outline" aria-pressed={sound}>
            {sound ? <><SoundOnIcon /> Voices on</> : <><SoundOffIcon /> Voices off</>}
          </button>
          <div className="flex min-w-[180px] flex-1 items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-label="Demo progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
              <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${progress * 100}%` }} />
            </div>
            <span className="whitespace-nowrap text-xs text-slate-500" aria-live="polite">{stageLabel}</span>
          </div>
        </div>
      </div>
      <figcaption className="mt-4 text-xs leading-relaxed text-slate-500">
        Concept demo with scripted Biology 101 content. The avatar&apos;s movements are an animated illustration, not authentic Kenyan Sign Language; AI254 KSL signing is being developed with Deaf KSL signers. Kiswahili lines were prepared by hand for illustration.
      </figcaption>
    </figure>
  );
}

function Chip({ on, children }: { on: boolean; children: React.ReactNode }) {
  return <span className={`rounded px-2 py-1 transition-colors ${on ? "bg-cyan-400/15 text-cyan-300" : "bg-slate-100"}`}>{children}</span>;
}

function Speech({ text, fresh }: { text: string; fresh?: boolean }) {
  return (
    <p className={`flex items-start gap-2 text-[15px] font-medium text-brand-ink ${fresh ? "animate-fadeUp" : "opacity-70"}`}>
      <span className="mt-0.5 text-cyan-300" aria-hidden><SoundOnIcon /></span>
      “{text}”
    </p>
  );
}

function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex h-11 flex-1 items-center gap-[3px]" aria-hidden>
      {Array.from({ length: 40 }).map((_, k) => (
        <span key={k}
          className={`h-full w-[3px] origin-center rounded-full bg-gradient-to-t from-navy-500 to-cyan-500 ${active ? "animate-wave" : "scale-y-[0.12]"}`}
          style={{ animationDelay: `${(k * 137) % 900}ms`, animationDuration: `${700 + ((k * 53) % 500)}ms` }} />
      ))}
    </div>
  );
}

const icon = "h-4 w-4";
const PlayIcon = () => <svg viewBox="0 0 24 24" className={icon} fill="currentColor" aria-hidden><path d="M8 5v14l11-7z" /></svg>;
const PauseIcon = () => <svg viewBox="0 0 24 24" className={icon} fill="currentColor" aria-hidden><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg>;
const RestartIcon = () => <svg viewBox="0 0 24 24" className={icon} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" /></svg>;
const SoundOnIcon = () => <svg viewBox="0 0 24 24" className={icon} fill="currentColor" aria-hidden><path d="M4 9v6h4l5 4V5L8 9H4zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z" /></svg>;
const SoundOffIcon = () => <svg viewBox="0 0 24 24" className={icon} fill="currentColor" aria-hidden><path d="M4 9v6h4l5 4V5L8 9H4zm15.6 3 2.1-2.1-1.4-1.4-2.1 2.1-2.1-2.1-1.4 1.4 2.1 2.1-2.1 2.1 1.4 1.4 2.1-2.1 2.1 2.1 1.4-1.4z" /></svg>;
