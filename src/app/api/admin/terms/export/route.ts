import type { Prisma, TermStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { fail, requireRole } from "@/lib/api";

export const dynamic = "force-dynamic";

const cell = (v: string | null | undefined) => {
  const s = (v ?? "").replace(/\r?\n/g, " ");
  return /[",]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** CSV export of the terminology (respects the admin filters) for offline specialist review. */
export async function GET(req: Request) {
  if (!(await requireRole("ADMIN"))) return fail(401, "Not authorised");
  const sp = new URL(req.url).searchParams;
  const q = sp.get("q") ?? "", subject = sp.get("subject") ?? "", topic = sp.get("topic") ?? "", status = sp.get("status") ?? "";
  const where: Prisma.TermWhereInput = {
    ...(subject ? { subject } : {}),
    ...(topic ? { topic } : {}),
    ...(["SAMPLE", "DRAFT", "IN_REVIEW", "REVIEWED"].includes(status) ? { status: status as TermStatus } : {}),
    ...(q ? { OR: [{ english: { contains: q, mode: "insensitive" } }, { kiswahili: { contains: q, mode: "insensitive" } }] } : {}),
  };
  const terms = await prisma.term.findMany({ where, orderBy: [{ subject: "asc" }, { topic: "asc" }, { english: "asc" }] });
  const head = ["English", "Kiswahili", "Subject", "Topic", "Status", "Definition (English)", "Definition (Kiswahili)", "Usage note", "Reviewed by", "Last updated"];
  const rows = terms.map((t) => [t.english, t.kiswahili, t.subject, t.topic, t.status, t.definitionEn, t.definitionSw, t.usageNote, t.reviewedBy, t.updatedAt.toISOString().slice(0, 10)].map(cell).join(","));
  const csv = "﻿" + [head.join(","), ...rows].join("\r\n"); // BOM so Excel reads Kiswahili characters correctly
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ai254-glossary-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
