/**
 * Seeds:
 *  1. The first administrator account (from SEED_ADMIN_* env vars, if provided).
 *  2. SAMPLE Biology terminology entries (status SAMPLE) used by demo mode.
 *     Replace these with the reviewed AI254 Biology glossary via the admin panel.
 *  3. Public DEMONSTRATION sessions (mode DEMO) so the student experience can be tried.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { BIOLOGY_TERMS, DEMO_SCRIPTS } from "../src/lib/live/demo-content";
import { SCIENCE_GLOSSARY } from "../src/lib/glossary/science-glossary";

const prisma = new PrismaClient();

async function main() {
  const { SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, SEED_ADMIN_NAME } = process.env;
  if (SEED_ADMIN_EMAIL && SEED_ADMIN_PASSWORD) {
    if (SEED_ADMIN_PASSWORD.length < 12) throw new Error("SEED_ADMIN_PASSWORD must be at least 12 characters");
    const email = SEED_ADMIN_EMAIL.toLowerCase();
    const exists = await prisma.user.findUnique({ where: { email } });
    if (!exists) {
      await prisma.user.create({
        data: { email, name: SEED_ADMIN_NAME || "Administrator", role: "ADMIN", passwordHash: await bcrypt.hash(SEED_ADMIN_PASSWORD, 12) },
      });
      console.log(`Created administrator ${email}`);
    }
  } else {
    console.log("SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set — skipping administrator creation");
  }

  for (const t of BIOLOGY_TERMS) {
    await prisma.term.upsert({
      where: { id: `bio-${t.key}` },
      update: {},
      create: {
        id: `bio-${t.key}`,
        subject: "Biology",
        english: t.english,
        kiswahili: t.kiswahili,
        definitionEn: t.definitionEn,
        definitionSw: t.definitionSw,
        usageNote: t.usageNote,
        status: "SAMPLE",
      },
    });
  }
  console.log(`Upserted ${BIOLOGY_TERMS.length} sample Biology terms`);

  // Science glossary: add entries that are not in the database yet (case-insensitive on the
  // English term within a subject). Existing entries, including admin edits, are never changed.
  const existing = await prisma.term.findMany({ select: { subject: true, english: true } });
  const key = (subject: string, english: string) => `${subject}|${english.toLowerCase().replace(/\s*\(.*?\)\s*/g, " ").trim()}`;
  const have = new Set(existing.map((t) => key(t.subject, t.english)));
  const toAdd = SCIENCE_GLOSSARY.filter((t) => !have.has(key(t.subject, t.english))).map((t) => ({
    subject: t.subject,
    topic: t.topic,
    english: t.english.charAt(0).toUpperCase() + t.english.slice(1),
    kiswahili: t.kiswahili,
    usageNote: t.usageNote,
    status: "DRAFT" as const,
  }));
  if (toAdd.length) await prisma.term.createMany({ data: toAdd, skipDuplicates: true });
  console.log(`Science glossary: ${toAdd.length} new terms added (${SCIENCE_GLOSSARY.length} in source)`);

  const codes: Record<string, string> = { "bio101-cell": "BIO101", "gsc304-method": "GSC304", "phy202-duality": "PHY202", "csc404-complexity": "CSC404", "mat306-limits": "MAT306" };
  for (const s of DEMO_SCRIPTS) {
    const code = codes[s.id];
    await prisma.lectureSession.upsert({
      where: { code },
      update: {},
      create: {
        code,
        title: s.title,
        courseCode: s.courseCode,
        subject: s.subject,
        introduction: s.introduction,
        summary: s.summary,
        status: "LIVE",
        mode: "DEMO",
        micEnabled: true,
        demoScriptId: s.id,
        startedAt: new Date(),
      },
    });
  }
  console.log(`Ensured ${DEMO_SCRIPTS.length} public demonstration sessions`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
