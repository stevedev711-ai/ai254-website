import { prisma } from "@/lib/db";
import { fail, json } from "@/lib/api";
import { verifyParticipant } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pid = await verifyParticipant(req.headers.get("x-participant-token"), id);
  if (!pid) return fail(401, "Not joined");
  await prisma.participant.update({ where: { id: pid }, data: { leftAt: new Date() } }).catch(() => null);
  return json({ ok: true });
}
