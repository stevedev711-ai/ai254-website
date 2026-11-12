import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { getCurrentUser } from "@/lib/auth";
import { liveServicesConfigured } from "@/lib/live/services";

export const metadata: Metadata = {
  title: { default: "AI254 LIVE", template: "%s · AI254 LIVE" },
  description: "AI254 LIVE — real-time Kiswahili lecture support.",
};

export default async function LiveLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const live = liveServicesConfigured();
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/live" aria-label="AI254 LIVE home">
            <Logo suffix="LIVE" />
          </Link>
          <div className="flex items-center gap-2 text-sm">
            {!live && (
              <span className="demo-badge hidden md:inline-flex" title="AI254 speech and translation services are not connected on this server">
                Demonstration environment
              </span>
            )}
            {user ? (
              <>
                <Link href={user.role === "ADMIN" ? "/live/admin" : "/live/lecturer"} className="btn-ghost btn-sm hidden sm:inline-flex">
                  {user.name} · {user.role === "ADMIN" ? "Admin" : "Lecturer"}
                </Link>
                <form action="/api/auth/logout" method="post">
                  <button className="btn-outline btn-sm">Sign out</button>
                </form>
              </>
            ) : (
              <Link href="/" className="btn-ghost btn-sm">← ai254.net</Link>
            )}
          </div>
        </div>
      </header>
      <div id="main" className="flex-1">{children}</div>
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        AI254 LIVE · Automatic transcription and translation may contain errors. Always follow the lecturer&apos;s original explanation. ·{" "}
        <Link href="/privacy" className="underline">Privacy</Link>
      </footer>
    </div>
  );
}
