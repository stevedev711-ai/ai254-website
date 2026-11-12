import { z } from "zod";
import { prisma } from "@/lib/db";
import { fail, json, requireRole, sameOrigin, zodFieldErrors } from "@/lib/api";
import { ALL_SUBJECTS } from "@/lib/subjects";
import { generateCode } from "@/lib/live/engine";
import { demoScriptForSubject } from "@/lib/live/demo-content";
import { liveServicesConfigured } from "@/lib/live/services";

export const runtime = "nodejs";

const schema = z.object({
  title: z.string().trim().min(3, "Enter a lecture title").max(160),
  courseCode: z.string().trim().toUpperCase().min(2, "Enter the course code").max(20),
  subject: z.string().refine((s) => ALL_SUBJECTS.includes(s), "Select a subject"),
  introduction: z.string().trim().max(2000).optional(),
  summary: z.string().trim().max(4000).optional(),
  mode: z.enum(["LIVE", "DEMO"]),
});

export async function GET() {
  const user = await requireRole("LECTURER", "ADMIN");
  if (!user) return fail(401, "Not authorised");
  const sessions = await prisma.lectureSession.findMany({ where: { lecturerId: user.sub }, orderBy: { createdAt: "desc" }, take: 50 });
  return json({ ok: true, sessions });
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "This request could not be verified.");
  const user = await requireRole("LECTURER", "ADMIN");
  if (!user) return fail(401, "Not authorised");
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(422, "Please correct the highlighted fields.", zodFieldErrors(parsed.error));
  const d = parsed.data;

  if (d.mode === "LIVE" && !liveServicesConfigured())
    return fail(422, "Live processing is not available: the AI254 speech and translation services are not connected on this server. Create a demonstration session instead.", { mode: "Live processing not connected" });

  const script = d.mode === "DEMO" ? demoScriptForSubject(d.subject) ?? demoScriptForSubject("Biology") : null;

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const s = await prisma.lectureSession.create({
        data: {
          code: generateCode(),
          title: d.title,
          courseCode: d.courseCode,
          subject: d.subject,
          introduction: d.introduction || script?.introduction,
          summary: d.summary || script?.summary,
          mode: d.mode,
          demoScriptId: script?.id,
          lecturerId: user.sub,
        },
      });
      return json({ ok: true, session: s }, 201);
    } catch (e) {
      if ((e as { code?: string }).code !== "P2002") throw e;
    }
  }
  return fail(500, "Could not allocate a session code. Please try again.");
}
