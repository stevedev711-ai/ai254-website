"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

export function SetupForm({ token }: { token: string }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ email: string; role: string } | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    if (password.length < 12) return setError("Password must be at least 12 characters.");
    if (password !== fd.get("confirm")) return setError("The two passwords do not match.");
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/setup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok || !d.ok) return setError(d.error ?? "Could not set up the account.");
      setDone(d);
    } catch {
      setError("Could not reach the server. Check your connection.");
    } finally {
      setBusy(false);
    }
  }

  if (done)
    return (
      <div role="status" className="mt-6 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-300">
        <p className="font-semibold">Your account is ready.</p>
        <p className="mt-1">Sign in with {done.email} and your new password.</p>
        <Link href={`/live/login?role=${done.role === "ADMIN" ? "admin" : "lecturer"}`} className="btn-primary btn-sm mt-4">Sign in</Link>
      </div>
    );

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      {error && <p role="alert" className="rounded-lg bg-red-400/10 p-3 text-sm text-red-300">{error}</p>}
      <div>
        <label htmlFor="password" className="label">New password</label>
        <input id="password" name="password" type="password" minLength={12} required autoComplete="new-password" className="input" />
        <p className="mt-1.5 text-xs text-slate-500">At least 12 characters.</p>
      </div>
      <div>
        <label htmlFor="confirm" className="label">Confirm password</label>
        <input id="confirm" name="confirm" type="password" minLength={12} required autoComplete="new-password" className="input" />
      </div>
      <button className="btn-primary w-full" disabled={busy}>{busy ? "Saving…" : "Set password"}</button>
    </form>
  );
}
