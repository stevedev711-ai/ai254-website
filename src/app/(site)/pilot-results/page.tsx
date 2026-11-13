import type { Metadata } from "next";
import Link from "next/link";
import { PilotResults } from "@/components/live/PilotResults";

export const metadata: Metadata = {
  title: "Pilot 2 Results",
  description:
    "Results of AI254's second classroom pilot at Maasai Mara University (Biology 101, 29 July – 13 August 2026): comprehension, translation accuracy, delay, participation, confidence and lecturer feedback.",
  alternates: { canonical: "/pilot-results" },
};

export default function PilotResultsPage() {
  return (
    <div className="container-x py-12 sm:py-16">
      <h1 className="sr-only">AI254 Pilot 2 results — Maasai Mara University</h1>
      <PilotResults />
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/request-a-demo" className="btn-primary">Request a Demo</Link>
        <Link href="/glossary" className="btn-outline">Browse the science glossary</Link>
      </div>
    </div>
  );
}
