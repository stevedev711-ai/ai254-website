import Link from "next/link";
import type { Metadata } from "next";
import { HeroDemo } from "@/components/site/HeroDemo";
import { ProcessFlow } from "@/components/site/ProcessFlow";
import { LivePreview } from "@/components/site/LivePreview";
import { CtaBand } from "@/components/site/CtaBand";
import { pilotFacts } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "AI254 — Follow the lecture. Understand the science. In Kiswahili." },
  description:
    "AI254 is developing technology that transcribes English university lectures and provides real-time Kiswahili translation on students' devices, beginning with Biology.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 -z-10 h-[620px] bg-[radial-gradient(ellipse_at_top_right,rgba(4,160,225,0.16)_0%,transparent_60%)]" aria-hidden />
        <div className="container-x grid items-center gap-14 pb-20 pt-12 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:pb-28 lg:pt-20">
          <div>
            <p className="eyebrow">Real-time Kiswahili lecture support</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.08] sm:text-5xl xl:text-[3.6rem]">
              Follow the Lecture. Understand the Science. <span className="bg-brand-gradient bg-clip-text text-transparent">In Kiswahili.</span>
            </h1>
            <p className="lead mt-6 max-w-xl">
              University lecturers teach complex scientific concepts in English, while many Kenyan students are equally comfortable learning and discussing ideas in Kiswahili. AI254 is developing technology that captures spoken lectures, transcribes the lecturer&apos;s words and provides real-time Kiswahili translations on students&apos; devices. Students can follow the original English explanation while accessing Kiswahili support when scientific terminology or complex explanations become difficult.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/our-technology" className="btn-primary">Explore Our Technology</Link>
              <Link href="/request-a-demo" className="btn-outline">Request a Demo</Link>
            </div>
            <Link href="/live" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-300">
              <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulseDot" aria-hidden />
              Open AI254 LIVE <span aria-hidden>→</span>
            </Link>
          </div>
          <HeroDemo />
        </div>
      </section>

      {/* PROCESS */}
      <section className="section border-t border-slate-100 bg-slate-50/60">
        <div className="container-x">
          <div className="max-w-2xl">
            <p className="eyebrow">What happens during a lecture?</p>
            <h2 className="h-section mt-3">From the lecturer&apos;s voice to the student&apos;s screen</h2>
          </div>
          <div className="mt-12">
            <ProcessFlow />
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="section">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="eyebrow">Why AI254 exists</p>
            <h2 className="h-section mt-3">University-level science deserves stronger Kiswahili learning resources.</h2>
          </div>
          <div className="prose-body text-[17px]">
            <p>
              Kenyan universities teach many STEM courses in English. Students encounter specialised terminology, unfamiliar scientific expressions and explanations that can be difficult to process during a live lecture. Existing general-purpose translation tools are not specifically developed around the terminology and teaching patterns of university-level science.
            </p>
            <p>
              AI254 is working on this problem by combining speech recognition, live translation and carefully developed Kiswahili scientific terminology. Our initial work focuses on Biology, where we are building the language resources needed to translate scientific explanations while preserving their academic meaning.
            </p>
            <p className="rounded-xl border-l-4 border-cyan-500 bg-cyan-400/10 px-5 py-4 text-[15px] text-slate-700">
              AI254 supports English-medium teaching rather than replacing it. Students keep the lecturer&apos;s original English explanation on screen and use the Kiswahili text where it helps.
            </p>
          </div>
        </div>
      </section>

      {/* PILOTS */}
      <section className="section border-y border-white/10 bg-[#081128] text-white">
        <div className="container-x">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Classroom testing</p>
              <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Developed and tested in real classrooms</h2>
              <p className="mt-5 leading-relaxed text-navy-100">
                AI254 has completed two early-stage classroom pilots at {pilotFacts.institution} involving {pilotFacts.subject} students and lecturers. The pilots examined translation accuracy, student experience, comprehension, participation, confidence and technical performance.
              </p>
              <a href="/pilot-results" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200">See the Pilot 2 results <span aria-hidden>→</span></a>
              <p className="mt-4 text-sm leading-relaxed text-navy-200">
                These were early-stage pilots used to test and improve the system. They are not a formal institutional endorsement, and we do not report examination or learning-outcome gains from them.
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10">
              <Fact value={String(pilotFacts.pilots)} label="Classroom pilots" />
              <Fact value={String(pilotFacts.lectureSessions)} label="Lecture sessions across the two pilots" />
              <Fact
                value={String(pilotFacts.participations)}
                label="Student participations"
                note={`${pilotFacts.pilot1} in Pilot 1 and ${pilotFacts.pilot2} in Pilot 2. Some students took part in both, so this is not a count of unique individuals.`}
              />
              <Fact value="BIO 101" label="Initial subject: Biology 101" />
            </dl>
          </div>
          <div className="mt-12 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {["Translation accuracy", "Student experience", "Comprehension", "Participation", "Confidence", "Technical performance"].map((a) => (
              <div key={a} className="rounded-lg border border-white/15 px-4 py-3 text-sm text-navy-100">{a}</div>
            ))}
          </div>
        </div>
      </section>

      {/* INSIDE LIVE */}
      <section className="section">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="eyebrow">Inside AI254 LIVE</p>
              <h2 className="h-section mt-3">One live session, three views of the lecture</h2>
              <p className="lead mt-4">
                Students join with a session code, follow the English transcription with Kiswahili translation beneath it, and open terminology explanations. Lecturers control the session and see exactly what students receive.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/live" className="btn-primary">Open AI254 LIVE</Link>
              <Link href="/request-a-demo" className="btn-outline">Request a Guided Demonstration</Link>
            </div>
          </div>
          <div className="mt-10">
            <LivePreview />
          </div>
        </div>
      </section>

      {/* WHO CAN USE */}
      <section className="section bg-slate-50/60">
        <div className="container-x">
          <p className="eyebrow">Who can use AI254?</p>
          <h2 className="h-section mt-3 max-w-2xl">Built around the people in the lecture hall</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <UseCase
              tag="Students"
              title="University students"
              body="Access Kiswahili support while following English-medium lectures, particularly when studying complex scientific concepts."
              points={["Join from a phone, tablet or laptop", "English and Kiswahili side by side", "Terminology explanations and personal notes"]}
            />
            <UseCase
              tag="Lecturers"
              title="Lecturers"
              body="Conduct normal lectures while making translated explanations available to students through a shared live session."
              points={["Start a session in a few steps", "Microphone on/off control", "See transcription, translation and connected students"]}
            />
            <UseCase
              tag="Institutions"
              title="Universities and academic departments"
              body="Explore the use of AI254 in selected courses, organise pilot sessions and evaluate how the technology performs in their teaching environment."
              points={["Course-level pilot sessions", "Session records and system logs", "Evaluation with your teaching staff"]}
            />
          </div>
        </div>
      </section>

      <CtaBand
        title="Interested in testing AI254 in your institution?"
        body="We welcome conversations with universities, academic departments, lecturers and research partners interested in exploring live Kiswahili lecture support."
      />
    </>
  );
}

function Fact({ value, label, note }: { value: string; label: string; note?: string }) {
  return (
    <div className="bg-[#081128] p-6 sm:p-8">
      <dt className="sr-only">{label}</dt>
      <dd>
        <p className="font-display text-4xl font-extrabold text-white sm:text-5xl">{value}</p>
        <p className="mt-2 text-sm font-medium text-navy-100">{label}</p>
        {note && <p className="mt-2 text-xs leading-relaxed text-navy-200">{note}</p>}
      </dd>
    </div>
  );
}

function UseCase({ tag, title, body, points }: { tag: string; title: string; body: string; points: string[] }) {
  return (
    <article className="card flex flex-col p-7">
      <span className="badge w-fit bg-navy-400/15 text-cyan-300">{tag}</span>
      <h3 className="mt-4 text-xl font-bold">{title}</h3>
      <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{body}</p>
      <ul className="mt-5 space-y-2 border-t border-slate-100 pt-5 text-sm text-slate-700">
        {points.map((p) => (
          <li key={p} className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500" aria-hidden />
            {p}
          </li>
        ))}
      </ul>
    </article>
  );
}
