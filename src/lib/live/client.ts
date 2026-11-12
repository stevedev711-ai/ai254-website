"use client";

/** Client helpers for the student session token (kept per browser tab session). */
const key = (code: string) => `ai254.live.${code}`;

export type StoredJoin = { token: string; sessionId: string; admissionNumber: string };

export function saveJoin(code: string, data: StoredJoin) {
  try {
    sessionStorage.setItem(key(code), JSON.stringify(data));
    localStorage.setItem("ai254.live.admission", data.admissionNumber);
  } catch {}
}
export function loadJoin(code: string): StoredJoin | null {
  try {
    const raw = sessionStorage.getItem(key(code));
    return raw ? (JSON.parse(raw) as StoredJoin) : null;
  } catch {
    return null;
  }
}
export function clearJoin(code: string) {
  try {
    sessionStorage.removeItem(key(code));
  } catch {}
}
export function lastAdmission() {
  try {
    return localStorage.getItem("ai254.live.admission") ?? "";
  } catch {
    return "";
  }
}
