import { prisma } from "@/lib/db";
import { fail, json } from "@/lib/api";
import { loadOwnedSession } from "@/lib/live/access";
import { liveServicesConfigured, matchTerms, transcribe, translate } from "@/lib/live/services";
import { systemLog } from "@/lib/log";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 2 * 1024 * 1024;

/**
 * Receives one audio chunk from the lecturer's browser (LIVE mode only), sends it to the
 * AI254 speech recognition service, translates the text, and stores the resulting Segment.
 * Audio is processed in memory and never written to disk or the database.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { session } = await loadOwnedSession(id);
  if (!session) return fail(404, "Session not found");
  if (session.mode !== "LIVE") return fail(409, "This is a demonstration session; audio is not processed.");
  if (!liveServicesConfigured()) return fail(503, "AI254 speech and translation services are not connected.");
  if (session.status !== "LIVE" || !session.micEnabled) return fail(409, "Audio capture is switched off for this session.");

  const audio = await req.arrayBuffer();
  if (audio.byteLength === 0) return json({ ok: true, skipped: true });
  if (audio.byteLength > MAX_BYTES) return fail(413, "Audio chunk too large");

  const glossary = (await prisma.term.findMany({ where: { subject: session.subject, status: { in: ["REVIEWED", "IN_REVIEW", "SAMPLE"] } }, select: { id: true, english: true, kiswahili: true } })).map((t) => ({ id: t.id, en: t.english, sw: t.kiswahili }));

  let english = "";
  let asrMs: number | undefined;
  try {
    const r = await transcribe(audio, req.headers.get("content-type") ?? "audio/webm", session.subject, id);
    english = r.text;
    asrMs = r.ms;
  } catch (err) {
    await systemLog("ERROR", "asr", "Speech recognition request failed", { error: String(err) }, id);
    return fail(502, "Speech recognition failed for this audio chunk.");
  }
  if (!english) return json({ ok: true, skipped: true, asrMs });

  let kiswahili: string | null = null;
  let translateMs: number | undefined;
  let termIds: string[] = [];
  try {
    const t = await translate(english, session.subject, glossary);
    kiswahili = t.translation || null;
    translateMs = t.ms;
    termIds = t.termIds.length ? t.termIds : matchTerms(english, glossary);
  } catch (err) {
    await systemLog("ERROR", "translation", "Translation request failed — English published without Kiswahili", { error: String(err) }, id);
    termIds = matchTerms(english, glossary);
  }

  // Sequence allocation with retry on concurrent chunks.
  for (let attempt = 0; attempt < 4; attempt++) {
    const last = await prisma.segment.findFirst({ where: { sessionId: id }, orderBy: { seq: "desc" }, select: { seq: true } });
    try {
      const seg = await prisma.segment.create({
        data: { sessionId: id, seq: (last?.seq ?? 0) + 1, english, kiswahili, termIds, source: "LIVE", asrMs, translateMs },
      });
      await systemLog("INFO", "performance", "Segment processed", { seq: seg.seq, asrMs, translateMs, bytes: audio.byteLength }, id);
      return json({ ok: true, seq: seg.seq });
    } catch (e) {
      if ((e as { code?: string }).code !== "P2002") throw e;
    }
  }
  return fail(500, "Could not store segment");
}
