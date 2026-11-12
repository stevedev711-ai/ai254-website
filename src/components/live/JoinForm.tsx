"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { lastAdmission, saveJoin } from "@/lib/live/client";

type ActiveSession = { id: string; code: string; title: string; courseCode: string; subject: string; status: string; mode: "DEMO" | "LIVE"; lecturer: { name: string } | null };

export function JoinForm({ initialCode }: { initialCode?: string }) {
  const router = useRouter();
  const [admission, setAdmission] = useState("");
  const [code, setCode] = useState(initialCode ?? "");
  const [sessions, setSessions] = useState<ActiveSession[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setAdmission(lastAdmission());
    const load = () =>
      fetch("/api/live/sessions")
        .then((r) => r.json())
        .then((d) => {
          setSessions(d.sessions ?? []);
          setLoadError("");
        })
        .catch(() => setLoadError("Could not load active lectures. You can still join with a session code."));
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const errs: Record<string, string> = {};
    if (admission.trim().length < 3) errs.admissionNumber = "Enter your admission number";
    if (code.trim().length < 4) errs.code = "Choose a lecture or enter the session code";
    setErrors(errs);
    setError("");
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const res = await fetch("/api/live/sessions/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), admissionNumber: admission.trim() }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok || !d.ok) {
        setErrors(d.fieldErrors ?? {});
        setError(d.error ?? "Could not join the lecture.");
        return;
      }
      saveJoin(d.session.code, { token: d.token, sessionId: d.session.id, admissionNumber: d.admissionNumber });
      router.push(`/live/student/${d.session.code}`);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mt-8 space-y-6">
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
      <div className="card p-5 sm:p-6">
        <label htmlFor="admissionNumber" className="label">Admission number</label>
        <input
          id="admissionNumber"
          className="input font-mono uppercase placeholder:normal-case"
          placeholder="e.g. S13/01234/25"
          autoComplete="off"
          value={admission}
          onChange={(e) => setAdmission(e.target.value)}
          aria-invalid={errors.admissionNumber ? true : undefined}
          aria-describedby="adm-help"
        />
        <p id="adm-help" className="mt-1.5 text-xs text-slate-500">Used only to record your attendance in this session. No password is needed.</p>
        {errors.admissionNumber && <p className="field-error">{errors.admissionNumber}</p>}
      </div>

      <fieldset className="card p-5 sm:p-6">
        <legend className="sr-only">Choose a lecture</legend>
        <p className="label">Join an active lecture</p>
        {sessions === null && !loadError && <p className="py-4 text-sm text-slate-500">Loading active lectures…</p>}
        {loadError && <p className="py-2 text-sm text-amber-800">{loadError}</p>}
        {sessions?.length === 0 && <p className="py-4 text-sm text-slate-500">No lectures are live right now. Enter a code below if your lecturer has given you one.</p>}
        <ul className="mt-2 grid gap-2">
          {sessions?.map((s) => (
            <li key={s.id}>
              <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition ${code === s.code ? "border-cyan-500 bg-cyan-50 ring-1 ring-cyan-500" : "border-slate-200 hover:border-slate-300"}`}>
                <input type="radio" name="session" value={s.code} checked={code === s.code} onChange={() => setCode(s.code)} className="h-4 w-4 accent-cyan-600" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{s.title}</span>
                  <span className="block text-xs text-slate-500">
                    {s.courseCode} · {s.subject}
                    {s.lecturer ? ` · ${s.lecturer.name}` : ""}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  {s.mode === "DEMO" && <span className="demo-badge !py-0.5 text-[10px]">Demo</span>}
                  <span className={`text-xs font-medium ${s.status === "LIVE" ? "text-emerald-700" : "text-amber-700"}`}>{s.status === "LIVE" ? "● Live" : "Paused"}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
        <div className="mt-5 border-t border-slate-100 pt-5">
          <label htmlFor="code" className="label">Or enter a session code</label>
          <input
            id="code"
            className="input max-w-[220px] font-mono text-lg uppercase tracking-[0.3em]"
            maxLength={12}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            aria-invalid={errors.code ? true : undefined}
            autoComplete="off"
          />
          {errors.code && <p className="field-error">{errors.code}</p>}
        </div>
      </fieldset>

      <button className="btn-primary w-full py-3.5 text-base sm:w-auto sm:px-10" disabled={busy}>
        {busy ? "Joining…" : "Join lecture"}
      </button>
    </form>
  );
}
