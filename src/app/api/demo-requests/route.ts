import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { fail, json, sameOrigin, zodFieldErrors } from "@/lib/api";
import { demoRequestSchema } from "@/lib/validation";
import { checkBot, clientIp, hashIp } from "@/lib/spam";
import { brandedHtml, notifyAddress, renderTable, sendMail, escapeHtml } from "@/lib/mail";
import { systemLog } from "@/lib/log";
import { site } from "@/lib/site";

export const runtime = "nodejs";

const SAVED = "Thank you. Your request has been saved and our team will review it and contact you to discuss a suitable demonstration.";
const successMessage = (ackStatus: string) => (ackStatus === "SENT" ? `${SAVED} A confirmation has been sent to your email address.` : SAVED);

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
    await systemLog("WARN", "spam", `Demo request rejected (${bot})`, { ipHash });
    const msg = bot.startsWith("captcha") ? "Please complete the verification check and try again." : "Your submission could not be accepted. Please wait a moment and try again.";
    return fail(400, msg);
  }

  const parsed = demoRequestSchema.safeParse(body);
  if (!parsed.success) return fail(422, "Please correct the highlighted fields.", zodFieldErrors(parsed.error));
  const d = parsed.data;

  // Idempotent retry: same form instance already saved → return the same success.
  const existing = await prisma.demoRequest.findUnique({ where: { idempotencyKey: d.idempotencyKey } });
  if (existing) return json({ ok: true, id: existing.id, message: successMessage(existing.ackStatus) });

  // Rate limits: max 5 requests per IP per hour; duplicate guard per email + organisation for 10 minutes.
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const [ipCount, recentSame] = await Promise.all([
    prisma.demoRequest.count({ where: { ipHash, createdAt: { gte: hourAgo } } }),
    prisma.demoRequest.findFirst({
      where: { email: { equals: d.email, mode: "insensitive" }, organisation: { equals: d.organisation, mode: "insensitive" }, createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) } },
    }),
  ]);
  if (ipCount >= 5) return fail(429, "Too many requests have been sent from this connection. Please try again later or email info@ai254.net.");
  if (recentSame) return fail(409, "We have already received a demo request from this email address for this organisation in the last few minutes. Our team will be in touch.");

  let record;
  try {
    record = await prisma.demoRequest.create({
      data: {
        idempotencyKey: d.idempotencyKey,
        fullName: d.fullName,
        email: d.email.toLowerCase(),
        phone: d.phone,
        organisation: d.organisation,
        jobTitle: d.jobTitle,
        country: d.country,
        organisationType: d.organisationType,
        areaOfInterest: d.areaOfInterest,
        preferredDate: d.preferredDate ? new Date(`${d.preferredDate}T00:00:00Z`) : undefined,
        preferredTime: d.preferredTime,
        expectedAttendees: d.expectedAttendees,
        message: d.message,
        consent: d.consent,
        ipHash,
        userAgent: req.headers.get("user-agent")?.slice(0, 300),
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const again = await prisma.demoRequest.findUnique({ where: { idempotencyKey: d.idempotencyKey } });
      if (again) return json({ ok: true, id: again.id, message: successMessage(again.ackStatus) });
    }
    await systemLog("ERROR", "api", "Failed to save demo request", { error: String(err) });
    return fail(500, "We could not save your request because of a server problem. Please try again, or email info@ai254.net.");
  }

  // Saved. Now send emails; failures are recorded but do not undo the saved request.
  const rows: [string, string | null | undefined][] = [
    ["Full name", record.fullName],
    ["Email", record.email],
    ["Phone", record.phone],
    ["Organisation", record.organisation],
    ["Job title / Role", record.jobTitle],
    ["Country", record.country],
    ["Organisation type", record.organisationType],
    ["Area of interest", record.areaOfInterest],
    ["Preferred date", d.preferredDate],
    ["Preferred time", record.preferredTime],
    ["Expected attendees", record.expectedAttendees?.toString()],
    ["Message", record.message],
  ];
  const table = renderTable(rows);
  const adminLink = `${site.url}/live/admin?tab=requests`;

  const [notifyStatus, ackStatus] = await Promise.all([
    sendMail(
      {
        to: notifyAddress(),
        replyTo: record.email,
        subject: `New demo request — ${record.organisation}`,
        text: `A new demonstration request was submitted.\n\n${table.text}\n\nReview: ${adminLink}`,
        html: brandedHtml("New demonstration request", `${table.html}<p><a href="${adminLink}">Review in AI254 administration</a></p>`),
      },
      "demo request notification",
    ),
    sendMail(
      {
        to: record.email,
        replyTo: notifyAddress(),
        subject: "We have received your AI254 demo request",
        text: `Dear ${record.fullName},\n\nThank you for your interest in AI254. We have received your demonstration request for ${record.organisation}. Our team will review it and contact you to discuss a suitable demonstration.\n\nA copy of your request:\n\n${table.text}\n\nAI254\ninfo@ai254.net · +254 705 771 360`,
        html: brandedHtml(
          "We have received your demo request",
          `<p>Dear ${escapeHtml(record.fullName)},</p><p>Thank you for your interest in AI254. We have received your demonstration request for <strong>${escapeHtml(record.organisation)}</strong>. Our team will review it and contact you to discuss a suitable demonstration.</p><p style="color:#555">A copy of your request:</p>${table.html}`,
        ),
      },
      "demo request acknowledgement",
    ),
  ]);

  await prisma.demoRequest.update({ where: { id: record.id }, data: { notifyStatus, ackStatus } });

  return json({ ok: true, id: record.id, message: successMessage(ackStatus) }, 201);
}
