"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { lastUniversity, saveJoin, type StoredJoin } from "@/lib/live/client";

type Live = { id: string; code: string; title: string; courseCode: string; subject: string; status: string; mode: "DEMO" | "LIVE"; lecturer: { name: string } | null; startedAt: string | null };

const unitName = (title: string) => {
  const i = title.indexOf(" — ");
  return i > -1 ? title.slice(i + 3) : title;
};

/**
 * Shown when the lecturer ends the session. Lists lectures that are live now (same class
 * first) and alerts the student when a new unit starts in their class. Joining is always
 * the student's choice: nobody is moved into another unit automatically.
 */
export function LectureEnded({ session, join }: { session: { id: string; subject: string; summary: string | null }; join: StoredJoin }) {
  const router = useRouter();
  const [live, setLive] = useState<Live[] | null>(null);
  const [newIds, setNewIds] = useState<string[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const firstSeen = useRef<Set<string> | null>(null);

  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const d = await fetch("/api/live/sessions", { cache: "no-store" }).then((r) => r.json());
        if (stop || !d.ok) return;
        const list: Live[] = d.sessions.filter((s: Live) => s.id !== session.id);
        // Units that start after this lecture ended trigger the "has started" alert
        if (!firstSeen.current) firstSeen.current = new Set(list.map((s) => s.id));
        else {
          const fresh = list.filter((s) => !firstSeen.current!.has(s.id) && s.subject === session.subject).map((s) => s.id);
          if (fresh.length) setNewIds((prev) => [...new Set([...prev, ...fresh])]);
        }
        setLive(list);
      } catch {
        /* keep the last list; try again on the next tick */
      }
    };
    load();
    const t = setInterval(load, 10000);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, [session.id, session.subject]);

  async function joinUnit(s: Live) {
    if (busy) return;
    setBusy(s.code);
    setError("");
    try {
      const university = join.university || lastUniversity();
      const res = await fetch("/api/live/sessions/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: s.code, admissionNumber: join.admissionNumber, university }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok || !d.ok) {
        if (d.fieldErrors?.university) return router.push(`/live/student?code=${s.code}`); // details missing: use the full form
        setError(d.error ?? "Could not join that lecture.");
        return;
      }
      saveJoin(d.session.code, { token: d.token, sessionId: d.session.id, admissionNumber: d.admissionNumber, university: d.university });
      router.push(`/live/student/${d.session.code}`);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setBusy(null);
    }
  }

  const sameClass = (live ?? []).filter((s) => s.subject === session.subject);
  const others = (live ?? []).filter((s) => s.subject !== session.subject);
  const started = (live ?? []).filter((s) => newIds.includes(s.id));

  return (
    <div className="space-y-4" aria-live="polite">
      {started.map((s) => (
        <div key={s.id} role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-cyan-400 bg-cyan-50 p-4 shadow-sm">
          <p className="text-sm">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-cyan-500 animate-pulseDot" aria-hidden />
            <strong className="font-mono">{s.courseCode}</strong> — {unitName(s.title)} <span className="text-slate-600">has started.</span>
          </p>
          <button onClick={() => joinUnit(s)} disabled={!!busy} className="btn-cyan btn-sm">{busy === s.code ? "Joining…" : "Join now"}</button>
        </div>
      ))}

      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="font-semibold text-emerald-900">The lecture has ended</p>
        {session.summary && <p className="mt-2 text-sm leading-relaxed text-emerald-900/90"><strong>Summary:</strong> {session.summary}</p>}
        <p className="mt-2 text-xs text-emerald-900/70">Your notes for this lecture are still saved on this device.</p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5" aria-labelledby="next-h">
        <h2 id="next-h" className="font-bold">Next lecture</h2>
        <p className="mt-1 text-sm text-slate-500">
          Join as <span className="font-mono">{join.admissionNumber}</span>
          {join.university ? ` · ${join.university}` : ""}. New units in {session.subject} will be shown here as they start.
        </p>
        {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        {live === null ? (
          <p className="mt-4 text-sm text-slate-500">Checking for live lectures…</p>
        ) : live.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">No other lectures are live right now. Keep this page open and you will be alerted when the next unit in {session.subject} starts.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {sameClass.length > 0 && <UnitGroup label={`${session.subject} (your class)`} units={sameClass} busy={busy} onJoin={joinUnit} />}
            {others.length > 0 && <UnitGroup label="Other classes" units={others} busy={busy} onJoin={joinUnit} />}
          </div>
        )}
      </section>
    </div>
  );
}

function UnitGroup({ label, units, busy, onJoin }: { label: string; units: Live[]; busy: string | null; onJoin: (s: Live) => void }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <ul className="mt-2 space-y-2">
        {units.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
            <div className="min-w-0 text-sm">
              <p className="font-semibold">
                <span className="font-mono">{s.courseCode}</span> — {unitName(s.title)}
              </p>
              <p className="text-xs text-slate-500">
                {s.subject}
                {s.lecturer ? ` · ${s.lecturer.name}` : ""}
                {s.status === "PAUSED" ? " · Paused" : ""}
                {s.mode === "DEMO" ? " · Demo" : ""}
              </p>
            </div>
            <button onClick={() => onJoin(s)} disabled={!!busy} className="btn-primary btn-sm shrink-0">{busy === s.code ? "Joining…" : "Join"}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
