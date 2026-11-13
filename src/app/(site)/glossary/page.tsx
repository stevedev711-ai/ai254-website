import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/site/PageHeader";
import { GlossaryBrowser, type PublicTerm } from "@/components/site/GlossaryBrowser";

export const metadata: Metadata = {
  title: "English–Kiswahili Science Glossary",
  description: "AI254's English–Kiswahili glossary of scientific and biological terms used for live lecture translation, with each term's review status.",
  alternates: { canonical: "/glossary" },
};

export const revalidate = 300;

async function getTerms(): Promise<PublicTerm[]> {
  try {
    const terms = await prisma.term.findMany({
      orderBy: [{ subject: "asc" }, { topic: "asc" }, { english: "asc" }],
      select: { id: true, english: true, kiswahili: true, subject: true, topic: true, status: true, definitionEn: true, definitionSw: true, usageNote: true },
    });
    return terms.map((t) => ({ ...t, topic: t.topic ?? "General" }));
  } catch {
    return [];
  }
}

export default async function GlossaryPage() {
  const terms = await getTerms();
  const reviewed = terms.filter((t) => t.status === "REVIEWED").length;
  return (
    <>
      <PageHeader
        eyebrow="Science glossary"
        title="English–Kiswahili scientific terminology"
        intro="The terms AI254 uses to keep scientific meaning consistent when lectures are translated into Kiswahili. Search by English or Kiswahili, or browse by subject and topic."
      >
        <div className="mt-6 max-w-2xl rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm leading-relaxed text-amber-200">
          <strong>Review in progress.</strong> Every term shows its status. <em>Reviewed</em> terms have been approved by AI254&apos;s Kiswahili language specialists ({reviewed} of {terms.length} so far). <em>Draft</em> terms are an initial compilation awaiting specialist review and may change.
        </div>
      </PageHeader>
      <div className="container-x py-12">
        {terms.length ? <GlossaryBrowser terms={terms} /> : <p className="text-slate-500">The glossary is not available right now. Please try again later.</p>}
      </div>
    </>
  );
}
