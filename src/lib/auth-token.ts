import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@prisma/client";

export const SESSION_COOKIE = "ai254_session";
const SESSION_TTL_SECONDS = 60 * 60 * 10; // 10 hours — a teaching day

export type AuthPayload = { sub: string; role: Role; name: string; email: string };

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET must be set to at least 32 characters");
  return new TextEncoder().encode(s);
}

export async function signSession(payload: AuthPayload) {
  return new SignJWT({ role: payload.role, name: payload.name, email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setAudience("ai254-staff")
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secret());
}

export async function verifySession(token?: string): Promise<AuthPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { audience: "ai254-staff" });
    return { sub: payload.sub as string, role: payload.role as Role, name: payload.name as string, email: payload.email as string };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
};

/* ---------- Student participant tokens (no account; admission number only) ---------- */

export async function signParticipant(participantId: string, sessionId: string) {
  return new SignJWT({ sid: sessionId })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(participantId)
    .setAudience("ai254-participant")
    .setExpirationTime("12h")
    .sign(secret());
}

export async function verifyParticipant(token: string | null | undefined, sessionId: string) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { audience: "ai254-participant" });
    if (payload.sid !== sessionId) return null;
    return payload.sub as string;
  } catch {
    return null;
  }
}
