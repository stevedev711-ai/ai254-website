import { prisma } from "../db";
import { getCurrentUser, verifyParticipant } from "../auth";

export type Access =
  | { kind: "student"; participantId: string }
  | { kind: "staff"; userId: string; role: "LECTURER" | "ADMIN"; owner: boolean };

/** Resolves who is calling a session endpoint: a joined student (token) or staff (cookie). */
export async function resolveAccess(req: Request, sessionId: string, lecturerId: string | null): Promise<Access | null> {
  const token = req.headers.get("x-participant-token");
  if (token) {
    const pid = await verifyParticipant(token, sessionId);
    if (pid) return { kind: "student", participantId: pid };
  }
  const user = await getCurrentUser();
  if (user) {
    const owner = user.sub === lecturerId;
    if (owner || user.role === "ADMIN") return { kind: "staff", userId: user.sub, role: user.role, owner };
  }
  return null;
}

/** Ensures the lecturer owns the session (or is an admin). */
export async function loadOwnedSession(sessionId: string) {
  const user = await getCurrentUser();
  if (!user) return { user: null, session: null } as const;
  const session = await prisma.lectureSession.findUnique({ where: { id: sessionId } });
  if (!session) return { user, session: null } as const;
  if (session.lecturerId !== user.sub && user.role !== "ADMIN") return { user, session: null } as const;
  return { user, session } as const;
}
