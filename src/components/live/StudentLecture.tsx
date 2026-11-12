"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { clearJoin, lastAdmission, lastUniversity, loadJoin, saveJoin, type StoredJoin } from "@/lib/live/client";
import { isKnownUniversity, OTHER_UNIVERSITY } from "@/lib/universities";
import { UniversitySelect, universityValue } from "./UniversitySelect";
import { useSpeechInput } from "./useSpeechInput";
import { LectureEnded } from "./LectureEnded";

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
  lecturer: { name: string } | null;
};
type Seg = { seq: number; english: string; kiswahili: string | null; termIds: string[]; source: "DEMO" | "LIVE"; at: string };
type Term = { id: string; english: string; kiswahili: string; definitionEn: string | null; definitionSw: string | null; usageNote: string | null; status: string };
type View = "both" | "sw" | "en";
type Panel = "lecture" | "terms" | "notes" | "ask";

export function StudentLecture({ code }: { code: string }) {
  const [join, setJoin] = useState<StoredJoin | null | undefined>(undefined);
  const [session, setSession] = useState<Session | null>(null);
  const [segs, setSegs] = useState<Seg[]>([]);
  const [terms, setTerms] = useState<Record<string, Term>>({});
  const [conn, setConn] = useState<"ok" | "retrying">("ok");
  const [left, setLeft] = useState(false);
  const [view, setView] = useState<View>("both");
  const [size, setSize] = useState(1);
  const [panel, setPanel] = useState<Panel>("lecture");
  const [activeTerm, setActiveTerm] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const lastSeq = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);
  const [follow, setFollow] = useState(true);

  useEffect(() => setJoin(loadJoin(code)), [code]);

  const notesKey = join ? `ai254.notes.${code}.${join.admissionNumber}` : null;
  useEffect(() => {
    if (!notesKey) return;
    try {
      setNotes(localStorage.getItem(notesKey) ?? "");
    } catch {}
  }, [notesKey]);
  useEffect(() => {
    if (!notesKey) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(notesKey, notes);
      } catch {}
    }, 400);
    return () => clearTimeout(t);
  }, [notes, notesKey]);

  // Poll the session feed
  useEffect(() => {
    if (!join || left) return;
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      try {
        const res = await fetch(`/api/live/sessions/${join.sessionId}/feed?after=${lastSeq.current}`, { headers: { "x-participant-token": join.token }, cache: "no-store" });
        if (res.status === 401) {
          setLeft(true);
          return;
        }
        const d = await res.json();
        if (!d.ok) throw new Error(d.error);
        setConn("ok");
        setSession(d.session);
        if (d.reset) {
          lastSeq.current = 0;
          setSegs([]);
        } else if (d.segments.length) {
          lastSeq.current = d.segments[d.segments.length - 1].seq;
          setSegs((prev) => [...prev, ...d.segments]);
        }
        if (d.terms.length) setTerms((prev) => ({ ...prev, ...Object.fromEntries(d.terms.map((t: Term) => [t.id, t])) }));
        if (d.session.status === "ENDED") return;
      } catch {
        setConn("retrying");
      }
      if (!stop) timer = setTimeout(tick, document.hidden ? 6000 : 2000);
    };
    tick();
    return () => {
      stop = true;
      clearTimeout(timer);
    };
  }, [join, left]);

  // Auto-scroll to newest statement unless the student scrolled up
  useEffect(() => {
    if (follow) listRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [segs.length, follow]);

  const onScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    setFollow(el.scrollHeight - el.scrollTop - el.clientHeight < 80);
  }, []);

  async function leave() {
    if (!join) return;
    await fetch(`/api/live/sessions/${join.sessionId}/leave`, { method: "POST", headers: { "x-participant-token": join.token } }).catch(() => null);
    clearJoin(code);
    setLeft(true);
  }

  const seenTerms = useMemo(() => {
    const ids: string[] = [];
    for (const s of [...segs].reverse()) for (const id of s.termIds) if (!ids.includes(id) && terms[id]) ids.push(id);
    return ids.map((id) => terms[id]);
  }, [segs, terms]);

  if (join === undefined) return <Centered>Loading…</Centered>;
  if (join === null || left) return <Rejoin code={code} left={left} onJoined={(j) => { setLeft(false); lastSeq.current = 0; setSegs([]); setJoin(j); }} />;
  if (!session) return <Centered>{conn === "retrying" ? "Connecting to the lecture…" : "Loading lecture…"}</Centered>;

  const fontPx = [15, 17, 19, 22][size];
  const latest = segs[segs.length - 1];

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col lg:h-[calc(100vh-3.5rem-3.25rem)] lg:flex-row">
      {/* Main lecture column */}
      <section className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-slate-200 bg-surface px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {session.courseCode} · {session.subject} · Code <span className="font-mono">{session.code}</span>
              </p>
              <h1 className="truncate text-lg font-bold sm:text-xl">{session.title}</h1>
              <p className="text-xs text-slate-500">
                {session.lecturer?.name ?? (session.mode === "DEMO" ? "Demonstration lecture" : "")}
                {session.startedAt && ` · started ${new Date(session.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`} · Joined as <span className="font-mono">{join.admissionNumber}</span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {session.mode === "DEMO" && <span className="demo-badge">Demonstration · sample content</span>}
              <StatusPill status={session.status} mic={session.micEnabled} />
              {conn === "retrying" && <span className="badge bg-amber-400/10 text-amber-200">Reconnecting…</span>}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg bg-slate-100 p-1 text-xs font-medium" role="group" aria-label="Language display">
              {([["both", "English + Kiswahili"], ["sw", "Kiswahili"], ["en", "English"]] as const).map(([v, l]) => (
                <button key={v} onClick={() => setView(v)} aria-pressed={view === v} className={`rounded-md px-3 py-1.5 ${view === v ? "bg-surface shadow-sm" : "text-slate-600"}`}>{l}</button>
              ))}
            </div>
            <div className="flex items-center rounded-lg bg-slate-100 p-1 text-xs font-semibold" role="group" aria-label="Text size">
              <button className="rounded-md px-2.5 py-1.5 disabled:opacity-40" onClick={() => setSize((s) => Math.max(0, s - 1))} disabled={size === 0} aria-label="Smaller text">A−</button>
              <button className="rounded-md px-2.5 py-1.5 disabled:opacity-40" onClick={() => setSize((s) => Math.min(3, s + 1))} disabled={size === 3} aria-label="Larger text">A+</button>
            </div>
            {session.status === "ENDED" ? (
              <Link href="/live/student" className="btn-outline btn-sm ml-auto">Choose another lecture</Link>
            ) : (
              <button onClick={leave} className="btn-outline btn-sm ml-auto">Leave session</button>
            )}
          </div>
        </div>

        {/* Mobile panel tabs */}
        <nav className="sticky top-14 z-30 grid grid-cols-4 border-b border-slate-200 bg-surface text-xs font-semibold lg:hidden" aria-label="Lecture panels">
          {([["lecture", "Lecture"], ["terms", `Terms${seenTerms.length ? ` (${seenTerms.length})` : ""}`], ["notes", "Notes"], ["ask", "Ask"]] as const).map(([p, l]) => (
            <button key={p} onClick={() => setPanel(p)} aria-pressed={panel === p} className={`border-b-2 py-3 ${panel === p ? "border-cyan-500 text-cyan-300" : "border-transparent text-slate-500"}`}>{l}</button>
          ))}
        </nav>

        <div className={`${panel === "lecture" ? "flex" : "hidden"} min-h-0 flex-1 flex-col lg:flex`}>
          <div ref={listRef} onScroll={onScroll} className="min-h-[50vh] flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-6" aria-live="polite" aria-relevant="additions">
            {session.introduction && (
              <details open={segs.length < 3} className="rounded-xl border border-navy-400/30 bg-navy-400/10 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-cyan-200">Lesson introduction</summary>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{session.introduction}</p>
              </details>
            )}
            {segs.length === 0 && session.status !== "ENDED" && (
              <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                {session.status === "PAUSED" ? "The lecturer has paused the session." : !session.micEnabled ? "The lecturer's microphone is off. Statements will appear here when capture resumes." : "Waiting for the lecturer… statements will appear here as they are spoken."}
              </div>
            )}
            {segs.map((s) => (
              <article key={s.seq} className={`group rounded-xl border bg-surface p-4 transition ${s === latest && session.status === "LIVE" ? "border-cyan-400 shadow-sm" : "border-slate-200"}`}>
                {view !== "sw" && <p className={view === "both" ? "text-slate-600" : "text-brand-ink"} style={{ fontSize: view === "both" ? fontPx - 2 : fontPx, lineHeight: 1.55 }}>{s.english}</p>}
                {view !== "en" && (
                  <p lang="sw" className={`font-medium text-cyan-200 ${view === "both" ? "mt-1.5" : ""}`} style={{ fontSize: fontPx, lineHeight: 1.55 }}>
                    {s.kiswahili ?? <span className="text-sm font-normal italic text-slate-400">Translation unavailable for this statement</span>}
                  </p>
                )}
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  {s.termIds.map((id) => terms[id] && (
                    <button key={id} onClick={() => { setActiveTerm(id); setPanel("terms"); }} className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-xs font-medium text-cyan-300 ring-1 ring-cyan-400/40 hover:bg-cyan-400/20">
                      {terms[id].english} → {terms[id].kiswahili}
                    </button>
                  ))}
                  <button
                    onClick={() => setNotes((n) => `${n}${n && !n.endsWith("\n") ? "\n" : ""}• ${s.english}\n  ${s.kiswahili ?? ""}\n`)}
                    className="ml-auto rounded-md px-2 py-1 text-xs text-slate-500 opacity-100 hover:bg-slate-100 hover:text-cyan-300 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                  >
                    + Add to notes
                  </button>
                </div>
              </article>
            ))}
            {session.status === "ENDED" && <LectureEnded session={session} join={join} />}
          </div>
          {!follow && (
            <button onClick={() => { setFollow(true); listRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth" }); }} className="btn-cyan btn-sm mx-auto mb-3 shadow-lg">
              ↓ Jump to latest
            </button>
          )}
          {session.mode === "DEMO" && (
            <p className="border-t border-amber-400/30 bg-amber-400/10 px-4 py-2 text-center text-xs text-amber-200">
              Demonstration session: sample lecture statements and hand-prepared translations, not AI254 system output.
            </p>
          )}
        </div>
      </section>

      {/* Sidebar */}
      <aside className={`${panel === "lecture" ? "hidden" : "block"} w-full shrink-0 space-y-4 overflow-y-auto border-l border-slate-200 bg-surface p-4 sm:p-5 lg:block lg:w-[380px]`}>
        <div className={panel === "ask" ? "" : "hidden lg:block"}>
          <AskPanel join={join} allowMic={session.studentMicEnabled} ended={session.status === "ENDED"} />
        </div>
        <div className={panel === "notes" ? "" : "hidden lg:block"}>
          <NotesPanel notes={notes} setNotes={setNotes} session={session} />
        </div>
        <div className={panel === "terms" ? "" : "hidden lg:block"}>
          <TermsPanel terms={seenTerms} activeId={activeTerm} />
        </div>
        {session.summary && session.status !== "ENDED" && (
          <details className={`${panel === "lecture" ? "" : "hidden lg:block"} rounded-xl bg-slate-50 p-4`}>
            <summary className="cursor-pointer text-sm font-semibold">Lesson summary</summary>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{session.summary}</p>
          </details>
        )}
      </aside>
    </div>
  );
}

