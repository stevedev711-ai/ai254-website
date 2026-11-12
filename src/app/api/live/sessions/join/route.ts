import { z } from "zod";
import { prisma } from "@/lib/db";
import { fail, json, sameOrigin, zodFieldErrors } from "@/lib/api";
import { admissionSchema } from "@/lib/validation";
import { signParticipant } from "@/lib/auth";
import { clientIp, hashIp, memoryRateLimit } from "@/lib/spam";
import { publicSessionSelect } from "@/lib/live/engine";

export const runtime = "nodejs";

const schema = z.object({
  code: z.string().trim().toUpperCase().min(4, "Enter the session code").max(12),
  admissionNumber: admissionSchema,
});

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "This request could not be verified.");
  if (!memoryRateLimit(`join:${hashIp(clientIp(req))}`, 40, 10 * 60 * 1000)) return fail(429, "Too many attempts. Please wait a few minutes.");
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(422, "Please check the details you entered.", zodFieldErrors(parsed.error));
  const { code, admissionNumber } = parsed.data;

  const session = await prisma.lectureSession.findUnique({ where: { code }, select: publicSessionSelect });
  if (!session) return fail(404, "No lecture was found with that session code. Check the code shown by your lecturer.", { code: "Session code not found" });
  if (session.status === "ENDED") return fail(410, "This lecture session has ended.");
  if (session.status === "SCHEDULED") return fail(409, "This lecture has not started yet. Try again when your lecturer starts the session.");

  const participant = await prisma.participant.upsert({
    where: { sessionId_admissionNumber: { sessionId: session.id, admissionNumber } },
    update: { leftAt: null, lastSeenAt: new Date() },
    create: { sessionId: session.id, admissionNumber },
  });
  const token = await signParticipant(participant.id, session.id);
  return json({ ok: true, token, session, admissionNumber });
}
