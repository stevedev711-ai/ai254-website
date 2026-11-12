"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAudioCapture } from "./useAudioCapture";

type Session = {
  id: string;
  code: string;
  title: string;
  courseCode: string;
  subject: string;
  introduction: string | null;
  summary: string | null;
  status: "SCHEDULED" | "LIVE" | "PAUSED" | "ENDED";
  mode: "DEMO" | "LIVE";
  micEnabled: boolean;
  studentMicEnabled: boolean;
  startedAt: string | null;
  endedAt: string | null;
};
type Seg = { seq: number; english: string; kiswahili: string | null; source: string; at: string };
type Q = { id: string; admissionNumber: string; university: string | null; language: string; text: string; answered: boolean; createdAt: string };

export function LecturerConsole({ initial, joinUrl, qr, liveAvailable }: { initial: Session; joinUrl: string; qr: string; liveAvailable: boolean }) {
  const [session, setSession] = useState<Session>(initial);
  const [segs, setSegs] = useState<Seg[]>([]);
  const [connected, setConnected] = useState(0);
  const [questions, setQuestions] = useState<Q[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showQr, setShowQr] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const lastSeq = useRef(0);
  const outRef = useRef<HTMLDivElement>(null);

  const capturing = session.mode === "LIVE" && session.status === "LIVE" && session.micEnabled;
  const audio = useAudioCapture(session.id, capturing && liveAvailable);

  // Poll feed + questions
  useEffect(() => {
    let stop = false;
    let t: ReturnType<typeof setTimeout>;
    const tick = async () => {
      try {
        const r = await fetch(`/api/live/sessions/${session.id}/feed?after=${lastSeq.current}`, { cache: "no-store" });
        const d = await r.json();
        if (d.ok) {
          setConnected(d.connected);
          setSession((s) => ({ ...s, ...d.session }));
          if (d.reset) {
            lastSeq.current = 0;
            setSegs([]);
          } else if (d.segments.length) {
            lastSeq.current = d.segments[d.segments.length - 1].seq;
            setSegs((p) => [...p, ...d.segments]);
          }
        }
        const qr = await fetch(`/api/live/sessions/${session.id}/questions`, { cache: "no-store" }).then((x) => x.json());
        if (qr.ok) setQuestions(qr.questions);
      } catch {}
      if (!stop) t = setTimeout(tick, 2500);
    };
    tick();
    return () => {
      stop = true;
      clearTimeout(t);
    };
  }, [session.id]);

  useEffect(() => {
    outRef.current?.scrollTo({ top: outRef.current.scrollHeight, behavior: "smooth" });
  }, [segs.length]);

  const patch = useCallback(
    async (body: Record<string, unknown>, label: string) => {
      setBusy(label);
      setError("");
      try {
        const r = await fetch(`/api/lecturer/sessions/${session.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const d = await r.json();
        if (!d.ok) throw new Error(d.error);
        setSession((s) => ({ ...s, ...d.session }));
      } catch (e) {
        setError((e as Error).message || "Update failed");
      } finally {
        setBusy(null);
      }
    },
    [session.id],
  );

  async function markAnswered(q: Q) {
    await fetch(`/api/live/sessions/${session.id}/questions`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionId: q.id, answered: !q.answered }) });
    setQuestions((qs) => qs.map((x) => (x.id === q.id ? { ...x, answered: !x.answered } : x)));
  }

  const ended = session.status === "ENDED";
  const openQs = questions.filter((q) => !q.answered).length;

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/live/lecturer" className="text-sm text-slate-500 hover:text-cyan-300">← All sessions</Link>
          <h1 className="mt-1 text-2xl font-bold">{session.title}</h1>
          <p className="text-sm text-slate-500">{session.courseCode} · {session.subject}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {session.mode === "DEMO" && <span className="demo-badge">Demonstration session · sample content</span>}
          <span className={`badge ${session.status === "LIVE" ? "bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/30" : session.status === "PAUSED" ? "bg-amber-400/10 text-amber-200" : "bg-slate-100 text-slate-700"}`}>
            {session.status === "LIVE" && <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulseDot" />}
            {{ SCHEDULED: "Not started", LIVE: "Live", PAUSED: "Paused", ENDED: "Ended" }[session.status]}
          </span>
        </div>
      </div>

      {error && <p role="alert" className="mt-4 rounded-lg bg-red-400/10 p-3 text-sm text-red-300">{error}</p>}

      <div className="mt-6 grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Controls */}
        <div className="space-y-4">
          <section className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Students join with</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="font-mono text-3xl font-bold tracking-[0.2em] text-cyan-300">{session.code}</p>
              <button onClick={() => setShowQr(true)} className="btn-outline btn-sm">Show QR</button>
            </div>
            <p className="mt-1 break-all text-xs text-slate-500">{joinUrl}</p>
            <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5">
              <span className="text-sm text-slate-600">Connected students</span>
              <span className="text-xl font-bold" aria-live="polite">{connected}</span>
            </div>
          </section>

          <section className="card space-y-4 p-5" aria-label="Session controls">
            {session.status === "SCHEDULED" && (
              <button onClick={() => patch({ action: "start" }, "start")} disabled={!!busy} className="btn-primary w-full py-3.5 text-base">
                {busy === "start" ? "Starting…" : "Start live session"}
              </button>
            )}
            {session.status === "LIVE" && (
              <button onClick={() => patch({ action: "pause" }, "pause")} disabled={!!busy} className="btn-outline w-full">Stop (pause) session</button>
            )}
            {session.status === "PAUSED" && (
              <button onClick={() => patch({ action: "resume", micEnabled: true }, "resume")} disabled={!!busy} className="btn-primary w-full">Resume live session</button>
            )}

            <Switch
              label="Lecturer microphone"
              hint={session.mode === "DEMO" ? "In demo mode this starts/stops the sample lecture" : audio.state === "capturing" ? "Capturing audio" : audio.state === "requesting" ? "Waiting for microphone permission…" : "Audio is not being captured"}
              on={session.micEnabled}
              disabled={ended || session.status !== "LIVE" || !!busy}
              onChange={(v) => patch({ micEnabled: v }, "mic")}
            />
            {capturing && (
              <div className="h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden>
                <div className="h-full bg-brand-gradient transition-[width] duration-100" style={{ width: `${Math.min(100, audio.level * 160)}%` }} />
              </div>
            )}
            {audio.error && <p className="text-xs text-red-300">{audio.error}</p>}
            {session.mode === "LIVE" && (audio.stats.sent > 0 || audio.stats.failed > 0) && (
              <p className="text-xs text-slate-500">Audio chunks processed: {audio.stats.sent}{audio.stats.failed ? ` · failed: ${audio.stats.failed}` : ""}</p>
            )}
            <Switch
              label="Student microphones"
              hint="Allow students to ask spoken questions"
              on={session.studentMicEnabled}
              disabled={ended || !!busy}
              onChange={(v) => patch({ studentMicEnabled: v }, "smic")}
            />

            {!ended && (
              <div className="border-t border-slate-100 pt-4">
                {confirmEnd ? (
                  <div className="space-y-2">
                    <p className="text-sm text-slate-700">End the lecture for all students? This cannot be undone.</p>
                    <div className="flex gap-2">
                      <button onClick={() => { setConfirmEnd(false); patch({ action: "end" }, "end"); }} className="btn-danger btn-sm flex-1">End session</button>
                      <button onClick={() => setConfirmEnd(false)} className="btn-outline btn-sm flex-1">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setConfirmEnd(true)} className="btn-outline w-full border-red-400/40 text-red-300 hover:border-red-400 hover:text-red-300">End lecture session</button>
                )}
              </div>
            )}
          </section>

          <section className="card p-5" aria-labelledby="q-h">
            <h2 id="q-h" className="text-sm font-bold">Student questions {openQs > 0 && <span className="ml-1 rounded-full bg-cyan-500 px-2 py-0.5 text-xs text-white">{openQs}</span>}</h2>
            {questions.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No questions yet.</p>
            ) : (
              <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto">
                {questions.map((q) => (
                  <li key={q.id} className={`rounded-lg border p-3 text-sm ${q.answered ? "border-slate-100 bg-slate-50 text-slate-500" : "border-slate-200"}`}>
                    <p lang={q.language}>{q.text}</p>
                    <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500">
                      <span>{q.admissionNumber}{q.university ? ` · ${q.university}` : ""} · {q.language === "sw" ? "Kiswahili" : "English"} · {new Date(q.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      <button onClick={() => markAnswered(q)} className="font-semibold text-cyan-300 hover:underline">{q.answered ? "Reopen" : "Mark answered"}</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Output */}
        <section className="card flex min-h-[520px] flex-col overflow-hidden" aria-labelledby="out-h">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
            <h2 id="out-h" className="text-sm font-bold">Transcription and translation output</h2>
            <span className="text-xs text-slate-500">{segs.length} statements</span>
          </div>
          <div className="hidden grid-cols-2 border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 md:grid">
            <p className="px-5 py-2.5">English transcription</p>
            <p className="border-l border-slate-200 px-5 py-2.5">Kiswahili (as students see it)</p>
          </div>
          <div ref={outRef} className="max-h-[70vh] flex-1 overflow-y-auto">
            {segs.length === 0 && (
              <p className="p-10 text-center text-sm text-slate-500">
                {session.status === "SCHEDULED" ? "Start the session to begin." : !session.micEnabled ? "Microphone is off. Turn it on to begin capture." : session.mode === "LIVE" ? "Listening… statements appear here once the speech service returns them." : "The sample lecture will begin in a few seconds…"}
              </p>
            )}
            {segs.map((s) => (
              <div key={s.seq} className="grid border-b border-slate-100 text-[15px] md:grid-cols-2">
                <p className="px-5 py-3 text-slate-700"><span className="mr-2 font-mono text-xs text-slate-400">{s.seq}</span>{s.english}</p>
                <p className="border-slate-100 px-5 pb-3 text-cyan-200 md:border-l md:py-3" lang="sw">{s.kiswahili ?? <em className="text-sm text-red-300">Translation failed (see admin logs)</em>}</p>
              </div>
            ))}
          </div>
          {session.mode === "DEMO" && <p className="border-t border-amber-400/30 bg-amber-400/10 px-5 py-2 text-xs text-amber-200">Demonstration session: sample statements and hand-prepared translations. Microphone audio is not processed.</p>}
        </section>
      </div>

      {showQr && (
        <div role="dialog" aria-modal="true" aria-label="Session QR code" className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setShowQr(false)}>
          <div className="rounded-2xl bg-white p-8 text-center text-[#111111]" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt={`QR code to join session ${session.code}`} className="mx-auto h-72 w-72 sm:h-96 sm:w-96" />
            <p className="mt-4 font-mono text-4xl font-bold tracking-[0.3em] text-[#264AA0]">{session.code}</p>
            <p className="mt-1 text-sm text-[#475569]">{session.courseCode} · {session.title}</p>
            <button autoFocus onClick={() => setShowQr(false)} className="btn-outline mt-5">Close</button>
          </div>
        </div>
      )}
    </main>
  );
}

function Switch({ label, hint, on, disabled, onChange }: { label: string; hint?: string; on: boolean; disabled?: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        {hint && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
      <button
        role="switch"
        aria-checked={on}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!on)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-40 ${on ? "bg-cyan-500" : "bg-slate-300"}`}
      >
        <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}
