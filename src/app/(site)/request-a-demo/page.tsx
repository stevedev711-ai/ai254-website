import type { Metadata } from "next";
import { DemoRequestForm } from "@/components/forms/DemoRequestForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Request a Demo",
  description: "Request a demonstration of AI254 LIVE for your university, department or organisation.",
  alternates: { canonical: "/request-a-demo" },
};

export default async function RequestDemoPage({ searchParams }: { searchParams: Promise<{ interest?: string }> }) {
  const { interest } = await searchParams;
  return (
    <section className="relative">
      <div className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(ellipse_at_top_right,#E8F6FD_0%,transparent_55%)]" aria-hidden />
      <div className="container-x grid gap-12 py-16 sm:py-20 lg:grid-cols-[1fr_1.5fr]">
        <div>
          <p className="eyebrow">Request a Demo</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight sm:text-5xl">See AI254 in a Live Lecture Setting</h1>
          <p className="lead mt-5">
            Tell us about your institution and what you would like to explore. Our team will review your request and contact you to discuss a suitable demonstration.
          </p>
          <div className="mt-10 space-y-5 border-t border-slate-200 pt-8">
            <h2 className="text-base font-bold">What a demonstration can include</h2>
            <ul className="space-y-3 text-[15px] text-slate-700">
              {[
                "A live session where your staff join as students on their own phones",
                "A lecturer walkthrough: creating, running and ending a session",
                "A technical briefing on architecture, integration and data handling",
                "Discussion of a possible course-level pilot and how it would be evaluated",
              ].map((x) => (
                <li key={x} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500" aria-hidden />
                  {x}
                </li>
              ))}
            </ul>
            <p className="text-sm text-slate-500">
              Prefer email? Write to <a className="font-medium text-navy-600 underline" href={`mailto:${site.email}`}>{site.email}</a> or call{" "}
              <a className="font-medium text-navy-600 underline" href={site.phoneHref}>{site.phone}</a>.
            </p>
          </div>
        </div>
        <div className="card p-6 shadow-sm sm:p-10">
          <DemoRequestForm defaultInterest={interest} />
        </div>
      </div>
    </section>
  );
}
