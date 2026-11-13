import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/site/PageHeader";
import { HowItRunsVisual } from "@/components/site/HowItRunsVisual";
import { CtaBand } from "@/components/site/CtaBand";

export const metadata: Metadata = {
  title: "What We Do",
  description:
    "Real-time lecture transcription, English-to-Kiswahili lecture translation, scientific terminology development, classroom technology and evaluation.",
  alternates: { canonical: "/what-we-do" },
};

const sections = [
  { id: "transcription", label: "Real-time lecture transcription" },
  { id: "translation", label: "English-to-Kiswahili translation" },
  { id: "terminology", label: "Scientific terminology development" },
  { id: "classroom", label: "Classroom technology" },
  { id: "evaluation", label: "Testing and evaluation" },
];

const contextExamples = [
  {
    en: "cell",
    wrong: "chumba · simu",
    right: "seli",
    note: "General tools may choose ‘room’ or ‘mobile phone’. In Biology the word always refers to the basic unit of life.",
  },
  {
    en: "cellular respiration",
    wrong: "kupumua kwa seli (breathing)",
    right: "upumuaji wa seli",
    note: "Respiration in Biology is a chemical process that releases energy. It is not breathing, and the translation has to keep that difference.",
  },
  {
    en: "the powerhouse of the cell",
    wrong: "nyumba ya nguvu ya seli",
    right: "kituo cha nishati cha seli",
    note: "A teaching metaphor. Translated literally it means nothing, so it is rendered by meaning: an ‘energy station’.",
  },
  {
    en: "selectively permeable",
    wrong: "inayopenyeka kwa kuchagua",
    right: "yenye upenyezaji teule",
    note: "Describes a property of the membrane. It needs one consistent term, used the same way in every lecture.",
  },
];

