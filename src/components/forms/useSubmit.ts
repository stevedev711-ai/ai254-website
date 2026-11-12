"use client";

import { useRef, useState } from "react";

export type SubmitState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

/**
 * Shared submit logic for public forms.
 *  - one idempotency key per form instance, so retries or double-clicks cannot create duplicates
 *  - blocks a second submission while one is in flight
 *  - only reports success when the server confirms the record was saved
 */
export function useSubmit(endpoint: string) {
  const [state, setState] = useState<SubmitState>({ kind: "idle" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const inFlight = useRef(false);
  const key = useRef<string>("");
  const renderedAt = useRef<number>(0);
  if (!key.current && typeof window !== "undefined") {
    key.current = crypto.randomUUID();
    renderedAt.current = Date.now();
  }

  async function submit(payload: Record<string, unknown>) {
    if (inFlight.current) return false;
    inFlight.current = true;
    setState({ kind: "submitting" });
    setFieldErrors({});
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, idempotencyKey: key.current, renderedAt: renderedAt.current }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setState({ kind: "success", message: data.message });
        return true;
      }
      if (data.fieldErrors) setFieldErrors(data.fieldErrors);
      setState({ kind: "error", message: data.error || "Something went wrong. Please try again." });
      return false;
    } catch {
      setState({ kind: "error", message: "We could not reach the server. Check your connection and try again. Your request has not been sent." });
      return false;
    } finally {
      inFlight.current = false;
    }
  }

  function reset() {
    key.current = crypto.randomUUID();
    renderedAt.current = Date.now();
    setState({ kind: "idle" });
    setFieldErrors({});
  }

  return { state, fieldErrors, setFieldErrors, submit, reset };
}
