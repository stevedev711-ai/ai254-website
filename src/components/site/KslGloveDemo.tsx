"use client";

import { useEffect, useRef, useState } from "react";
import { classify, simulate, FRAMES, type DemoModel, type DemoSigns, type Frame, type Reading } from "@/lib/ksl/classifier";

const FINGERS = ["Thumb", "Index", "Middle", "Ring", "Little"];
const AXES = [
  { name: "side to side", color: "#55BFEC" },
  { name: "forward and back", color: "#FBBF24" },
  { name: "up and down", color: "#B3C2E6" },
];
const CHOICES = [
  { value: "hello", label: "Sign “hello”" },
  { value: "thank you", label: "Sign “thank you”" },
  { value: "question", label: "Sign “question”" },
  { value: "repeat", label: "Sign “repeat”" },
  { value: "near", label: "Something close, but wrong" },
  { value: "rest", label: "Rest the hand" },
];

type State = "loading" | "error" | "idle" | "reading" | "done";

export function KslGloveDemo() {
  const [model, setModel] = useState<DemoModel | null>(null);
  const [signs, setSigns] = useState<DemoSigns | null>(null);
  const [state, setState] = useState<State>("loading");
  const [choice, setChoice] = useState(CHOICES[0].value);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [reading, setReading] = useState<Reading | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/ksl-demo/model.json").then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
      fetch("/ksl-demo/signs.json").then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
    ])
      .then(([m, s]) => { setModel(m); setSigns(s.signs); setState("idle"); })
      .catch(() => setState("error"));
    return () => {
      if (timer.current) clearTimeout(timer.current);
      if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  function read() {
    if (!model || !signs || state === "reading") return;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    const all = simulate(signs, choice);
    setReading(null);
    setState("reading");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let t = reduced ? FRAMES : 1;
    const step = () => {
      setFrames(all.slice(0, t));
      if (t < FRAMES) {
        t++;
        timer.current = setTimeout(step, 50); // 20 frames per second, like the glove
        return;
      }
      setReading(classify(model, all));
      setState("done");
    };
    step();
  }

  function speak() {
    if (!reading?.phrase || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(reading.phrase);
    u.lang = "en";
    window.speechSynthesis.speak(u);
  }

  const latest = frames[frames.length - 1];
  const canSpeak = state === "done" && !!reading?.phrase && typeof window !== "undefined" && !!window.speechSynthesis;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      <div className="card flex flex-col gap-4 self-start p-6 sm:p-8">
        <label htmlFor="ksl-demo-sign" className="label text-base">What should the simulated hand do?</label>
        <select
          id="ksl-demo-sign"
          className="input"
          value={choice}
          onChange={(e) => { setChoice(e.target.value); setReading(null); if (state === "done") setState("idle"); }}
          disabled={state === "reading"}
        >
          {CHOICES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <button type="button" className="btn-cyan py-3.5 text-base" onClick={read} disabled={!model || state === "reading"}>
          Read one sign
        </button>
        <div
          role="status"
          aria-live="polite"
          className="flex min-h-[104px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-page p-4 text-center"
        >
          {state === "loading" && <span className="text-slate-500">Loading the demo model…</span>}
          {state === "error" && <span className="font-semibold text-red-300">The demo model could not be loaded.</span>}
          {state === "idle" && <span className="text-slate-500">Press “Read one sign” to start.</span>}
          {state === "reading" && <span className="text-slate-600">Sign now… reading two seconds of sensor data</span>}
          {state === "done" && (reading?.phrase
            ? <span className="font-display text-3xl font-extrabold text-cyan-300">{reading.phrase}</span>
            : <span className="text-lg font-semibold text-amber-200">Sign unclear. Try again.</span>)}
        </div>
        <button type="button" className="btn-outline py-3.5 text-base" onClick={speak} disabled={!canSpeak}>
          Speak recognised phrase
        </button>
        <p className="text-sm leading-relaxed text-slate-500">
          The app never speaks on its own. The student checks the phrase on screen first, then chooses to speak it.
        </p>
      </div>

      <div className="card min-w-0 p-6 sm:p-8">
        <h3 className="text-base font-semibold">Finger bend</h3>
        <div className="mt-3 grid grid-cols-5 gap-3">
          {FINGERS.map((name, i) => {
            const bend = latest ? Math.min(100, Math.max(0, ((1 - latest[i] / 4095) / 0.7) * 100)) : 0;
            return (
              <div key={name} className="flex flex-col items-center gap-1.5 text-xs text-slate-500">
                <div className="relative h-24 w-full max-w-[44px] overflow-hidden rounded-lg border border-slate-200 bg-page">
                  <div className="absolute inset-x-0 bottom-0 bg-brand-gradient" style={{ height: `${bend}%` }} />
                </div>
                {name}
              </div>
            );
          })}
        </div>

        <h3 className="mt-6 text-base font-semibold">Hand movement</h3>
        <MotionChart frames={frames} />
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          {AXES.map((a) => (
            <span key={a.name} className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <i className="inline-block h-1 w-3.5 rounded" style={{ background: a.color }} />{a.name}
            </span>
          ))}
        </div>

        <h3 className="mt-6 text-base font-semibold">Classifier confidence</h3>
        <div className="mt-3 grid gap-2">
          {(model?.labels ?? []).map((label, i) => {
            const p = reading ? reading.probs[i] : 0;
            const win = !!reading && i === reading.best && i !== 0 && p >= (model?.threshold ?? 1);
            return (
              <div key={label} className="grid grid-cols-[7.5em_minmax(0,1fr)_3em] items-center gap-3 text-sm">
                <span className="text-slate-700">{label === "_unknown" ? "not a sign" : label}</span>
                <span className="relative h-3.5 overflow-hidden rounded-full border border-slate-200 bg-page">
                  <i className={`absolute inset-y-0 left-0 rounded-full ${win ? "bg-cyan-500" : "bg-slate-400"}`} style={{ width: `${p * 100}%` }} />
                  <i className="absolute inset-y-0 left-[85%] w-0.5 bg-slate-800/60" aria-hidden />
                </span>
                <span className="text-right tabular-nums text-slate-500">{reading ? `${Math.round(p * 100)}%` : "–"}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-sm text-slate-500">Phrases below the 85% line are rejected as unclear rather than guessed.</p>
      </div>
    </div>
  );
}

function MotionChart({ frames }: { frames: Frame[] }) {
  const w = 400, h = 140;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 block h-36 w-full rounded-lg border border-slate-200 bg-page" preserveAspectRatio="none" role="img" aria-label="Hand acceleration over the two-second reading">
      <line x1="0" y1={h / 2} x2={w} y2={h / 2} stroke="#233866" strokeWidth="1" />
      {frames.length > 1 && AXES.map((axis, a) => (
        <polyline
          key={axis.name}
          fill="none"
          stroke={axis.color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          points={frames.map((f, t) => {
            const v = (f[5 + a] - (a === 2 ? 16384 : 0)) / 9000; // remove gravity from the vertical axis
            return `${((t / (FRAMES - 1)) * (w - 8) + 4).toFixed(1)},${(h / 2 - v * (h / 2 - 8)).toFixed(1)}`;
          }).join(" ")}
        />
      ))}
    </svg>
  );
}
