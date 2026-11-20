import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/site/PageHeader";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kenyan Sign Language (KSL)",
  description: "Kenyan Sign Language (KSL) and AI254. Get in touch with AI254 about KSL and accessible university learning.",
  alternates: { canonical: "/ksl" },
};

export default function KslPage() {
  return (
    <>
      <PageHeader
        eyebrow="KSL"
        title="Kenyan Sign Language"
        intro="Kenyan Sign Language (KSL) is the language of Kenya's Deaf community. AI254's work is about making university teaching accessible in the languages students use with confidence."
      />
      <section className="section">
        <div className="container-x grid gap-8 lg:grid-cols-2">
          <article className="card p-8">
            <h2 className="text-xl font-bold">About KSL</h2>
            <p className="mt-3 leading-relaxed text-slate-600">
              Kenyan Sign Language is a full language with its own grammar and vocabulary. The Constitution of Kenya (2010) recognises it: the State is required to promote the development and use of Kenyan Sign Language, Braille and other communication formats accessible to persons with disabilities.
            </p>
          </article>
          <article className="card p-8">
            <h2 className="text-xl font-bold">Talk to AI254 about KSL</h2>
            <p className="mt-3 leading-relaxed text-slate-600">
              More information about AI254 and Kenyan Sign Language will be published here. If you are a university, Deaf-led organisation, KSL interpreter or researcher interested in accessible lecture support, we would like to hear from you.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/contact" className="btn-primary">Contact Us</Link>
              <a href={`mailto:${site.email}?subject=Kenyan%20Sign%20Language%20(KSL)`} className="btn-outline">{site.email}</a>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
