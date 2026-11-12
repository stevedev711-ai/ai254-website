"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { STEM_SUBJECTS } from "@/lib/subjects";

export function CreateSessionForm({ liveAvailable }: { liveAvailable: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fe, setFe] = useState<Record<string, string>>({});
  const [mode, setMode] = useState<"LIVE" | "DEMO">(liveAvailable ? "LIVE" : "DEMO");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    setFe({});
    try {
      const res = await fetch("/api/lecturer/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: fd.get("title"),
          courseCode: fd.get("courseCode"),
          subject: fd.get("subject"),
          introduction: fd.get("introduction") || undefined,
          summary: fd.get("summary") || undefined,
          mode,
        }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok || !d.ok) {
        setFe(d.fieldErrors ?? {});
        setError(d.error ?? "Could not create the session.");
        return;
      }
      router.push(`/live/lecturer/${d.session.id}`);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <div>
        <label htmlFor="title" className="label">Lecture title</label>
        <input id="title" name="title" className="input" placeholder="e.g. The Cell: Structure and Function" required maxLength={160} aria-invalid={fe.title ? true : undefined} />
        {fe.title && <p className="field-error">{fe.title}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="courseCode" className="label">Course code</label>
          <input id="courseCode" name="courseCode" className="input uppercase" placeholder="BIO 101" required maxLength={20} aria-invalid={fe.courseCode ? true : undefined} />
          {fe.courseCode && <p className="field-error">{fe.courseCode}</p>}
        </div>
        <div>
          <label htmlFor="subject" className="label">Subject</label>
          <select id="subject" name="subject" className="input" defaultValue="Biology" aria-invalid={fe.subject ? true : undefined}>
            {STEM_SUBJECTS.map((g) => (
              <optgroup key={g.group} label={g.group}>
                {g.subjects.map((s) => <option key={s}>{s}</option>)}
              </optgroup>
            ))}
          </select>
          {fe.subject && <p className="field-error">{fe.subject}</p>}
        </div>
      </div>
      <div>
        <label htmlFor="introduction" className="label">Lesson introduction <span className="text-xs font-normal text-slate-400">Optional</span></label>
        <textarea id="introduction" name="introduction" rows={2} className="input" maxLength={2000} placeholder="Shown to students when they join" />
      </div>
      <div>
        <label htmlFor="summary" className="label">Lesson summary <span className="text-xs font-normal text-slate-400">Optional</span></label>
        <textarea id="summary" name="summary" rows={2} className="input" maxLength={4000} placeholder="Shown to students during and after the lecture" />
      </div>
      <fieldset>
        <legend className="label">Processing</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className={`flex gap-3 rounded-xl border p-3.5 text-sm ${!liveAvailable ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${mode === "LIVE" ? "border-navy-500 ring-1 ring-navy-500" : "border-slate-200"}`}>
            <input type="radio" name="mode" checked={mode === "LIVE"} disabled={!liveAvailable} onChange={() => setMode("LIVE")} className="mt-0.5 accent-navy-500" />
            <span>
              <span className="block font-semibold">Live lecture</span>
              <span className="text-xs text-slate-500">{liveAvailable ? "Your microphone audio is processed by the AI254 services." : "Not available: AI254 services are not connected on this server."}</span>
            </span>
          </label>
          <label className={`flex cursor-pointer gap-3 rounded-xl border p-3.5 text-sm ${mode === "DEMO" ? "border-amber-500 ring-1 ring-amber-500" : "border-slate-200"}`}>
            <input type="radio" name="mode" checked={mode === "DEMO"} onChange={() => setMode("DEMO")} className="mt-0.5 accent-amber-600" />
            <span>
              <span className="block font-semibold">Demonstration</span>
              <span className="text-xs text-slate-500">Plays sample lecture content (labelled as a demo) to show how a session works.</span>
            </span>
          </label>
        </div>
      </fieldset>
      <button className="btn-primary w-full" disabled={busy}>{busy ? "Creating…" : "Create session"}</button>
    </form>
  );
}
