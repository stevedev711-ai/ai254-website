"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import type { ActionResult } from "@/app/live/admin/actions";

type Props = {
  action: (prev: ActionResult | null, fd: FormData) => Promise<ActionResult>;
  children: React.ReactNode;
  submitLabel: string;
  className?: string;
  resetOnSuccess?: boolean;
};

export function ActionForm({ action, children, submitLabel, className = "", resetOnSuccess }: Props) {
  const [state, formAction] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);
  return (
    <form ref={ref} action={formAction} className={className}>
      {children}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Submit label={submitLabel} />
        {state && <p role="status" className={`text-sm ${state.ok ? "text-emerald-300" : "text-red-300"}`}>{state.message}</p>}
      </div>
    </form>
  );
}

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <button className="btn-primary btn-sm" disabled={pending}>{pending ? "Saving…" : label}</button>;
}

export function ConfirmButton({ label, confirm, className = "" }: { label: string; confirm: string; className?: string }) {
  return (
    <button
      className={className}
      onClick={(e) => {
        if (!window.confirm(confirm)) e.preventDefault();
      }}
    >
      {label}
    </button>
  );
}
