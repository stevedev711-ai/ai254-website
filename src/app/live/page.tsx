import Link from "next/link";
import { liveServicesConfigured } from "@/lib/live/services";

export const dynamic = "force-dynamic";

export default function LiveLanding() {
  const live = liveServicesConfigured();
  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,#E8F6FD_0%,transparent_60%)]" aria-hidden />
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:py-24">
        <h1 className="font-display text-5xl font-extrabold sm:text-6xl">
          AI254 <span className="bg-brand-gradient bg-clip-text text-transparent">LIVE</span>
        </h1>
        <p className="mt-4 text-xl text-slate-600">Real-time Kiswahili lecture support.</p>

        {!live && (
          <p className="mx-auto mt-6 max-w-xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <strong>Demonstration environment.</strong> This server is not connected to the AI254 speech and translation services. Lectures here use sample content prepared for demonstration. They are not live system output.
          </p>
        )}

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          <Link href="/live/student" className="group card p-8 text-left transition hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-lg">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm3 17h2" /></svg>
            </span>
            <h2 className="mt-5 text-2xl font-bold">I&apos;m a Student</h2>
            <p className="mt-2 text-slate-600">Join a lecture with your admission number and follow it in English and Kiswahili.</p>
            <span className="mt-5 inline-block font-semibold text-cyan-700 group-hover:underline">Join a lecture →</span>
          </Link>
          <Link href="/live/lecturer" className="group card p-8 text-left transition hover:-translate-y-0.5 hover:border-navy-400 hover:shadow-lg">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden><path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-2.08A7 7 0 0 0 19 12h-2Z" /></svg>
            </span>
            <h2 className="mt-5 text-2xl font-bold">I&apos;m a Lecturer</h2>
            <p className="mt-2 text-slate-600">Sign in to create a session, control capture and see what your students receive.</p>
            <span className="mt-5 inline-block font-semibold text-navy-600 group-hover:underline">Lecturer sign-in →</span>
          </Link>
        </div>

        <p className="mt-10 text-sm text-slate-500">
          <Link href="/live/login?role=admin" className="font-medium text-slate-600 underline hover:text-navy-600">Administrator login</Link>
        </p>
      </div>
    </main>
  );
}
