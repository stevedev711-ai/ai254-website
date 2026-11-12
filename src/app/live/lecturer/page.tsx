import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { CreateSessionForm } from "@/components/live/CreateSessionForm";
import { liveServicesConfigured } from "@/lib/live/services";

export const metadata = { title: "Lecturer", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function LecturerDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/live/login?role=lecturer");
  const sessions = await prisma.lectureSession.findMany({
    where: { lecturerId: user.sub },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { _count: { select: { participants: true, segments: true } } },
  });
  const live = liveServicesConfigured();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="eyebrow">Lecturer</p>
      <h1 className="mt-1 text-3xl font-bold">Welcome, {user.name}</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <section className="card p-6 sm:p-8" aria-labelledby="create-h">
          <h2 id="create-h" className="text-xl font-bold">Create a lecture session</h2>
          <p className="mt-1 text-sm text-slate-600">Students join with the session code or QR code shown once you open the session.</p>
          <CreateSessionForm liveAvailable={live} />
        </section>

        <section aria-labelledby="mine-h">
          <h2 id="mine-h" className="text-xl font-bold">Your sessions</h2>
          {sessions.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">You have not created any sessions yet.</p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {sessions.map((s) => (
                <li key={s.id}>
                  <Link href={`/live/lecturer/${s.id}`} className="card flex items-center gap-4 p-4 hover:border-navy-300">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{s.title}</p>
                      <p className="text-xs text-slate-500">
                        {s.courseCode} · {s.subject} · <span className="font-mono">{s.code}</span> · {s._count.participants} joined · {s._count.segments} statements
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      {s.mode === "DEMO" && <span className="demo-badge !py-0.5 text-[10px]">Demo</span>}
                      <span className="text-xs font-medium text-slate-600">{s.status === "LIVE" ? "● Live" : s.status.charAt(0) + s.status.slice(1).toLowerCase()}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
