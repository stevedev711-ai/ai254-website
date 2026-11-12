import { Prisma, type LectureSession } from "@prisma/client";
import { prisma } from "../db";
import { DEMO_SEGMENT_INTERVAL_MS, getDemoScript } from "./demo-content";

/** A participant is "connected" if they polled within this window. */
export const CONNECTED_WINDOW_MS = 30_000;

export async function connectedCount(sessionId: string) {
  return prisma.participant.count({
    where: { sessionId, leftAt: null, lastSeenAt: { gte: new Date(Date.now() - CONNECTED_WINDOW_MS) } },
  });
}

/**
 * Demonstration mode: advances the scripted lecture when the session is live and
 * the lecturer's microphone (capture) is on. Called opportunistically from polling
 * endpoints so no background worker is needed. Public demo sessions (no lecturer)
 * loop back to the beginning after the script ends.
 */
export async function advanceDemo(session: LectureSession) {
  if (session.mode !== "DEMO" || session.status !== "LIVE" || !session.micEnabled) return;
  const script = getDemoScript(session.demoScriptId);
  if (!script) return;

  const last = await prisma.segment.findFirst({ where: { sessionId: session.id }, orderBy: { seq: "desc" } });
  const lastAt = last?.createdAt.getTime() ?? session.startedAt?.getTime() ?? 0;
  if (Date.now() - lastAt < DEMO_SEGMENT_INTERVAL_MS) return;

  let cursor = session.demoCursor;
  if (cursor >= script.segments.length) {
    if (session.lecturerId) return; // lecturer-run demo: stop at end of script
    if (Date.now() - lastAt < DEMO_SEGMENT_INTERVAL_MS * 3) return; // short pause, then restart loop
    await prisma.$transaction([
      prisma.segment.deleteMany({ where: { sessionId: session.id } }),
      prisma.lectureSession.update({ where: { id: session.id }, data: { demoCursor: 0, startedAt: new Date() } }),
    ]);
    return;
  }

  const seg = script.segments[cursor];
  const prefix = script.subject === "Biology" ? "bio-" : null;
  const termIds = prefix ? (seg.terms ?? []).map((k) => prefix + k) : [];
  try {
    await prisma.$transaction([
      prisma.segment.create({
        data: { sessionId: session.id, seq: (last?.seq ?? 0) + 1, english: seg.en, kiswahili: seg.sw, termIds, source: "DEMO" },
      }),
      prisma.lectureSession.update({ where: { id: session.id, demoCursor: cursor }, data: { demoCursor: ++cursor } }),
    ]);
  } catch (err) {
    // Another poller advanced the script concurrently — safe to ignore.
    if (!(err instanceof Prisma.PrismaClientKnownRequestError)) throw err;
  }
}

export function generateCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export const publicSessionSelect = {
  id: true,
  code: true,
  title: true,
  courseCode: true,
  subject: true,
  introduction: true,
  summary: true,
  status: true,
  mode: true,
  micEnabled: true,
  studentMicEnabled: true,
  startedAt: true,
  endedAt: true,
  lecturer: { select: { name: true } },
} satisfies Prisma.LectureSessionSelect;
