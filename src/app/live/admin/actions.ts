"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { RequestStatus, TermStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { systemLog } from "@/lib/log";
import { ALL_SUBJECTS } from "@/lib/subjects";

export type ActionResult = { ok: boolean; message: string };

async function admin() {
  const u = await getCurrentUser();
  if (!u || u.role !== "ADMIN") throw new Error("Not authorised");
  return u;
}

const done = (message: string): ActionResult => {
  revalidatePath("/live/admin");
  return { ok: true, message };
};
const failed = (message: string): ActionResult => ({ ok: false, message });
const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

/* ---------------- Lecturer accounts ---------------- */

export async function createUser(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const me = await admin();
  const parsed = z
    .object({
      name: z.string().min(2, "Name is required").max(120),
      email: z.string().email("Valid email required").toLowerCase(),
      department: z.string().max(120).optional(),
      role: z.enum(["LECTURER", "ADMIN"]),
      password: z.string().min(12, "Temporary password must be at least 12 characters").max(200),
    })
    .safeParse({ name: str(fd, "name"), email: str(fd, "email"), department: str(fd, "department") || undefined, role: str(fd, "role") || "LECTURER", password: String(fd.get("password") ?? "") });
  if (!parsed.success) return failed(parsed.error.issues[0].message);
  const d = parsed.data;
  if (await prisma.user.findUnique({ where: { email: d.email } })) return failed("An account with this email already exists.");
  await prisma.user.create({ data: { name: d.name, email: d.email, department: d.department, role: d.role, passwordHash: await bcrypt.hash(d.password, 12) } });
  await systemLog("INFO", "admin", `Account created for ${d.email} (${d.role})`, { by: me.email });
  return done(`Account created for ${d.email}. Share the temporary password securely.`);
}

export async function setUserActive(fd: FormData) {
  const me = await admin();
  const id = str(fd, "id");
  if (id === me.sub) return;
  const active = str(fd, "active") === "true";
  await prisma.user.update({ where: { id }, data: { active } });
  await systemLog("INFO", "admin", `Account ${active ? "activated" : "deactivated"}`, { id, by: me.email });
  revalidatePath("/live/admin");
}

export async function resetPassword(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const me = await admin();
  const id = str(fd, "id");
  const password = String(fd.get("password") ?? "");
  if (password.length < 12) return failed("Password must be at least 12 characters.");
  await prisma.user.update({ where: { id }, data: { passwordHash: await bcrypt.hash(password, 12) } });
  await systemLog("INFO", "admin", "Password reset", { id, by: me.email });
  return done("Password updated.");
}

/* ---------------- Terminology ---------------- */

const termSchema = z.object({
  subject: z.string().refine((s) => ALL_SUBJECTS.includes(s), "Select a subject"),
  english: z.string().min(1, "English term is required").max(160),
  kiswahili: z.string().min(1, "Kiswahili term is required").max(160),
  definitionEn: z.string().max(1000).optional(),
  definitionSw: z.string().max(1000).optional(),
  usageNote: z.string().max(1000).optional(),
  status: z.enum(["DRAFT", "IN_REVIEW", "REVIEWED", "SAMPLE"]),
  reviewedBy: z.string().max(160).optional(),
  topic: z.string().max(120).optional(),
});

export async function saveTerm(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const me = await admin();
  const parsed = termSchema.safeParse({
    subject: str(fd, "subject"),
    english: str(fd, "english"),
    kiswahili: str(fd, "kiswahili"),
    definitionEn: str(fd, "definitionEn") || undefined,
    definitionSw: str(fd, "definitionSw") || undefined,
    usageNote: str(fd, "usageNote") || undefined,
    status: str(fd, "status") || "DRAFT",
    reviewedBy: str(fd, "reviewedBy") || undefined,
    topic: str(fd, "topic") || undefined,
  });
  if (!parsed.success) return failed(parsed.error.issues[0].message);
  const id = str(fd, "id");
  try {
    if (id) await prisma.term.update({ where: { id }, data: parsed.data });
    else await prisma.term.create({ data: parsed.data });
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") return failed("This term already exists for the subject.");
    throw e;
  }
  await systemLog("INFO", "terminology", `Term ${id ? "updated" : "added"}: ${parsed.data.english}`, { by: me.email });
  return done(id ? "Term updated." : "Term added.");
}