function StatusPill({ status, mic }: { status: Session["status"]; mic: boolean }) {
  if (status === "LIVE" && mic) return <span className="badge bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/30"><span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulseDot" />Live</span>;
  if (status === "LIVE") return <span className="badge bg-slate-100 text-slate-700">Live · mic off</span>;
  if (status === "PAUSED") return <span className="badge bg-amber-400/10 text-amber-200">Paused</span>;
  if (status === "ENDED") return <span className="badge bg-slate-100 text-slate-700">Ended</span>;
  return <span className="badge bg-slate-100 text-slate-700">Not started</span>;
}

function TermsPanel({ terms, activeId }: { terms: Term[]; activeId: string | null }) {
  const activeRef = useRef<HTMLLIElement>(null);
  useEffect(() => activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }), [activeId]);
  return (
    <section aria-labelledby="terms-h">
      <h2 id="terms-h" className="text-sm font-bold">Scientific terms in this lecture</h2>
      {terms.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">Terms with glossary explanations will appear here as the lecturer uses them.</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {terms.map((t) => (
            <li key={t.id} ref={t.id === activeId ? activeRef : undefined} className={`rounded-xl border p-3.5 ${t.id === activeId ? "border-cyan-400 bg-cyan-400/10" : "border-slate-200"}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="font-semibold">{t.english}</p>
                <p className="font-semibold text-cyan-200" lang="sw">{t.kiswahili}</p>
              </div>
              {t.definitionSw && <p className="mt-1.5 text-sm text-slate-700" lang="sw">{t.definitionSw}</p>}
              {t.definitionEn && <p className="mt-1 text-sm text-slate-500">{t.definitionEn}</p>}
              {t.usageNote && <p className="mt-2 rounded-md bg-amber-400/10 px-2.5 py-1.5 text-xs text-amber-200">{t.usageNote}</p>}
              {t.status === "SAMPLE" && <p className="mt-2 text-[11px] text-slate-400">Sample glossary entry (demonstration)</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function AskPanel({ join, allowMic, ended }: { join: StoredJoin; allowMic: boolean; ended: boolean }) {
  const [lang, setLang] = useState<"en" | "sw">("en");
  const [text, setText] = useState("");
  const [status, setStatus] = useState<{ kind: "idle" | "sending" | "sent" | "error"; msg?: string }>({ kind: "idle" });
  const [mine, setMine] = useState<{ id: string; text: string; language: string; answered: boolean }[]>([]);
  const speech = useSpeechInput(lang === "en" ? "en-KE" : "sw-KE", (t) => setText((p) => (p ? `${p} ${t}` : t)));

  const loadMine = useCallback(async () => {
    const r = await fetch(`/api/live/sessions/${join.sessionId}/questions`, { headers: { "x-participant-token": join.token } }).catch(() => null);
    const d = await r?.json().catch(() => null);
    if (d?.ok) setMine(d.questions);
  }, [join]);
  useEffect(() => {
    loadMine();
    const t = setInterval(loadMine, 15000);
    return () => clearInterval(t);
  }, [loadMine]);

  async function send() {
    if (status.kind === "sending" || text.trim().length < 2) return;
    speech.stop();
    setStatus({ kind: "sending" });
    const r = await fetch(`/api/live/sessions/${join.sessionId}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-participant-token": join.token },
      body: JSON.stringify({ text: text.trim(), language: lang }),
    }).catch(() => null);
    const d = await r?.json().catch(() => null);
    if (d?.ok) {
      setText("");
      setStatus({ kind: "sent", msg: "Question sent to the lecturer." });
      loadMine();
    } else setStatus({ kind: "error", msg: d?.error ?? "Could not send your question. Try again." });
  }

  return (
    <section aria-labelledby="ask-h" className="rounded-xl bg-slate-50 p-4">
      <h2 id="ask-h" className="text-sm font-bold">Ask the lecturer a question</h2>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs text-slate-500">Language</span>
        <div className="flex rounded-lg bg-surface p-1 text-xs font-semibold ring-1 ring-slate-200" role="group" aria-label="Question language">
          {(["en", "sw"] as const).map((l) => (
            <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l} className={`rounded-md px-3 py-1 ${lang === l ? "bg-navy-500 text-white" : "text-slate-600"}`}>{l === "en" ? "English" : "Kiswahili"}</button>
          ))}
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          maxLength={1000}
          lang={lang}
          disabled={ended}
          placeholder={lang === "en" ? "Type or speak your question…" : "Andika au sema swali lako…"}
          className="input flex-1 text-sm"
          aria-label="Your question"
        />
        <button
          type="button"
          onClick={speech.listening ? speech.stop : speech.start}
          disabled={!allowMic || !speech.supported || ended}
          aria-pressed={speech.listening}
          aria-label={speech.listening ? "Stop microphone" : "Start microphone"}
          title={!allowMic ? "The lecturer has turned off student microphones" : !speech.supported ? "Voice input is not supported in this browser" : undefined}
          className={`flex h-12 w-12 shrink-0 items-center justify-center self-start rounded-full text-white transition disabled:cursor-not-allowed disabled:bg-slate-300 ${speech.listening ? "bg-red-600 animate-pulseDot" : "bg-navy-500 hover:bg-navy-600"}`}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden><path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-2.08A7 7 0 0 0 19 12h-2Z" /></svg>
        </button>
      </div>
      <p className="mt-1.5 text-xs text-slate-500">
        {!allowMic ? "Student microphones are turned off by the lecturer. You can still type." : !speech.supported ? "Voice input is not available in this browser. Type your question instead." : speech.listening ? "Listening… tap the microphone again to stop." : speech.error ?? "Voice is converted to text on your device before sending."}
      </p>
      <button onClick={send} disabled={status.kind === "sending" || text.trim().length < 2 || ended} className="btn-primary btn-sm mt-3 w-full">
        {status.kind === "sending" ? "Sending…" : "Send question"}
      </button>
      {status.msg && <p role="status" className={`mt-2 text-xs ${status.kind === "error" ? "text-red-300" : "text-emerald-300"}`}>{status.msg}</p>}
      {mine.length > 0 && (
        <ul className="mt-4 space-y-2 border-t border-slate-200 pt-3">
          {mine.map((q) => (
            <li key={q.id} className="text-xs text-slate-600">
              <span className={`mr-1.5 font-semibold ${q.answered ? "text-emerald-300" : "text-slate-400"}`}>{q.answered ? "✓ Answered" : "Sent"}</span>
              {q.text}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function NotesPanel({ notes, setNotes, session }: { notes: string; setNotes: (s: string) => void; session: Session }) {
  function download() {
    const header = `${session.title}\n${session.courseCode} · ${new Date().toLocaleDateString()}\n\n`;
    const blob = new Blob([header + notes], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${session.courseCode.replace(/\s+/g, "")}-notes.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
  return (
    <section aria-labelledby="notes-h">
      <div className="flex items-center justify-between">
        <h2 id="notes-h" className="text-sm font-bold">My notes</h2>
        <button onClick={download} disabled={!notes.trim()} className="text-xs font-semibold text-cyan-300 hover:underline disabled:text-slate-300">Download</button>
      </div>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={8} className="input mt-2 text-sm" placeholder="Write notes in English or Kiswahili. Use “+ Add to notes” on any statement." aria-label="My notes" />
      <p className="mt-1.5 text-xs text-slate-500">Saved on this device only.</p>
    </section>
  );
}

function Rejoin({ code, left, onJoined }: { code: string; left: boolean; onJoined: (j: StoredJoin) => void }) {
  const [adm, setAdm] = useState("");
  const [uniChoice, setUniChoice] = useState("");
  const [uniOther, setUniOther] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setAdm(lastAdmission());
    const saved = lastUniversity();
    if (saved) {
      if (isKnownUniversity(saved)) setUniChoice(saved);
      else {
        setUniChoice(OTHER_UNIVERSITY);
        setUniOther(saved);
      }
    }
  }, []);
  const university = universityValue(uniChoice, uniOther);
  async function go() {
    if (busy) return;
    if (university.length < 2) return setErr("Select your university.");
    setBusy(true);
    setErr("");
    const r = await fetch("/api/live/sessions/join", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, admissionNumber: adm, university }) }).catch(() => null);
    const d = await r?.json().catch(() => null);
    setBusy(false);
    if (!d?.ok) return setErr(d?.error ?? "Could not join.");
    const j = { token: d.token, sessionId: d.session.id, admissionNumber: d.admissionNumber, university: d.university };
    saveJoin(code, j);
    onJoined(j);
  }
  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <div className="card p-8 text-center">
        <h1 className="text-xl font-bold">{left ? "You have left the session" : "Join this lecture"}</h1>
        <p className="mt-2 text-sm text-slate-600">Session code <span className="font-mono font-semibold">{code}</span></p>
        <div className="mt-6 text-left">
          <label htmlFor="adm" className="label">Admission number</label>
          <input id="adm" className="input font-mono uppercase placeholder:normal-case" value={adm} onChange={(e) => setAdm(e.target.value)} onKeyDown={(e) => e.key === "Enter" && go()} />
        </div>
        <div className="mt-4 text-left">
          <UniversitySelect id="rejoin-university" choice={uniChoice} other={uniOther} onChoice={setUniChoice} onOther={setUniOther} />
        </div>
        {err && <p role="alert" className="mt-3 text-sm text-red-300">{err}</p>}
        <button onClick={go} disabled={busy || adm.trim().length < 3 || university.length < 2} className="btn-primary mt-5 w-full">{busy ? "Joining…" : left ? "Rejoin session" : "Join"}</button>
        <Link href="/live/student" className="mt-4 inline-block text-sm text-slate-500 underline">Choose a different lecture</Link>
      </div>
    </main>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">{children}</div>;
}
