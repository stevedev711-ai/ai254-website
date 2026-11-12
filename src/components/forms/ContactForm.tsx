"use client";

import { useRef, useState, type FormEvent } from "react";
import { Field, Honeypot } from "./Field";
import { Turnstile } from "./Turnstile";
import { useSubmit } from "./useSubmit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function ContactForm() {
  const { state, fieldErrors, setFieldErrors, submit, reset } = useSubmit("/api/contact");
  const [token, setToken] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const v = (k: string) => String(fd.get(k) ?? "").trim();
    const p = { name: v("name"), email: v("email"), subject: v("subject"), message: v("message"), website: v("website"), turnstileToken: token };
    const errs: Record<string, string> = {};
    if (p.name.length < 2) errs.name = "Name is required";
    if (!p.email) errs.email = "Email address is required";
    else if (!EMAIL_RE.test(p.email)) errs.email = "Enter a valid email address";
    if (p.subject.length < 2) errs.subject = "Subject is required";
    if (p.message.length < 10) errs.message = "Message should be at least 10 characters";
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      formRef.current?.querySelector<HTMLElement>(`[name="${Object.keys(errs)[0]}"]`)?.focus();
      return;
    }
    await submit(p);
  }

  if (state.kind === "success")
    return (
      <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8">
        <h2 className="text-xl font-bold text-emerald-900">Message received</h2>
        <p className="mt-2 text-emerald-900/90">{state.message}</p>
        <button type="button" className="btn-outline mt-5" onClick={reset}>Send another message</button>
      </div>
    );

  const submitting = state.kind === "submitting";
  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="relative space-y-5" aria-busy={submitting}>
      <Honeypot />
      {state.kind === "error" && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <strong>Your message was not sent.</strong> {state.message}
        </div>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Name" required error={fieldErrors.name}><input className="input" autoComplete="name" maxLength={120} /></Field>
        <Field id="email" label="Email" required error={fieldErrors.email}><input type="email" className="input" autoComplete="email" maxLength={200} /></Field>
      </div>
      <Field id="subject" label="Subject" required error={fieldErrors.subject}><input className="input" maxLength={200} /></Field>
      <Field id="message" label="Message" required error={fieldErrors.message}><textarea rows={6} className="input" maxLength={4000} /></Field>
      <Turnstile onToken={setToken} />
      <button type="submit" className="btn-primary" disabled={submitting}>
        {submitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />}
        {submitting ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
