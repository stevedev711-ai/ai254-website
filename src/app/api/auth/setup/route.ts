import bcrypt from "bcryptjs";
import { createHash } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { fail, json, sameOrigin } from "@/lib/api";
import { clientIp, hashIp, memoryRateLimit } from "@/lib/spam";
import { systemLog } from "@/lib/log";

export const runtime = "nodejs";

const schema = z.object({
  token: z.string().min(20).max(200),
  password: z.string().min(12, "Password must be at least 12 characters").max(200),
});

/** Completes a one-time account set-up link: the person sets their own password. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "This request could not be verified.");
  if (!memoryRateLimit(`setup:${hashIp(clientIp(req))}`, 10, 15 * 60 * 1000)) return fail(429, "Too many attempts. Please wait and try again.");
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(422, parsed.error.issues[0].message);
  const hash = createHash("sha256").update(parsed.data.token).digest("hex");
  const user = await prisma.user.findUnique({ where: { setupTokenHash: hash } });
  if (!user || !user.setupTokenExpires || user.setupTokenExpires < new Date())
    return fail(410, "This set-up link is invalid or has expired. Ask an AI254 administrator for a new one.");
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.password, 12), setupTokenHash: null, setupTokenExpires: null, active: true },
  });
  await systemLog("INFO", "auth", `Account set up by ${user.email}`);
  return json({ ok: true, email: user.email, role: user.role });
}
