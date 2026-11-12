"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { lastAdmission, lastUniversity, saveJoin } from "@/lib/live/client";
import { isKnownUniversity, OTHER_UNIVERSITY } from "@/lib/universities";
import { UniversitySelect, universityValue } from "./UniversitySelect";

type ActiveSession = { id: string; code: string; title: string; courseCode: string; subject: string; status: string; mode: "DEMO" | "LIVE"; lecturer: { name: string } | null };

export function JoinForm({ initialCode }: { initialCode?: string }) {
  const router = useRouter();
  const [admission, setAdmission] = useState("");
  const [code, setCode] = useState(initialCode ?? "");
  const [uniChoice, setUniChoice] = useState("");
  const [uniOther, setUniOther] = useState("");
  const [sessions, setSessions] = useState<ActiveSession[] | null>(null);
  const [classChoice, setClassChoice] = useState("");
  const [loadError, setLoadError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setAdmission(lastAdmission());
    const savedUni = lastUniversity();
    if (savedUni) {
      if (isKnownUniversity(savedUni)) setUniChoice(savedUni);
      else {
        setUniChoice(OTHER_UNIVERSITY);
        setUniOther(savedUni);
      }
    }
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

  // Classes (subjects) with live units, and the units in the chosen class
  const classes = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of sessions ?? []) counts.set(s.subject, (counts.get(s.subject) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [sessions]);
  const unitsInClass = useMemo(
    () => (sessions ?? []).filter((s) => s.subject === classChoice).sort((a, b) => a.courseCode.localeCompare(b.courseCode)),
    [sessions, classChoice],
  );
  const selected = sessions?.find((s) => s.code === code.trim().toUpperCase());

  // A QR link or typed code pre-selects the matching class
  useEffect(() => {
    if (selected && selected.subject !== classChoice) setClassChoice(selected.subject);
  }, [selected, classChoice]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const errs: Record<string, string> = {};
    if (admission.trim().length < 3) errs.admissionNumber = "Enter your admission number";
    const university = universityValue(uniChoice, uniOther);
    if (!uniChoice) errs.university = "Select your university";
    else if (university.length < 2) errs.university = "Type the name of your university";
    if (code.trim().length < 4) errs.code = "Choose a class and unit, or enter the session code";
    setErrors(errs);
    setError("");
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const res = await fetch("/api/live/sessions/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), admissionNumber: admission.trim(), university }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok || !d.ok) {
        setErrors(d.fieldErrors ?? {});
        setError(d.error ?? "Could not join the lecture.");
        return;
      }
      saveJoin(d.session.code, { token: d.token, sessionId: d.session.id, admissionNumber: d.admissionNumber, university: d.university });
      router.push(`/live/student/${d.session.code}`);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mt-8 space-y-6">
      {error && <p role="alert" className="rounded-xl border border-red-400/40 bg-red-400/10 p-4 text-sm text-red-300">{error}</p>}
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
        <p id="adm-help" className="mt-1.5 text-xs text-slate-500">Used with your university only to record your attendance in this session. No password is needed.</p>
        {errors.admissionNumber && <p className="field-error">{errors.admissionNumber}</p>}
        <div className="mt-5">
          <UniversitySelect choice={uniChoice} other={uniOther} onChoice={setUniChoice} onOther={setUniOther} error={errors.university} />
        </div>
      </div>

      <fieldset className="card p-5 sm:p-6">
        <legend className="sr-only">Choose a lecture</legend>
        <p className="text-base font-bold">Join an active lecture</p>
        <p className="mt-1 text-sm text-slate-500">Choose your class, then the unit being taught.</p>
        {sessions === null && !loadError && <p className="py-4 text-sm text-slate-500">Loading active lectures…</p>}
        {loadError && <p className="py-2 text-sm text-amber-200">{loadError}</p>}
        {sessions?.length === 0 && <p className="py-4 text-sm text-slate-500">No lectures are live right now. Enter a code below if your lecturer has given you one.</p>}
        {sessions && sessions.length > 0 && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="class" className="label">Class</label>
              <select
                id="class"
                className="input"
                value={classChoice}
                onChange={(e) => {
                  setClassChoice(e.target.value);
                  const units = sessions.filter((s) => s.subject === e.target.value);
                  setCode(units.length === 1 ? units[0].code : "");
                }}
              >
                <option value="">Select a class…</option>
                {classes.map(([subject, n]) => (
                  <option key={subject} value={subject}>
                    {subject} ({n} {n === 1 ? "unit" : "units"})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="unit" className="label">Unit</label>
              <select
                id="unit"
                className="input"
                value={unitsInClass.some((s) => s.code === code) ? code : ""}
                onChange={(e) => setCode(e.target.value)}
                disabled={!classChoice}
                aria-invalid={errors.code ? true : undefined}
              >
                <option value="">{classChoice ? "Select a unit…" : "Choose a class first"}</option>
                {unitsInClass.map((s) => (
                  <option key={s.id} value={s.code}>
                    {s.courseCode} — {unitName(s.title)}
                    {s.status === "PAUSED" ? " (paused)" : ""}
                    {s.mode === "DEMO" ? " · Demo" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        {selected && (
          <div className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-cyan-400/40 bg-cyan-400/10 p-4 text-sm" aria-live="polite">
            <dl className="grid grid-cols-[5.5rem_1fr] gap-x-3 gap-y-1">
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Class</dt>
              <dd className="font-semibold">{selected.subject}</dd>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Unit</dt>
              <dd><span className="font-mono font-semibold">{selected.courseCode}</span> — {unitName(selected.title)}</dd>
              {selected.lecturer && (
                <>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Lecturer</dt>
                  <dd>{selected.lecturer.name}</dd>
                </>
              )}
            </dl>
            <span className="flex shrink-0 flex-col items-end gap-1">
              {selected.mode === "DEMO" && <span className="demo-badge !py-0.5 text-[10px]">Demo</span>}
              <span className={`text-xs font-medium ${selected.status === "LIVE" ? "text-emerald-300" : "text-amber-200"}`}>{selected.status === "LIVE" ? "● Live" : "Paused"}</span>
            </span>
          </div>
        )}
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

/** Unit title without a leading "Course name — " prefix (e.g. "Biology 101 — The Cell" → "The Cell"). */
function unitName(title: string) {
  const i = title.indexOf(" — ");
  return i > -1 ? title.slice(i + 3) : title;
}
