import { cloneElement, isValidElement, type ReactElement } from "react";

type Props = { id: string; label: string; required?: boolean; error?: string; hint?: string; children: ReactElement<Record<string, unknown>>; className?: string };

/** Label + control + accessible error/hint wiring. */
export function Field({ id, label, required, error, hint, children, className = "" }: Props) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
  const control = isValidElement(children)
    ? cloneElement(children, { id, name: id, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy, "aria-required": required || undefined })
    : children;
  return (
    <div className={className}>
      <label htmlFor={id} className="label">
        {label}
        {required ? <span className="ml-0.5 text-red-600" aria-hidden> *</span> : <span className="ml-1.5 text-xs font-normal text-slate-400">Optional</span>}
      </label>
      {control}
      {hint && <p id={`${id}-hint`} className="mt-1.5 text-xs text-slate-500">{hint}</p>}
      {error && <p id={`${id}-error`} className="field-error">{error}</p>}
    </div>
  );
}

/** Off-screen honeypot. Humans never see it; bots that fill it are rejected. */
export function Honeypot() {
  return (
    <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
      <label htmlFor="website">Website</label>
      <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
