import { NextResponse } from "next/server";
import type { ZodError } from "zod";
import type { Role } from "@prisma/client";
import { getCurrentUser } from "./auth";

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status });

export const fail = (status: number, error: string, fieldErrors?: Record<string, string>) =>
  NextResponse.json({ ok: false, error, fieldErrors }, { status });

export function zodFieldErrors(err: ZodError) {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/** Returns the signed-in staff user if they hold one of the roles, otherwise null. */
export async function requireRole(...roles: Role[]) {
  const user = await getCurrentUser();
  if (!user || !roles.includes(user.role)) return null;
  return user;
}

/** Rejects cross-site state-changing requests (defence in depth on top of SameSite cookies). */
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser clients / same-origin navigations
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
