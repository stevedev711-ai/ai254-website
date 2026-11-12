/**
 * AI254 speech recognition & translation service adapter
 * ---------------------------------------------------------------------------
 * This is the single integration point between AI254 LIVE's interface and the
 * existing AI254 transcription / translation services. The UI never calls the
 * services directly; it posts audio to /api/live/sessions/:id/audio, which
 * calls the functions below and stores the result as a Segment.
 *
 * Expected service contracts (adapt the mapping below if yours differ):
 *
 *   POST ${AI254_ASR_URL}
 *     headers: Authorization: Bearer ${AI254_API_KEY}, Content-Type: <audio mime>
 *              X-AI254-Subject: <subject>, X-AI254-Session: <session id>
 *     body:    raw audio chunk (webm/opus from the browser MediaRecorder)
 *     returns: { "text": string, "durationMs"?: number }
 *
 *   POST ${AI254_TRANSLATE_URL}
 *     headers: Authorization: Bearer ${AI254_API_KEY}, Content-Type: application/json
 *     body:    { "text": string, "source": "en", "target": "sw", "subject": string,
 *                "glossary": [{ "id", "en", "sw" }] }
 *     returns: { "translation": string, "termIds"?: string[], "durationMs"?: number }
 */

export type GlossaryEntry = { id: string; en: string; sw: string };

export function liveServicesConfigured() {
  return Boolean(process.env.AI254_ASR_URL && process.env.AI254_TRANSLATE_URL);
}

function headers(extra: Record<string, string>) {
  const h: Record<string, string> = { ...extra };
  if (process.env.AI254_API_KEY) h.Authorization = `Bearer ${process.env.AI254_API_KEY}`;
  return h;
}

async function withTimeout<T>(ms: number, fn: (signal: AbortSignal) => Promise<T>) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fn(ctrl.signal);
  } finally {
    clearTimeout(t);
  }
}

export async function transcribe(audio: ArrayBuffer, mime: string, subject: string, sessionId: string) {
  const started = Date.now();
  const res = await withTimeout(20000, (signal) =>
    fetch(process.env.AI254_ASR_URL!, {
      method: "POST",
      body: audio,
      signal,
      headers: headers({ "Content-Type": mime || "audio/webm", "X-AI254-Subject": subject, "X-AI254-Session": sessionId }),
    }),
  );
  if (!res.ok) throw new Error(`ASR service responded ${res.status}`);
  const data = (await res.json()) as { text?: string; durationMs?: number };
  return { text: (data.text ?? "").trim(), ms: data.durationMs ?? Date.now() - started };
}

export async function translate(text: string, subject: string, glossary: GlossaryEntry[]) {
  const started = Date.now();
  const res = await withTimeout(20000, (signal) =>
    fetch(process.env.AI254_TRANSLATE_URL!, {
      method: "POST",
      signal,
      headers: headers({ "Content-Type": "application/json" }),
      body: JSON.stringify({ text, source: "en", target: "sw", subject, glossary }),
    }),
  );
  if (!res.ok) throw new Error(`Translation service responded ${res.status}`);
  const data = (await res.json()) as { translation?: string; termIds?: string[]; durationMs?: number };
  return { translation: (data.translation ?? "").trim(), termIds: data.termIds ?? [], ms: data.durationMs ?? Date.now() - started };
}

/** Local glossary match used to attach terminology notes to a segment (both modes). */
export function matchTerms(english: string, glossary: GlossaryEntry[]) {
  const lower = english.toLowerCase();
  return glossary
    .filter((g) => {
      const base = g.en.toLowerCase().replace(/\s*\(.*\)\s*/g, "").trim();
      return base.length > 2 && new RegExp(`\\b${base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i").test(lower);
    })
    .map((g) => g.id);
}
