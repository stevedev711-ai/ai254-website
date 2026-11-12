import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fail, sameOrigin, zodFieldErrors } from "@/lib/api";
import { loginSchema } from "@/lib/validation";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/auth";
import { clientIp, hashIp, memoryRateLimit } from "@/lib/spam";
import { systemLog } from "@/lib/log";

export const runtime = "nodejs";

// Constant-time-ish path for unknown emails
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "This request could not be verified.");
  const ipHash = hashIp(clientIp(req));
  if (!memoryRateLimit(`login:${ipHash}`, 10, 15 * 60 * 1000)) return fail(429, "Too many sign-in attempts. Please wait 15 minutes and try again.");

  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return fail(422, "Please enter your email and password.", zodFieldErrors(parsed.error));
  const { email, password } = parsed.data;
  const wantRole = (body as { role?: string })?.role === "admin" ? "ADMIN" : null;

  const user = await prisma.user.findUnique({ where: { email } });
  const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid || !user.active) {
    await systemLog("WARN", "auth", "Failed sign-in attempt", { email, ipHash, reason: !user ? "unknown" : !user.active ? "inactive" : "password" });
    return fail(401, "The email or password is incorrect, or the account is not active.");
  }
  if (wantRole === "ADMIN" && user.role !== "ADMIN") return fail(403, "This account does not have administrator access.");

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  const token = await signSession({ sub: user.id, role: user.role, name: user.name, email: user.email });
  const res = NextResponse.json({ ok: true, role: user.role });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return res;
}
