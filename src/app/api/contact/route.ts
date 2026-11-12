import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { fail, json, sameOrigin, zodFieldErrors } from "@/lib/api";
import { contactSchema } from "@/lib/validation";
import { checkBot, clientIp, hashIp } from "@/lib/spam";
import { brandedHtml, notifyAddress, renderTable, sendMail } from "@/lib/mail";
import { systemLog } from "@/lib/log";

export const runtime = "nodejs";
const SUCCESS = "Thank you. Your message has been saved and our team will reply by email.";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "This request could not be verified.");
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return fail(400, "The request could not be read. Please try again.");
  }
  const ip = clientIp(req);
  const ipHash = hashIp(ip);
  const bot = await checkBot(body, ip);
  if (bot) {
    await systemLog("WARN", "spam", `Contact message rejected (${bot})`, { ipHash });
    return fail(400, bot.startsWith("captcha") ? "Please complete the verification check and try again." : "Your message could not be accepted. Please wait a moment and try again.");
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return fail(422, "Please correct the highlighted fields.", zodFieldErrors(parsed.error));
  const d = parsed.data;

  const existing = await prisma.contactMessage.findUnique({ where: { idempotencyKey: d.idempotencyKey } });
  if (existing) return json({ ok: true, message: SUCCESS });

  const count = await prisma.contactMessage.count({ where: { ipHash, createdAt: { gte: new Date(Date.now() - 3600_000) } } });
  if (count >= 8) return fail(429, "Too many messages have been sent from this connection. Please try again later or email info@ai254.net.");

  let record;
  try {
    record = await prisma.contactMessage.create({ data: { idempotencyKey: d.idempotencyKey, name: d.name, email: d.email.toLowerCase(), subject: d.subject, message: d.message, ipHash } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") return json({ ok: true, message: SUCCESS });
    await systemLog("ERROR", "api", "Failed to save contact message", { error: String(err) });
    return fail(500, "We could not save your message because of a server problem. Please try again, or email info@ai254.net.");
  }

  const t = renderTable([["Name", record.name], ["Email", record.email], ["Subject", record.subject], ["Message", record.message]]);
  const notifyStatus = await sendMail(
    { to: notifyAddress(), replyTo: record.email, subject: `Website contact: ${record.subject}`, text: t.text, html: brandedHtml("New website message", t.html) },
    "contact notification",
  );
  await prisma.contactMessage.update({ where: { id: record.id }, data: { notifyStatus } });
  return json({ ok: true, message: SUCCESS }, 201);
}
