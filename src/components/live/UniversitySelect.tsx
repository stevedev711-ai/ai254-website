"use client";

import { OTHER_UNIVERSITY, PRIVATE_UNIVERSITIES, PUBLIC_UNIVERSITIES } from "@/lib/universities";

/**
 * University dropdown for the student join form. `choice` is the selected option;
 * when it is "Other (not listed)", `other` holds the name the student typed.
 */
export function UniversitySelect({
  id = "university",
  choice,
  other,
  onChoice,
  onOther,
  error,
}: {
  id?: string;
  choice: string;
  other: string;
  onChoice: (v: string) => void;
  onOther: (v: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="label">University</label>
      <select
        id={id}
        className="input"
        value={choice}
        onChange={(e) => onChoice(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
      >
        <option value="">Select your university…</option>
        <optgroup label="Public universities">
          {PUBLIC_UNIVERSITIES.map((u) => <option key={u}>{u}</option>)}
        </optgroup>
        <optgroup label="Private universities">
          {PRIVATE_UNIVERSITIES.map((u) => <option key={u}>{u}</option>)}
        </optgroup>
        <option value={OTHER_UNIVERSITY}>{OTHER_UNIVERSITY}</option>
      </select>
      {choice === OTHER_UNIVERSITY && (
        <input
          className="input mt-2"
          placeholder="Type the name of your university"
          aria-label="Name of your university"
          maxLength={160}
          value={other}
          onChange={(e) => onOther(e.target.value)}
        />
      )}
      {error && <p id={`${id}-error`} className="field-error">{error}</p>}
    </div>
  );
}

/** The value sent to the server, or "" if incomplete. */
export function universityValue(choice: string, other: string) {
  return choice === OTHER_UNIVERSITY ? other.trim() : choice;
}
