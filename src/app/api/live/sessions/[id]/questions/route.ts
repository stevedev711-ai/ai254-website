import { z } from "zod";
import { prisma } from "@/lib/db";
import { fail, json, zodFieldErrors } from "@/lib/api";
import { resolveAccess } from "@/lib/live/access";
import { memoryRateLimit } from "@/lib/spam";

const schema = z.object({ text: z.string().trim().min(2, "Question is empty").max(1000), language: z.enum(["en", "sw"]) });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await prisma.lectureSession.findUnique({ where: { id } });
  if (!session) return fail(404, "Session not found");
  const access = await resolveAccess(req, id, session.lecturerId);
  if (!access || access.kind !== "student") return fail(401, "Join the session to ask a question.");
  if (session.status === "ENDED") return fail(409, "This session has ended.");
  if (!memoryRateLimit(`q:${access.participantId}`, 10, 5 * 60 * 1000)) return fail(429, "You have sent several questions in a short time. Please wait a moment.");
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(422, "Please check your question.", zodFieldErrors(parsed.error));
  const p = await prisma.participant.findUnique({ where: { id: access.participantId } });
  if (!p) return fail(401, "Rejoin the session.");
  const q = await prisma.question.create({ data: { sessionId: id, admissionNumber: p.admissionNumber, university: p.university, ...parsed.data } });
  return json({ ok: true, id: q.id }, 201);
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await prisma.lectureSession.findUnique({ where: { id } });
  if (!session) return fail(404, "Session not found");
  const access = await resolveAccess(req, id, session.lecturerId);
  if (!access) return fail(401, "Not authorised");
  if (access.kind === "student") {
    const p = await prisma.participant.findUnique({ where: { id: access.participantId } });
    const mine = await prisma.question.findMany({ where: { sessionId: id, admissionNumber: p?.admissionNumber }, orderBy: { createdAt: "desc" }, take: 20 });
    return json({ ok: true, questions: mine });
  }
  const questions = await prisma.question.findMany({ where: { sessionId: id }, orderBy: { createdAt: "desc" }, take: 100 });
  return json({ ok: true, questions });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await prisma.lectureSession.findUnique({ where: { id } });
  if (!session) return fail(404, "Session not found");
  const access = await resolveAccess(req, id, session.lecturerId);
  if (!access || access.kind !== "staff") return fail(401, "Not authorised");
  const body = (await req.json().catch(() => ({}))) as { questionId?: string; answered?: boolean };
  if (!body.questionId) return fail(422, "questionId required");
  await prisma.question.updateMany({ where: { id: body.questionId, sessionId: id }, data: { answered: Boolean(body.answered) } });
  return json({ ok: true });
}
