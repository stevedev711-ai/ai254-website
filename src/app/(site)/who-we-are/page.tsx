import type { Metadata } from "next";
import { PageHeader, SectionHeading } from "@/components/site/PageHeader";
import { CtaBand } from "@/components/site/CtaBand";
import { prisma } from "@/lib/db";
import { pilotFacts } from "@/lib/site";

export const metadata: Metadata = {
  title: "Who We Are",
  description: "AI254 is a Kenyan educational technology initiative developing live Kiswahili lecture support for university education.",
  alternates: { canonical: "/who-we-are" },
};

export const revalidate = 300;

async function getTeam() {
  try {
    return await prisma.teamMember.findMany({ where: { published: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  } catch {
    return [];
  }
}

export default async function WhoWeArePage() {
  const team = await getTeam();
  return (
    <>
      <PageHeader eyebrow="Who We Are" title="A Kenyan initiative building Kiswahili support for university science" />

      <section className="section">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <SectionHeading eyebrow="About AI254" title="Where our work began" />
          <div className="prose-body text-[17px]">
            <p>
              AI254 is a Kenyan educational technology initiative developing live Kiswahili lecture support for university education. Our work began with a specific question: how can university students access accurate scientific explanations in Kiswahili while participating in English-medium lectures?
            </p>
            <p>
              We are combining software development with specialist work on Kiswahili scientific terminology. Our development process includes classroom testing, feedback from students and lecturers, and technical evaluation of the system&apos;s performance.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50/60 py-16">
        <div className="container-x grid gap-5 md:grid-cols-2">
          <div className="card p-8 sm:p-10">
            <p className="eyebrow">Our Mission</p>
            <p className="mt-4 font-display text-2xl font-bold leading-snug">
              To make university-level scientific knowledge more accessible in Kiswahili through accurate, real-time lecture support developed with educators, language specialists and students.
            </p>
          </div>
          <div className="card border-0 bg-brand-gradient p-8 text-white sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">Our Vision</p>
            <p className="mt-4 font-display text-2xl font-bold leading-snug text-white">
              A university learning environment where students can access and understand complex academic knowledge in the languages they use with confidence.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          <SectionHeading eyebrow="Our Approach" title="Three strands of work that depend on each other" />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { n: "01", t: "Technology development", b: "Building speech recognition, translation and classroom interfaces that work together during live teaching." },
              { n: "02", t: "Language resource development", b: "Working with Kiswahili language specialists and subject experts to develop and review scientific terminology." },
              { n: "03", t: "Classroom evaluation", b: "Testing the technology with lecturers and students, documenting performance, identifying problems and improving the system using evidence." },
            ].map((a) => (
              <article key={a.n} className="card p-7">
                <span className="font-mono text-sm font-semibold text-cyan-300">{a.n}</span>
                <h3 className="mt-3 text-xl font-bold">{a.t}</h3>
                <p className="mt-3 leading-relaxed text-slate-600">{a.b}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section border-y border-slate-100 bg-slate-50/60">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <SectionHeading eyebrow="Classroom pilots" title={`Early-stage testing at ${pilotFacts.institution}`} />
          <div className="prose-body text-[17px]">
            <p>
              AI254 has completed two early-stage classroom pilots at {pilotFacts.institution} with {pilotFacts.subject} students and lecturers. Across {pilotFacts.lectureSessions} lecture sessions there were {pilotFacts.participations} student participations ({pilotFacts.pilot1} in Pilot 1 and {pilotFacts.pilot2} in Pilot 2). Some students took part in both pilots, so this figure is not a count of unique individuals.
            </p>
            <p>
              The pilots looked at translation accuracy, student experience, comprehension, participation, confidence and technical performance. Their main purpose was to find out how the system behaves in a real lecture hall and what needs to improve.{" "}
              <a href="/pilot-results" className="font-semibold text-cyan-300 underline underline-offset-4">Read the Pilot 2 results</a>.
            </p>
            <div className="rounded-xl border border-slate-200 bg-surface p-5 text-[15px]">
              <p className="font-semibold text-brand-ink">What the pilots are, and what they are not</p>
              <p className="mt-2 mb-0 text-slate-600">
                The pilots were classroom tests carried out with participating students and lecturers. They do not represent a formal endorsement, adoption or partnership agreement by {pilotFacts.institution}, and we do not report examination results or learning-outcome gains from them.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="team-heading">
        <div className="container-x">
          <div className="max-w-2xl">
            <p className="eyebrow">Our team</p>
            <h2 id="team-heading" className="h-section mt-3">The people behind AI254</h2>
          </div>
          {team.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-slate-300 p-10 text-center">
              <p className="font-medium text-slate-700">Team profiles will be published here.</p>
              <p className="mt-2 text-sm text-slate-500">
                AI254 brings together software developers, Kiswahili language specialists and subject experts. Individual profiles are added by authorised team members.
              </p>
            </div>
          ) : (
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((m) => (
                <li key={m.id} className="card overflow-hidden">
                  {m.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.photoUrl} alt={`Photograph of ${m.name}`} className="aspect-[4/3] w-full object-cover" />
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center bg-navy-400/15 font-display text-4xl font-bold text-navy-200" aria-hidden>
                      {m.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-lg font-bold">{m.name}</h3>
                    <p className="text-sm font-medium text-cyan-300">{m.role}</p>
                    {m.bio && <p className="mt-3 text-sm leading-relaxed text-slate-600">{m.bio}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <CtaBand title="Work with us" body="We welcome conversations with universities, lecturers, language specialists and research partners." primary={{ href: "/contact", label: "Contact Us" }} secondary={{ href: "/request-a-demo", label: "Request a Demo" }} />
    </>
  );
}
