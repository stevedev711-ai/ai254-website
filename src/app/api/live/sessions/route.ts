import { prisma } from "@/lib/db";
import { json } from "@/lib/api";
import { publicSessionSelect } from "@/lib/live/engine";

export const dynamic = "force-dynamic";

/** Public list of lectures students can join right now. */
export async function GET() {
  const sessions = await prisma.lectureSession.findMany({
    where: { status: { in: ["LIVE", "PAUSED"] } },
    select: publicSessionSelect,
    orderBy: [{ mode: "desc" }, { startedAt: "desc" }],
    take: 50,
  });
  return json({ ok: true, sessions });
}