export async function setTermStatus(fd: FormData) {
  await admin();
  await prisma.term.update({ where: { id: str(fd, "id") }, data: { status: str(fd, "status") as TermStatus } });
  revalidatePath("/live/admin");
}

/** Change the review status of every term matching the current admin filters. */
export async function bulkSetTermStatus(fd: FormData) {
  const me = await admin();
  const to = str(fd, "to") as TermStatus;
  if (!["DRAFT", "IN_REVIEW", "REVIEWED"].includes(to)) return;
  const q = str(fd, "q"), subject = str(fd, "subject"), topic = str(fd, "topic"), status = str(fd, "status");
  const res = await prisma.term.updateMany({
    where: {
      ...(subject ? { subject } : {}),
      ...(topic ? { topic } : {}),
      ...(status ? { status: status as TermStatus } : {}),
      ...(q ? { OR: [{ english: { contains: q, mode: "insensitive" as const } }, { kiswahili: { contains: q, mode: "insensitive" as const } }] } : {}),
    },
    data: { status: to },
  });
  await systemLog("INFO", "terminology", `Bulk status change: ${res.count} terms set to ${to}`, { by: me.email, filters: { q, subject, topic, status } });
  revalidatePath("/live/admin");
}

export async function deleteTerm(fd: FormData) {
  const me = await admin();
  const t = await prisma.term.delete({ where: { id: str(fd, "id") } });
  await systemLog("INFO", "terminology", `Term deleted: ${t.english}`, { by: me.email });
  revalidatePath("/live/admin");
}

/* ---------------- Demo requests & messages ---------------- */

export async function updateRequest(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  await admin();
  const status = str(fd, "status") as RequestStatus;
  if (!["NEW", "IN_REVIEW", "CONTACTED", "SCHEDULED", "COMPLETED", "CLOSED"].includes(status)) return failed("Invalid status");
  await prisma.demoRequest.update({ where: { id: str(fd, "id") }, data: { status, adminNotes: str(fd, "adminNotes").slice(0, 4000) || null } });
  return done("Request updated.");
}

export async function setMessageStatus(fd: FormData) {
  await admin();
  await prisma.contactMessage.update({ where: { id: str(fd, "id") }, data: { status: str(fd, "status") as RequestStatus } });
  revalidatePath("/live/admin");
}

/* ---------------- Sessions ---------------- */

export async function endSession(fd: FormData) {
  const me = await admin();
  const id = str(fd, "id");
  await prisma.lectureSession.update({ where: { id }, data: { status: "ENDED", endedAt: new Date(), micEnabled: false } });
  await prisma.participant.updateMany({ where: { sessionId: id, leftAt: null }, data: { leftAt: new Date() } });
  await systemLog("INFO", "session", "Session ended by administrator", { by: me.email }, id);
  revalidatePath("/live/admin");
}

/* ---------------- Team ---------------- */

export async function saveTeamMember(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  await admin();
  const parsed = z
    .object({
      name: z.string().min(2, "Name is required").max(120),
      role: z.string().min(2, "Role is required").max(160),
      bio: z.string().max(2000).optional(),
      photoUrl: z.string().url("Photo must be a full URL (https://…)").startsWith("https://", "Photo URL must use https").optional(),
      sortOrder: z.coerce.number().int().min(0).max(999),
      published: z.boolean(),
    })
    .safeParse({ name: str(fd, "name"), role: str(fd, "role"), bio: str(fd, "bio") || undefined, photoUrl: str(fd, "photoUrl") || undefined, sortOrder: str(fd, "sortOrder") || 0, published: fd.get("published") === "on" });
  if (!parsed.success) return failed(parsed.error.issues[0].message);
  const id = str(fd, "id");
  if (id) await prisma.teamMember.update({ where: { id }, data: parsed.data });
  else await prisma.teamMember.create({ data: parsed.data });
  revalidatePath("/who-we-are");
  return done(id ? "Team member updated." : "Team member added.");
}

export async function deleteTeamMember(fd: FormData) {
  await admin();
  await prisma.teamMember.delete({ where: { id: str(fd, "id") } });
  revalidatePath("/live/admin");
  revalidatePath("/who-we-are");
}
