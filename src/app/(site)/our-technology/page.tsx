import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/site/PageHeader";
import { ArchitectureDiagram } from "@/components/site/ArchitectureDiagram";

export const metadata: Metadata = {
  title: "Our Technology",
  description:
    "How AI254 LIVE works: audio capture, speech recognition, Kiswahili translation, Biology terminology resources, session management, lecturer controls and data protection.",
  alternates: { canonical: "/our-technology" },
};

type Status = "op" | "dev" | "int";
const statusLabel: Record<Status, string> = { op: "Operational", dev: "In development", int: "Connects to AI254 services" };

const responsibilities = [
  ["Lecturer microphone", "Captures the lecturer's voice. A clip-on or headset microphone connected to the lecturer's laptop gives the clearest input in a lecture hall."],
  ["Audio capture (on/off)", "The lecturer's browser records short audio chunks and sends them to AI254 LIVE only while capture is switched on. Switching it off stops audio leaving the device straight away."],
  ["Speech-to-text processing", "The AI254 speech recognition service converts each chunk of audio into English text."],
  ["English transcript", "Text is assembled into sentence-level statements, given a sequence number within the session and stored so students who join late can catch up."],
  ["Kiswahili translation", "Each statement is sent to the AI254 translation pipeline together with the session's subject."],
  ["Scientific terminology processing", "Glossary entries for the subject are passed to translation and linked to the statement, so students can open the definition of each term."],
  ["Student display", "Students' devices receive new statements as they are published and show English and Kiswahili together, or Kiswahili on its own."],
] as const;

const capabilities: { t: string; s: Status; b: string }[] = [
  { t: "Live session management", s: "op", b: "Lecturers create sessions with a course code, subject, introduction and summary. Each session gets a six-character join code and a QR code, and moves through Scheduled → Live → Paused → Ended." },
  { t: "Audio processing", s: "int", b: "The lecturer's browser captures audio with the standard MediaRecorder API, applying echo cancellation and noise suppression where the device supports them. Chunks are forwarded server-side to the speech service; the web application does not keep audio files." },
  { t: "Speech recognition", s: "int", b: "Provided by the AI254 speech recognition service through a single adapter module. The interface does not depend on any particular recognition engine, so it can be improved or replaced without rebuilding the application." },
  { t: "Translation processing", s: "int", b: "Provided by the AI254 translation pipeline. Each request includes the subject and the relevant glossary entries; the response is stored with the English statement and the processing time reported by the service." },
  { t: "Biology terminology resources", s: "op", b: "A managed glossary of English terms, Kiswahili terms, definitions in both languages and usage notes. Each entry carries a review status (Draft, In review, Reviewed), so it is clear which terms have been approved." },
  { t: "Student access and note-taking", s: "op", b: "Students join with their admission number, without creating an account. They can read recent statements, open terminology explanations, write notes kept on their own device and download them, ask questions by voice in English or Kiswahili, and leave or rejoin." },
  { t: "Lecturer controls", s: "op", b: "Sign-in, session creation for any STEM subject, start/pause/end, microphone capture on/off, permission for students to ask spoken questions, a live view of transcription and translation, connected-student count and incoming questions." },
  { t: "Administration and session monitoring", s: "op", b: "Administrators can see every session and its activity, manage lecturer accounts, maintain terminology, review demonstration requests and contact messages, and read system and error logs." },
  { t: "Latency and translation accuracy", s: "dev", b: "Processing time for recognition and translation is recorded for every statement and shown in the administration logs. These measurements are used to guide improvements. We do not publish latency or accuracy guarantees." },
  { t: "Data protection and privacy", s: "op", b: "Staff passwords are stored as salted hashes, sign-in sessions use signed, HTTP-only cookies, and administration endpoints check the user's role. Students are identified only by admission number. IP addresses are stored only as salted hashes for spam and rate-limit checks. Credentials are kept in server environment variables and never sent to the browser." },
];

const priorities = [
  ["Reduced translation delay", "Shortening the time between the lecturer finishing a statement and the Kiswahili text appearing on students' screens."],
  ["Technical vocabulary recognition", "Improving how reliably speech recognition picks up specialised scientific terms."],
  ["Rapid speech handling", "Better segmentation when lecturers speak quickly, correct themselves or leave sentences unfinished."],
  ["Mobile readability", "Clearer layouts, text sizes and update behaviour on small phone screens in bright lecture halls."],
  ["Expanded scientific terminology", "Extending the reviewed glossary beyond the initial Biology work to other STEM subjects."],
];

export default function TechnologyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our Technology"
        title="How AI254 LIVE Works"
        intro="A technical overview for university IT teams, technology partners and funders. It covers what each part of the system does, how the parts connect, and which features are operational and which are still in development."
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/live" className="btn-primary">Launch AI254 LIVE</Link>
          <Link href="/request-a-demo?interest=Technical%20architecture" className="btn-outline">Request a Technical Demo</Link>
        </div>
      </PageHeader>

      <section className="section">
        <div className="container-x">
          <ArchitectureDiagram />
          <div className="mt-12 grid gap-x-10 gap-y-6 md:grid-cols-2">
            {responsibilities.map(([t, b], k) => (
              <div key={t} className="flex gap-4">
                <span className="font-mono text-sm font-semibold text-cyan-300">{String(k + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-semibold">{t}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-slate-600">{b}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section border-y border-slate-100 bg-slate-50/60">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="eyebrow">System components</p>
              <h2 className="h-section mt-3">What is in place, and what is still being built</h2>
            </div>
            <ul className="flex flex-wrap gap-2 text-xs" aria-label="Status key">
              <li className="status-op">Operational</li>
              <li className="badge bg-navy-400/15 text-cyan-200 ring-1 ring-navy-400/30">Connects to AI254 services</li>
              <li className="status-dev">In development</li>
            </ul>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {capabilities.map((c) => (
              <article key={c.t} className="card p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="text-lg font-bold">{c.t}</h3>
                  <span className={c.s === "op" ? "status-op" : c.s === "dev" ? "status-dev" : "badge bg-navy-400/15 text-cyan-200 ring-1 ring-navy-400/30"}>{statusLabel[c.s]}</span>
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{c.b}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 max-w-3xl text-sm text-slate-500">
            “Operational” means the feature works in the current AI254 LIVE application. “Connects to AI254 services” means AI254 LIVE passes the work to AI254&apos;s speech and translation services through a defined integration point. Where those services are not connected, AI254 LIVE runs in a clearly labelled demonstration mode with sample lecture content.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="eyebrow">Roadmap</p>
            <h2 className="h-section mt-3">Current Development Priorities</h2>
            <p className="lead mt-4">These come directly from what the classroom pilots showed and from our technical evaluation.</p>
          </div>
          <ol className="space-y-3">
            {priorities.map(([t, b], k) => (
              <li key={t} className="card flex gap-5 p-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-400/15 font-mono text-sm font-bold text-cyan-300">{k + 1}</span>
                <div>
                  <h3 className="font-semibold">{t}</h3>
                  <p className="mt-1 text-[15px] text-slate-600">{b}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-x">
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-navy-900 p-8 text-white sm:p-12 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">See the architecture in operation</h2>
              <p className="mt-2 max-w-xl text-navy-100">Try AI254 LIVE yourself, or ask us for a technical walkthrough for your IT team.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/live" className="btn bg-surface text-cyan-300 hover:bg-navy-400/15">Launch AI254 LIVE</Link>
              <Link href="/request-a-demo?interest=Technical%20architecture" className="btn border border-white/40 text-white hover:bg-white/10">Request a Technical Demo</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
