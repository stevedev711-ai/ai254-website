import { z } from "zod";
import { prisma } from "@/lib/db";
import { fail, json, sameOrigin } from "@/lib/api";
import { loadOwnedSession } from "@/lib/live/access";
import { systemLog } from "@/lib/log";

const schema = z.object({
  action: z.enum(["start", "pause", "resume", "end"]).optional(),
  micEnabled: z.boolean().optional(),
  studentMicEnabled: z.boolean().optional(),
  introduction: z.string().trim().max(2000).optional(),
  summary: z.string().trim().max(4000).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return fail(403, "This request could not be verified.");
  const { id } = await params;
  const { session } = await loadOwnedSession(id);
  if (!session) return fail(404, "Session not found");
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(422, "Invalid update");
  const { action, ...rest } = parsed.data;
  if (session.status === "ENDED") return fail(409, "This session has already ended.");

  const data: Record<string, unknown> = { ...rest };
  if (action === "start") {
    if (session.status !== "SCHEDULED") return fail(409, "Session already started");
    Object.assign(data, { status: "LIVE", startedAt: new Date(), micEnabled: rest.micEnabled ?? true });
  } else if (action === "pause") {
    Object.assign(data, { status: "PAUSED", micEnabled: false });
  } else if (action === "resume") {
    Object.assign(data, { status: "LIVE" });
  } else if (action === "end") {
    Object.assign(data, { status: "ENDED", endedAt: new Date(), micEnabled: false });
    await prisma.participant.updateMany({ where: { sessionId: id, leftAt: null }, data: { leftAt: new Date() } });
  }
  const updated = await prisma.lectureSession.update({ where: { id }, data });
  if (action) await systemLog("INFO", "session", `Session ${session.code} ${action}`, { mode: session.mode }, id);
  return json({ ok: true, session: updated });
}