export default function WhatWeDoPage() {
  return (
    <>
      <PageHeader
        eyebrow="What We Do"
        title="Speech, language and classroom work, developed together"
        intro="AI254’s work covers the full path of a lecture: capturing what the lecturer says, translating it with the correct scientific meaning, delivering it to students during the lecture, and checking how well it works."
        visual={<HowItRunsVisual />}
      />

      <div className="container-x grid gap-12 py-16 lg:grid-cols-[240px_1fr]">
        <nav aria-label="On this page" className="hidden lg:block">
          <ul className="sticky top-28 space-y-1 border-l border-slate-200 text-sm">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="-ml-px block border-l border-transparent py-1.5 pl-4 text-slate-600 hover:border-navy-500 hover:text-cyan-300">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-20">
          <Block id="transcription" n="01" title="Real-time lecture transcription">
            <p>
              During a lecture, the lecturer&apos;s speech is captured from a microphone and converted into English text in short sections, so students see each statement within moments of it being spoken. The transcription keeps sentence boundaries, so each statement can be translated as a complete thought rather than as loose fragments.
            </p>
            <p>A lecture hall is a hard place for speech recognition. The main challenges we work on are:</p>
            <ul className="grid gap-3 sm:grid-cols-3">
              <Challenge t="Classroom noise" b="Movement, conversation, fans and the room’s echo all reach the microphone along with the lecturer’s voice." />
              <Challenge t="Rapid speech" b="Lecturers speed up, repeat themselves, correct themselves and leave sentences unfinished." />
              <Challenge t="Specialised vocabulary" b="Words such as ‘endoplasmic reticulum’ are rare in everyday speech, so general models often get them wrong." />
            </ul>
          </Block>

          <Block id="translation" n="02" title="English-to-Kiswahili lecture translation">
            <p>
              Each completed English statement goes through the translation pipeline, which produces Kiswahili text for students. Translation uses the subject being taught: when a session is set to Biology, the Biology terminology resources guide how technical terms are rendered.
            </p>
            <p>
              Preserving <strong>scientific meaning</strong> matters more than producing a literal sentence. A translation can be fluent and still be wrong if it changes what a process does or confuses two related concepts. Keeping <strong>terminology consistent</strong> matters as well: if ‘osmosis’ is rendered one way in the first lecture and another way in the fifth, students lose the thread that connects the course.
            </p>
            <p>The English statement always stays on screen next to the Kiswahili, so students can check one against the other and nothing the lecturer said is hidden.</p>
          </Block>

          <Block id="terminology" n="03" title="Scientific terminology development">
            <p>
              We work with Kiswahili language specialists and subject experts on university-level Biology vocabulary. Each glossary entry includes the English term, the agreed Kiswahili term, definitions in both languages and notes on usage. Entries go through review before they are treated as approved.
            </p>
            <p>Scientific terminology needs interpretation in context. Swapping one word for another is not enough. Some examples:</p>
            <div className="not-prose overflow-hidden rounded-2xl border border-slate-200">
              <div className="hidden grid-cols-[1fr_1fr_1fr] bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 sm:grid">
                <p className="p-4">English (in a Biology lecture)</p>
                <p className="p-4">Direct substitution</p>
                <p className="p-4">Contextual rendering</p>
              </div>
              {contextExamples.map((e) => (
                <div key={e.en} className="border-t border-slate-200 first:border-0 sm:first:border-t">
                  <div className="grid gap-1 p-4 sm:grid-cols-[1fr_1fr_1fr] sm:gap-0 sm:p-0">
                    <p className="font-semibold sm:p-4">{e.en}</p>
                    <p className="text-red-300 line-through decoration-red-300 sm:p-4" lang="sw">{e.wrong}</p>
                    <p className="font-semibold text-emerald-300 sm:p-4" lang="sw">{e.right}</p>
                  </div>
                  <p className="px-4 pb-4 text-sm text-slate-600">{e.note}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-500">
              Examples are for illustration. Approved terms come from the reviewed AI254 Biology glossary.{" "}
              <a href="/glossary" className="font-semibold text-cyan-300 underline underline-offset-4">Browse the science glossary</a>.
            </p>
          </Block>

          <Block id="classroom" n="04" title="Classroom technology">
            <p>AI254 LIVE provides three interfaces that share one live session:</p>
            <div className="grid gap-4 md:grid-cols-3">
              <Iface t="Student interface" b="Students join with their admission number and a session code or QR code. They read the English transcription and Kiswahili translation, open terminology explanations, keep notes and ask questions by voice or text." />
              <Iface t="Lecturer interface" b="Lecturers sign in, create a session for their subject, start and stop the live session, switch microphone capture on or off, check the output and see how many students are connected." />
              <Iface t="Administrator interface" b="Authorised staff manage lecturer accounts, monitor sessions, review system logs and errors, maintain terminology resources and handle demonstration requests." />
            </div>
            <p>
              <Link href="/live" className="font-semibold text-cyan-300 underline decoration-cyan-400 underline-offset-4">Open AI254 LIVE</Link> to try the student and lecturer experience in demonstration mode.
            </p>
          </Block>

          <Block id="evaluation" n="05" title="Testing and evaluation">
            <p>We test AI254 in real lectures and record what we find. The two classroom pilots at Maasai Mara University used several sources of evidence:</p>
            <ul className="grid gap-3 sm:grid-cols-2">
              <Challenge t="Student questionnaires" b="Students’ experience of following the lecture, their comprehension, participation and confidence." />
              <Challenge t="Lecturer interviews" b="How the system fits into normal teaching, and what lecturers noticed in the output." />
              <Challenge t="Classroom observations" b="How students used their devices during the lecture and where problems came up." />
              <Challenge t="System logs" b="Processing times, recognition and translation errors, and connection behaviour during sessions." />
            </ul>
            <p>Findings go straight back into development, especially work on technical vocabulary, translation delay and readability on mobile.</p>
            <div className="rounded-2xl border-l-4 border-amber-400 bg-amber-400/10 p-6">
              <p className="font-semibold text-amber-200">AI254 is an evolving technology</p>
              <p className="mt-2 mb-0 text-amber-200">
                AI254 LIVE is still under active development and has been tested in early-stage pilots only. Wider deployment across courses or institutions will need further testing, evaluation in other teaching environments, and expanded terminology resources.
              </p>
            </div>
          </Block>
        </div>
      </div>

      <CtaBand title="See the work in practice" body="Request a demonstration to see AI254 LIVE in a lecture setting and talk through how it could be evaluated in your department." />
    </>
  );
}

function Block({ id, n, title, children }: { id: string; n: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28">
      <span className="font-mono text-sm font-semibold text-cyan-300">{n}</span>
      <h2 className="mt-2 text-3xl font-bold">{title}</h2>
      <div className="prose-body mt-6 space-y-5 text-[17px] [&_p]:mb-0">{children}</div>
    </section>
  );
}

function Challenge({ t, b }: { t: string; b: string }) {
  return (
    <li className="list-none rounded-xl border border-slate-200 bg-surface p-5">
      <p className="font-semibold text-brand-ink">{t}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{b}</p>
    </li>
  );
}

function Iface({ t, b }: { t: string; b: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-5">
      <p className="font-semibold text-brand-ink">{t}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{b}</p>
    </div>
  );
}
