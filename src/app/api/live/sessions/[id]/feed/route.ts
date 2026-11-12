import { prisma } from "@/lib/db";
import { fail, json } from "@/lib/api";
import { resolveAccess } from "@/lib/live/access";
import { advanceDemo, connectedCount, publicSessionSelect } from "@/lib/live/engine";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Polling feed for a live session. Returns session state plus any segments after `?after=<seq>`.
 * Students authenticate with their participant token; lecturers/admins with their cookie.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const raw = await prisma.lectureSession.findUnique({ where: { id } });
  if (!raw) return fail(404, "Session not found");
  const access = await resolveAccess(req, id, raw.lecturerId);
  if (!access) return fail(401, "Join the session to view the lecture.");

  if (access.kind === "student") {
    const p = await prisma.participant.findUnique({ where: { id: access.participantId } });
    if (!p) return fail(401, "Join the session to view the lecture.");
    // A finished lecture stays readable (summary, statements) for students who attended it.
    if (p.leftAt && raw.status !== "ENDED") return fail(401, "You have left this session. Rejoin to continue.");
    if (!p.leftAt) await prisma.participant.update({ where: { id: p.id }, data: { lastSeenAt: new Date() } });
  }

  await advanceDemo(raw);

  const after = Math.max(0, Number(new URL(req.url).searchParams.get("after")) || 0);
  const [session, segments, connected] = await Promise.all([
    prisma.lectureSession.findUnique({ where: { id }, select: publicSessionSelect }),
    prisma.segment.findMany({ where: { sessionId: id, seq: { gt: after } }, orderBy: { seq: "asc" }, take: 200 }),
    connectedCount(id),
  ]);

  const termIds = [...new Set(segments.flatMap((s) => s.termIds))];
  const terms = termIds.length
    ? await prisma.term.findMany({ where: { id: { in: termIds } }, select: { id: true, english: true, kiswahili: true, definitionEn: true, definitionSw: true, usageNote: true, status: true } })
    : [];

  // If a demo session looped, the client's cursor is ahead of the data — signal a reset.
  const maxSeq = after > 0 ? (await prisma.segment.aggregate({ where: { sessionId: id }, _max: { seq: true } }))._max.seq ?? 0 : after;
  const reset = after > 0 && maxSeq < after;

  return json({
    ok: true,
    session,
    connected,
    reset,
    segments: segments.map((s) => ({ seq: s.seq, english: s.english, kiswahili: s.kiswahili, termIds: s.termIds, source: s.source, at: s.createdAt })),
    terms,
  });
}
