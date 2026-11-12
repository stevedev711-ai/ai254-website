"use client";

import { useRef, useState, type FormEvent } from "react";
import { Field, Honeypot } from "./Field";
import { Turnstile } from "./Turnstile";
import { useSubmit } from "./useSubmit";
import { INTEREST_AREAS, ORGANISATION_TYPES, TIME_SLOTS } from "@/lib/form-options";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function DemoRequestForm({ defaultInterest }: { defaultInterest?: string }) {
  const { state, fieldErrors, setFieldErrors, submit, reset } = useSubmit("/api/demo-requests");
  const [token, setToken] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const today = new Date().toISOString().slice(0, 10);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const v = (k: string) => String(fd.get(k) ?? "").trim();
    const payload = {
      fullName: v("fullName"),
      email: v("email"),
      phone: v("phone"),
      organisation: v("organisation"),
      jobTitle: v("jobTitle"),
      country: v("country"),
      organisationType: v("organisationType"),
      areaOfInterest: v("areaOfInterest"),
      preferredDate: v("preferredDate"),
      preferredTime: v("preferredTime"),
      expectedAttendees: v("expectedAttendees"),
      message: v("message"),
      consent: fd.get("consent") === "on",
      website: v("website"),
      turnstileToken: token,
    };

    // Client-side checks for fast feedback (the server validates everything again).
    const errs: Record<string, string> = {};
    if (payload.fullName.length < 2) errs.fullName = "Full name is required";
    if (!payload.email) errs.email = "Email address is required";
    else if (!EMAIL_RE.test(payload.email)) errs.email = "Enter a valid email address, e.g. name@university.ac.ke";
    if (payload.organisation.length < 2) errs.organisation = "University / organisation name is required";
    if (payload.preferredDate && payload.preferredDate < today) errs.preferredDate = "The preferred date cannot be in the past";
    if (payload.expectedAttendees && !/^\d+$/.test(payload.expectedAttendees)) errs.expectedAttendees = "Enter a whole number";
    if (!payload.consent) errs.consent = "Please confirm that we may contact you about this request";
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      const first = Object.keys(errs)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    const ok = await submit(payload);
    if (ok) formRef.current?.reset();
    statusRef.current?.focus();
  }

  if (state.kind === "success") {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 outline-none">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white" aria-hidden>
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l5 5L20 7" /></svg>
        </div>
        <h2 className="mt-5 text-2xl font-bold text-emerald-900">Your demo request has been received</h2>
        <p className="mt-3 leading-relaxed text-emerald-900/90">{state.message}</p>
        <button type="button" onClick={reset} className="btn-outline mt-6">Submit another request</button>
      </div>
    );
  }

  const err = (k: string) => fieldErrors[k];
  const submitting = state.kind === "submitting";

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="relative space-y-8" aria-busy={submitting}>
      <Honeypot />
      <div ref={statusRef} tabIndex={-1} className="outline-none" aria-live="assertive">
        {state.kind === "error" && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <strong className="font-semibold">Your request was not sent.</strong> {state.message}
          </div>
        )}
      </div>

      <fieldset className="space-y-5">
        <legend className="mb-1 text-base font-bold">About you</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="fullName" label="Full name" required error={err("fullName")}>
            <input className="input" autoComplete="name" maxLength={120} />
          </Field>
          <Field id="email" label="Email address" required error={err("email")}>
            <input type="email" className="input" autoComplete="email" maxLength={200} />
          </Field>
          <Field id="phone" label="Phone number" error={err("phone")}>
            <input type="tel" className="input" autoComplete="tel" placeholder="+254 7XX XXX XXX" maxLength={40} />
          </Field>
          <Field id="jobTitle" label="Job title / Role" error={err("jobTitle")}>
            <input className="input" autoComplete="organization-title" maxLength={120} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="mb-1 text-base font-bold">Your institution</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="organisation" label="University / Organisation name" required error={err("organisation")} className="sm:col-span-2">
            <input className="input" autoComplete="organization" maxLength={200} />
          </Field>
          <Field id="country" label="Country" error={err("country")}>
            <input className="input" autoComplete="country-name" defaultValue="Kenya" maxLength={80} />
          </Field>
          <Field id="organisationType" label="Type of organisation" error={err("organisationType")}>
            <select className="input" defaultValue="">
              <option value="">Select…</option>
              {ORGANISATION_TYPES.map((o) => <option key={o}>{o}</option>)}
            </select>
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="mb-1 text-base font-bold">The demonstration</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="areaOfInterest" label="Area of interest" error={err("areaOfInterest")} className="sm:col-span-2">
            <select className="input" defaultValue={INTEREST_AREAS.includes(defaultInterest as never) ? defaultInterest : ""}>
              <option value="">Select…</option>
              {INTEREST_AREAS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <Field id="preferredDate" label="Preferred demonstration date" error={err("preferredDate")}>
            <input type="date" className="input" min={today} />
          </Field>
          <Field id="preferredTime" label="Preferred time" error={err("preferredTime")}>
            <select className="input" defaultValue="">
              <option value="">Select…</option>
              {TIME_SLOTS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <Field id="expectedAttendees" label="Number of expected attendees" error={err("expectedAttendees")}>
            <input type="number" inputMode="numeric" min={1} max={5000} className="input" />
          </Field>
          <Field id="message" label="Message / Additional information" error={err("message")} className="sm:col-span-2" hint="For example: courses you have in mind, the size of your lecture halls, or technical questions.">
            <textarea rows={5} className="input" maxLength={4000} />
          </Field>
        </div>
      </fieldset>

      <div>
        <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4">
          <input
            type="checkbox"
            name="consent"
            className="mt-0.5 h-5 w-5 shrink-0 rounded border-slate-300 accent-navy-500"
            aria-invalid={err("consent") ? true : undefined}
            aria-describedby={err("consent") ? "consent-error" : undefined}
            aria-required
          />
          <span className="text-sm leading-relaxed text-slate-700">
            I agree to be contacted by AI254 about this demonstration request. My details will be used only for this purpose, as described in the{" "}
            <a href="/privacy" className="font-medium text-navy-600 underline">Privacy Policy</a>. <span className="text-red-600" aria-hidden>*</span>
          </span>
        </label>
        {err("consent") && <p id="consent-error" className="field-error">{err("consent")}</p>}
      </div>

      <Turnstile onToken={setToken} />

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="btn-primary min-w-[200px]" disabled={submitting}>
          {submitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />}
          {submitting ? "Sending…" : "Send Demo Request"}
        </button>
        <p className="text-xs text-slate-500"><span className="text-red-600">*</span> Required fields</p>
      </div>
    </form>
  );
}
