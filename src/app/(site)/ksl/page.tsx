import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, SectionHeading } from "@/components/site/PageHeader";
import { KslGloveDemo } from "@/components/site/KslGloveDemo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kenyan Sign Language (KSL)",
  description: "Kenyan Sign Language (KSL) and AI254: a sensor glove and offline Android app for Deaf and hard-of-hearing students, with an interactive demo.",
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
              Below is an early look at the AI254 KSL glove and classroom app. If you are a university, Deaf-led organisation, KSL interpreter or researcher interested in accessible lecture support, we would like to hear from you.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/contact" className="btn-primary">Contact Us</Link>
              <a href={`mailto:${site.email}?subject=Kenyan%20Sign%20Language%20(KSL)`} className="btn-outline">{site.email}</a>
            </div>
          </article>
        </div>
      </section>

      <section className="section border-t border-slate-100">
        <div className="container-x">
          <SectionHeading eyebrow="AI254 KSL glove" title="Lecture captions and classroom signing">
            An Android app that captions the lecturer in English or Kiswahili without internet, and a sensor glove that turns a small, reviewed set of KSL classroom signs into spoken phrases, only after the student confirms them.
          </SectionHeading>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="btn-cyan" href={APK_URL}>Download the Android app (APK)</a>
            <a className="btn-outline" href={SOURCE_URL}>Source code on GitHub</a>
          </div>
          <p className="mt-3 text-sm text-slate-500">Test build for Android 13 or newer phones with a 64-bit ARM processor.</p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HOW.map((item) => (
              <article key={item.title} className="card p-6">
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
              </article>
            ))}
          </div>

          <h3 id="try-it" className="mt-16 text-2xl font-bold">Try the sign reader</h3>
          <p className="demo-badge mt-4">Simulation: no glove connected</p>
          <p className="mt-3 max-w-3xl leading-relaxed text-slate-600">
            This page invents two seconds of glove readings and runs a classifier with the same design as the app&apos;s. That classifier was trained on simulated data, not real KSL, so it shows how the system works, not how well it recognises real signs.
          </p>
          <div className="mt-8">
            <KslGloveDemo />
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-2">
            <div>
              <h3 className="text-2xl font-bold">Get it running</h3>
              <ol className="mt-4 list-decimal space-y-3 pl-5 leading-relaxed text-slate-600">
                <li><strong className="text-slate-800">Install the app</strong> from the APK above, and allow installing from your browser when Android asks.</li>
                <li><strong className="text-slate-800">Add a speech model.</strong> Download a multilingual whisper.cpp model (Small is a good start) from the <a className="text-cyan-300 underline" href="https://github.com/ggml-org/whisper.cpp/blob/master/models/README.md">official model list</a> and use <em>Import Whisper model</em>.</li>
                <li><strong className="text-slate-800">Add an offline voice.</strong> Install English text-to-speech data in Android settings and check it works in airplane mode.</li>
                <li><strong className="text-slate-800">Build and train the glove</strong> using the wiring table and training steps in the <a className="text-cyan-300 underline" href={`${SOURCE_URL}#readme`}>project README</a>, then import the trained model and labels into the app.</li>
              </ol>
            </div>
            <div>
              <h3 className="text-2xl font-bold">What it can&apos;t do yet</h3>
              <ul className="mt-4 list-disc space-y-3 pl-5 leading-relaxed text-slate-600">
                <li>The glove reads finger bends and hand movement only. It misses facial expressions and the other hand, so it cannot translate KSL in general, only a small reviewed classroom vocabulary.</li>
                <li>Caption speed depends on the phone. Measure the delay on the actual device before relying on it in a lecture.</li>
                <li>The reference glove&apos;s Bluetooth link is unencrypted. Add authenticated pairing before using it outside a controlled setting.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

const SOURCE_URL = "https://github.com/stevedev711-ai/ai254-deaf";
const APK_URL = `${SOURCE_URL}/releases/latest/download/AI254-debug.apk`;

const HOW = [
  { title: "Captions", text: "The phone transcribes the lecturer with whisper.cpp on the device, in English or Kiswahili. Audio never leaves the phone, and the app has no internet permission." },
  { title: "The glove", text: "An ESP32 board reads five finger-bend sensors and a motion sensor 20 times a second and sends them to the phone over Bluetooth Low Energy." },
  { title: "Sign reading", text: "The app reads two seconds of glove data and runs a small on-device model. Unclear signs are rejected, and phrases are spoken only when the student confirms." },
  { title: "Training", text: "Teams record repeated examples from several consenting signers, review the vocabulary with KSL users, and test on signers the model has never seen." },
];
