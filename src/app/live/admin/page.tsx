import Link from "next/link";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { mailConfigured } from "@/lib/mail";
import { liveServicesConfigured } from "@/lib/live/services";
import { CONNECTED_WINDOW_MS } from "@/lib/live/engine";
import { STEM_SUBJECTS } from "@/lib/subjects";
import { ActionForm, ConfirmButton } from "@/components/live/ActionForm";
import {
  createUser, deleteTeamMember, deleteTerm, endSession, resetPassword, saveTeamMember, saveTerm,
  setMessageStatus, setTermStatus, setUserActive, updateRequest,
} from "./actions";

export const metadata = { title: "Administration", robots: { index: false } };
export const dynamic = "force-dynamic";

const TABS = [
  ["overview", "Overview"],
  ["sessions", "Sessions"],
  ["lecturers", "Lecturer accounts"],
  ["terms", "Terminology"],
  ["requests", "Demo requests"],
  ["messages", "Messages"],
  ["team", "Team page"],
  ["logs", "Performance logs"],
  ["errors", "Errors"],
] as const;
type Tab = (typeof TABS)[number][0];

const fmt = (d: Date | null | undefined) => (d ? d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Nairobi" }) : "—");

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string; q?: string; subject?: string; edit?: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/live/login?role=admin");
  const sp = await searchParams;
  const tab: Tab = (TABS.find(([k]) => k === sp.tab)?.[0] ?? "overview") as Tab;

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Administrator</p>
          <h1 className="mt-1 text-3xl font-bold">AI254 LIVE administration</h1>
        </div>
      </div>
      <nav aria-label="Administration sections" className="mt-6 flex gap-1 overflow-x-auto border-b border-slate-200">
        {TABS.map(([k, l]) => (
          <Link key={k} href={`/live/admin?tab=${k}`} aria-current={tab === k ? "page" : undefined} className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium ${tab === k ? "border-navy-500 text-cyan-300" : "border-transparent text-slate-600 hover:text-brand-ink"}`}>
            {l}
          </Link>
        ))}
      </nav>
      <div className="mt-8">
        {tab === "overview" && <Overview />}
        {tab === "sessions" && <Sessions />}
        {tab === "lecturers" && <Lecturers meId={user.sub} />}
        {tab === "terms" && <Terms q={sp.q} subject={sp.subject} edit={sp.edit} />}
        {tab === "requests" && <Requests />}
        {tab === "messages" && <Messages />}
        {tab === "team" && <Team edit={sp.edit} />}
        {tab === "logs" && <Logs />}
        {tab === "errors" && <Errors />}
      </div>
    </main>
  );
}

/* ---------------------------------------------------------------- Overview */

async function Overview() {
  const since = new Date(Date.now() - CONNECTED_WINDOW_MS);
  const [live, liveDemo, connected, newRequests, errors24, lecturers, terms] = await Promise.all([
    prisma.lectureSession.count({ where: { status: { in: ["LIVE", "PAUSED"] }, mode: "LIVE" } }),
    prisma.lectureSession.count({ where: { status: { in: ["LIVE", "PAUSED"] }, mode: "DEMO" } }),
    prisma.participant.count({ where: { leftAt: null, lastSeenAt: { gte: since }, session: { mode: "LIVE" } } }),
    prisma.demoRequest.count({ where: { status: "NEW" } }),
    prisma.systemLog.count({ where: { level: "ERROR", createdAt: { gte: new Date(Date.now() - 86400_000) } } }),
    prisma.user.count({ where: { role: "LECTURER", active: true } }),
    prisma.term.groupBy({ by: ["status"], _count: true }),
  ]);
  const termCount = (s: string) => terms.find((t) => t.status === s)?._count ?? 0;
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Live sessions (real processing)" value={live} sub={`${liveDemo} demonstration sessions active`} />
        <Stat label="Students connected to live sessions" value={connected} sub="Seen in the last 30 seconds" />
        <Stat label="New demo requests" value={newRequests} href="/live/admin?tab=requests" />
        <Stat label="Errors in last 24 hours" value={errors24} href="/live/admin?tab=errors" warn={errors24 > 0} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="font-bold">Service configuration</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <ConfigRow ok={liveServicesConfigured()} label="AI254 speech & translation services" okText="Connected (AI254_ASR_URL, AI254_TRANSLATE_URL)" badText="Not connected: AI254 LIVE runs in demonstration mode" />
            <ConfigRow ok={mailConfigured()} label="Email notifications (SMTP)" okText="Configured" badText="Not configured: submissions are saved but no emails are sent" />
            <ConfigRow ok={Boolean(process.env.TURNSTILE_SECRET_KEY)} label="Turnstile bot check" okText="Enabled" badText="Optional: honeypot, timing and rate limits are active" neutral />
          </ul>
        </section>
        <section className="card p-6">
          <h2 className="font-bold">Accounts & resources</h2>
          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-slate-500">Active lecturers</dt><dd className="text-xl font-bold">{lecturers}</dd></div>
            <div><dt className="text-slate-500">Reviewed terms</dt><dd className="text-xl font-bold">{termCount("REVIEWED")}</dd></div>
            <div><dt className="text-slate-500">Terms in draft / review</dt><dd className="text-xl font-bold">{termCount("DRAFT") + termCount("IN_REVIEW")}</dd></div>
            <div><dt className="text-slate-500">Sample (demo) terms</dt><dd className="text-xl font-bold">{termCount("SAMPLE")}</dd></div>
          </dl>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, href, warn }: { label: string; value: number; sub?: string; href?: string; warn?: boolean }) {
  const inner = (
    <>
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${warn ? "text-red-300" : ""}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </>
  );
  return href ? <Link href={href} className="card block p-5 hover:border-navy-400/60">{inner}</Link> : <div className="card p-5">{inner}</div>;
}

function ConfigRow({ ok, label, okText, badText, neutral }: { ok: boolean; label: string; okText: string; badText: string; neutral?: boolean }) {
  return (
    <li className="flex gap-3">
      <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${ok ? "bg-emerald-500" : neutral ? "bg-slate-300" : "bg-amber-500"}`} aria-hidden />
      <span><span className="font-medium">{label}</span><br /><span className="text-slate-500">{ok ? okText : badText}</span></span>
    </li>
  );
}

/* ---------------------------------------------------------------- Sessions */

async function Sessions() {
  const since = new Date(Date.now() - CONNECTED_WINDOW_MS);
  const sessions = await prisma.lectureSession.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 100,
    include: {
      lecturer: { select: { name: true } },
      _count: { select: { segments: true, participants: true, questions: true } },
      participants: { where: { leftAt: null, lastSeenAt: { gte: since } }, select: { id: true } },
    },
  });
  return (
    <Table head={["Session", "Lecturer", "Mode", "Status", "Connected / joined", "Statements", "Questions", "Started", ""]}>
      {sessions.map((s) => (
        <tr key={s.id} className="align-top">
          <td className="px-4 py-3"><p className="font-semibold">{s.title}</p><p className="text-xs text-slate-500">{s.courseCode} · {s.subject} · <span className="font-mono">{s.code}</span></p></td>
          <td className="px-4 py-3">{s.lecturer?.name ?? <span className="text-slate-400">Public demo</span>}</td>
          <td className="px-4 py-3">{s.mode === "DEMO" ? <span className="demo-badge">Demo</span> : <span className="badge bg-navy-400/15 text-cyan-200">Live</span>}</td>
          <td className="px-4 py-3">{s.status}</td>
          <td className="px-4 py-3">{s.participants.length} / {s._count.participants}</td>
          <td className="px-4 py-3">{s._count.segments}</td>
          <td className="px-4 py-3">{s._count.questions}</td>
          <td className="whitespace-nowrap px-4 py-3 text-xs">{fmt(s.startedAt)}</td>
          <td className="px-4 py-3">
            <div className="flex gap-2">
              <Link href={`/live/lecturer/${s.id}`} className="btn-outline btn-sm">Monitor</Link>
              {s.status !== "ENDED" && (
                <form action={endSession}><input type="hidden" name="id" value={s.id} /><ConfirmButton label="End" confirm="End this session for all students?" className="btn-sm btn border border-red-400/40 text-red-300" /></form>
              )}
            </div>
          </td>
        </tr>
      ))}
    </Table>
  );
}

/* ---------------------------------------------------------------- Lecturers */

async function Lecturers({ meId }: { meId: string }) {
  const users = await prisma.user.findMany({ orderBy: [{ role: "asc" }, { name: "asc" }], include: { _count: { select: { sessions: true } } } });
  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
      <Table head={["Name", "Email", "Role", "Sessions", "Last sign-in", "Status", ""]}>
        {users.map((u) => (
          <tr key={u.id} className="align-top">
            <td className="px-4 py-3 font-semibold">{u.name}<p className="text-xs font-normal text-slate-500">{u.department}</p></td>
            <td className="px-4 py-3">{u.email}</td>
            <td className="px-4 py-3">{u.role === "ADMIN" ? "Administrator" : "Lecturer"}</td>
            <td className="px-4 py-3">{u._count.sessions}</td>
            <td className="whitespace-nowrap px-4 py-3 text-xs">{fmt(u.lastLoginAt)}</td>
            <td className="px-4 py-3">{u.active ? <span className="status-op">Active</span> : <span className="badge bg-slate-100 text-slate-600">Inactive</span>}</td>
            <td className="px-4 py-3">
              {u.id !== meId && (
                <div className="flex flex-col gap-2">
                  <form action={setUserActive}>
                    <input type="hidden" name="id" value={u.id} />
                    <input type="hidden" name="active" value={String(!u.active)} />
                    <button className="btn-outline btn-sm w-full">{u.active ? "Deactivate" : "Activate"}</button>
                  </form>
                  <details>
                    <summary className="cursor-pointer text-xs font-semibold text-cyan-300">Reset password</summary>
                    <ActionForm action={resetPassword} submitLabel="Set password" className="mt-2" resetOnSuccess>
                      <input type="hidden" name="id" value={u.id} />
                      <input name="password" type="password" minLength={12} required placeholder="New password (12+ chars)" className="input text-sm" autoComplete="new-password" />
                    </ActionForm>
                  </details>
                </div>
              )}
            </td>
          </tr>
        ))}
      </Table>
      <section className="card h-fit p-6">
        <h2 className="font-bold">Add an account</h2>
        <ActionForm action={createUser} submitLabel="Create account" className="mt-4 space-y-3" resetOnSuccess>
          <input name="name" required placeholder="Full name" className="input" aria-label="Full name" />
          <input name="email" type="email" required placeholder="Email" className="input" aria-label="Email" />
          <input name="department" placeholder="Department (optional)" className="input" aria-label="Department" />
          <select name="role" className="input" aria-label="Role" defaultValue="LECTURER">
            <option value="LECTURER">Lecturer</option>
            <option value="ADMIN">Administrator</option>
          </select>
          <input name="password" type="password" required minLength={12} placeholder="Temporary password (12+ characters)" className="input" aria-label="Temporary password" autoComplete="new-password" />
        </ActionForm>
      </section>
    </div>
  );
}

/* ---------------------------------------------------------------- Terminology */

const TERM_STATUS: Record<string, string> = { SAMPLE: "Sample (demo)", DRAFT: "Draft", IN_REVIEW: "In review", REVIEWED: "Reviewed" };

async function Terms({ q, subject, edit }: { q?: string; subject?: string; edit?: string }) {
  const where: Prisma.TermWhereInput = {
    ...(subject ? { subject } : {}),
    ...(q ? { OR: [{ english: { contains: q, mode: "insensitive" } }, { kiswahili: { contains: q, mode: "insensitive" } }] } : {}),
  };
  const [terms, editing] = await Promise.all([
    prisma.term.findMany({ where, orderBy: [{ subject: "asc" }, { english: "asc" }], take: 500 }),
    edit ? prisma.term.findUnique({ where: { id: edit } }) : null,
  ]);
  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_400px]">
      <div>
        <form className="mb-4 flex flex-wrap gap-2">
          <input type="hidden" name="tab" value="terms" />
          <input name="q" defaultValue={q} placeholder="Search English or Kiswahili" className="input max-w-xs" aria-label="Search terms" />
          <select name="subject" defaultValue={subject ?? ""} className="input max-w-[220px]" aria-label="Subject filter">
            <option value="">All subjects</option>
            {STEM_SUBJECTS.flatMap((g) => g.subjects).map((s) => <option key={s}>{s}</option>)}
          </select>
          <button className="btn-outline btn-sm">Filter</button>
        </form>
        <Table head={["English", "Kiswahili", "Subject", "Definitions", "Status", ""]}>
          {terms.map((t) => (
            <tr key={t.id} className="align-top">
              <td className="px-4 py-3 font-semibold">{t.english}</td>
              <td className="px-4 py-3 font-semibold text-cyan-200" lang="sw">{t.kiswahili}</td>
              <td className="px-4 py-3">{t.subject}</td>
              <td className="max-w-sm px-4 py-3 text-xs text-slate-600"><p lang="sw">{t.definitionSw}</p>{t.usageNote && <p className="mt-1 text-amber-200">{t.usageNote}</p>}</td>
              <td className="px-4 py-3">
                <form action={setTermStatus} className="flex gap-1">
                  <input type="hidden" name="id" value={t.id} />
                  <select name="status" defaultValue={t.status} className="input py-1.5 text-xs" aria-label={`Status of ${t.english}`}>
                    {Object.entries(TERM_STATUS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                  <button className="btn-outline btn-sm">Set</button>
                </form>
                {t.reviewedBy && <p className="mt-1 text-[11px] text-slate-500">Reviewed by {t.reviewedBy}</p>}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Link href={`/live/admin?tab=terms&edit=${t.id}`} className="btn-outline btn-sm">Edit</Link>
                  <form action={deleteTerm}><input type="hidden" name="id" value={t.id} /><ConfirmButton label="Delete" confirm={`Delete “${t.english}”?`} className="btn-sm btn text-red-300 hover:bg-red-400/10" /></form>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </div>
      <section className="card h-fit p-6">
        <h2 className="font-bold">{editing ? `Edit “${editing.english}”` : "Add a term"}</h2>
        <ActionForm key={editing?.id ?? "new"} action={saveTerm} submitLabel={editing ? "Save changes" : "Add term"} className="mt-4 space-y-3" resetOnSuccess={!editing}>
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <select name="subject" defaultValue={editing?.subject ?? "Biology"} className="input" aria-label="Subject">
            {STEM_SUBJECTS.map((g) => <optgroup key={g.group} label={g.group}>{g.subjects.map((s) => <option key={s}>{s}</option>)}</optgroup>)}
          </select>
          <input name="english" defaultValue={editing?.english} required placeholder="English term" className="input" aria-label="English term" />
          <input name="kiswahili" defaultValue={editing?.kiswahili} required placeholder="Kiswahili term" className="input" aria-label="Kiswahili term" lang="sw" />
          <textarea name="definitionEn" defaultValue={editing?.definitionEn ?? ""} rows={2} placeholder="Definition (English)" className="input" aria-label="Definition in English" />
          <textarea name="definitionSw" defaultValue={editing?.definitionSw ?? ""} rows={2} placeholder="Ufafanuzi (Kiswahili)" className="input" aria-label="Definition in Kiswahili" lang="sw" />
          <textarea name="usageNote" defaultValue={editing?.usageNote ?? ""} rows={2} placeholder="Usage / context note" className="input" aria-label="Usage note" />
          <select name="status" defaultValue={editing?.status ?? "DRAFT"} className="input" aria-label="Review status">
            {Object.entries(TERM_STATUS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
          <input name="reviewedBy" defaultValue={editing?.reviewedBy ?? ""} placeholder="Reviewed by (language specialist)" className="input" aria-label="Reviewed by" />
        </ActionForm>
        {editing && <Link href="/live/admin?tab=terms" className="mt-3 inline-block text-sm text-slate-500 underline">Cancel editing</Link>}
      </section>
    </div>
  );
}

/* ---------------------------------------------------------------- Demo requests */

const REQ_STATUS = ["NEW", "IN_REVIEW", "CONTACTED", "SCHEDULED", "COMPLETED", "CLOSED"] as const;

async function Requests() {
  const reqs = await prisma.demoRequest.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  if (!reqs.length) return <Empty>No demo requests yet.</Empty>;
  return (
    <ul className="space-y-4">
      {reqs.map((r) => (
        <li key={r.id} className="card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-lg font-bold">{r.organisation}</p>
              <p className="text-sm text-slate-600">
                {r.fullName}{r.jobTitle ? `, ${r.jobTitle}` : ""} · <a href={`mailto:${r.email}`} className="text-cyan-300 underline">{r.email}</a>
                {r.phone && <> · <a href={`tel:${r.phone.replace(/\s/g, "")}`} className="text-cyan-300 underline">{r.phone}</a></>}
              </p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p>{fmt(r.createdAt)}</p>
              <p className="mt-1">Notification: <EmailBadge s={r.notifyStatus} /> · Acknowledgement: <EmailBadge s={r.ackStatus} /></p>
            </div>
          </div>
          <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-3 lg:grid-cols-6">
            <Info k="Type" v={r.organisationType} />
            <Info k="Country" v={r.country} />
            <Info k="Interest" v={r.areaOfInterest} />
            <Info k="Preferred date" v={r.preferredDate?.toISOString().slice(0, 10)} />
            <Info k="Preferred time" v={r.preferredTime} />
            <Info k="Attendees" v={r.expectedAttendees?.toString()} />
          </dl>
          {r.message && <p className="mt-4 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{r.message}</p>}
          <ActionForm action={updateRequest} submitLabel="Update" className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-[200px_1fr]">
            <input type="hidden" name="id" value={r.id} />
            <select name="status" defaultValue={r.status} className="input text-sm" aria-label="Request status">
              {REQ_STATUS.map((s) => <option key={s} value={s}>{s.replace("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}</option>)}
            </select>
            <input name="adminNotes" defaultValue={r.adminNotes ?? ""} placeholder="Internal notes" className="input text-sm" aria-label="Internal notes" />
          </ActionForm>
        </li>
      ))}
    </ul>
  );
}

function EmailBadge({ s }: { s: string }) {
  const c = s === "SENT" ? "text-emerald-300" : s === "FAILED" ? "text-red-300" : "text-amber-200";
  return <span className={`font-semibold ${c}`}>{s.replace("_", " ").toLowerCase()}</span>;
}
function Info({ k, v }: { k: string; v?: string | null }) {
  return <div><dt className="text-xs text-slate-500">{k}</dt><dd className="font-medium">{v || "—"}</dd></div>;
}

/* ---------------------------------------------------------------- Messages */

async function Messages() {
  const msgs = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  if (!msgs.length) return <Empty>No contact messages yet.</Empty>;
  return (
    <ul className="space-y-3">
      {msgs.map((m) => (
        <li key={m.id} className={`card p-5 ${m.status === "CLOSED" ? "opacity-60" : ""}`}>
          <div className="flex flex-wrap justify-between gap-3">
            <p className="font-bold">{m.subject}</p>
            <p className="text-xs text-slate-500">{fmt(m.createdAt)} · Notification: <EmailBadge s={m.notifyStatus} /></p>
          </div>
          <p className="text-sm text-slate-600">{m.name} · <a href={`mailto:${m.email}`} className="text-cyan-300 underline">{m.email}</a></p>
          <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{m.message}</p>
          <form action={setMessageStatus} className="mt-3">
            <input type="hidden" name="id" value={m.id} />
            <input type="hidden" name="status" value={m.status === "CLOSED" ? "NEW" : "CLOSED"} />
            <button className="btn-outline btn-sm">{m.status === "CLOSED" ? "Reopen" : "Mark as handled"}</button>
          </form>
        </li>
      ))}
    </ul>
  );
}

/* ---------------------------------------------------------------- Team */

async function Team({ edit }: { edit?: string }) {
  const [members, editing] = await Promise.all([
    prisma.teamMember.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    edit ? prisma.teamMember.findUnique({ where: { id: edit } }) : null,
  ]);
  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_400px]">
      <div>
        <p className="mb-4 text-sm text-slate-600">Profiles appear on the public <Link href="/who-we-are" className="underline">Who We Are</Link> page only when published. Add only authorised team members, with their consent.</p>
        {members.length === 0 ? <Empty>No team members added yet.</Empty> : (
          <Table head={["Order", "Name", "Role", "Published", ""]}>
            {members.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-3">{m.sortOrder}</td>
                <td className="px-4 py-3 font-semibold">{m.name}</td>
                <td className="px-4 py-3">{m.role}</td>
                <td className="px-4 py-3">{m.published ? <span className="status-op">Published</span> : <span className="badge bg-slate-100 text-slate-600">Hidden</span>}</td>
                <td className="px-4 py-3"><div className="flex gap-2">
                  <Link href={`/live/admin?tab=team&edit=${m.id}`} className="btn-outline btn-sm">Edit</Link>
                  <form action={deleteTeamMember}><input type="hidden" name="id" value={m.id} /><ConfirmButton label="Remove" confirm={`Remove ${m.name}?`} className="btn-sm btn text-red-300 hover:bg-red-400/10" /></form>
                </div></td>
              </tr>
            ))}
          </Table>
        )}
      </div>
      <section className="card h-fit p-6">
        <h2 className="font-bold">{editing ? `Edit ${editing.name}` : "Add a team member"}</h2>
        <ActionForm key={editing?.id ?? "new"} action={saveTeamMember} submitLabel={editing ? "Save" : "Add"} className="mt-4 space-y-3" resetOnSuccess={!editing}>
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <input name="name" defaultValue={editing?.name} required placeholder="Full name" className="input" aria-label="Full name" />
          <input name="role" defaultValue={editing?.role} required placeholder="Role / title" className="input" aria-label="Role" />
          <textarea name="bio" defaultValue={editing?.bio ?? ""} rows={4} placeholder="Short biography" className="input" aria-label="Biography" />
          <input name="photoUrl" defaultValue={editing?.photoUrl ?? ""} placeholder="Photograph URL (https://…)" className="input" aria-label="Photograph URL" />
          <input name="sortOrder" type="number" min={0} defaultValue={editing?.sortOrder ?? 0} className="input" aria-label="Display order" />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={editing?.published} className="h-4 w-4 accent-navy-500" /> Publish on website</label>
        </ActionForm>
      </section>
    </div>
  );
}

/* ---------------------------------------------------------------- Logs */

async function Logs() {
  const [perf, agg, other] = await Promise.all([
    prisma.segment.findMany({ where: { source: "LIVE" }, orderBy: { createdAt: "desc" }, take: 50, include: { session: { select: { code: true, courseCode: true } } } }),
    prisma.segment.aggregate({ where: { source: "LIVE", createdAt: { gte: new Date(Date.now() - 7 * 86400_000) } }, _avg: { asrMs: true, translateMs: true }, _count: true }),
    prisma.systemLog.findMany({ where: { level: { in: ["INFO", "WARN"] } }, orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-lg font-bold">Processing performance (live sessions only)</h2>
        <p className="mt-1 text-sm text-slate-600">Times reported for statements produced by the connected AI254 services. Demonstration sessions are excluded.</p>
        {agg._count === 0 ? (
          <Empty>No live-processed statements recorded yet. Figures appear here once lectures run with the AI254 services connected.</Empty>
        ) : (
          <>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Stat label="Statements (last 7 days)" value={agg._count} />
              <Stat label="Average speech recognition (ms)" value={Math.round(agg._avg.asrMs ?? 0)} />
              <Stat label="Average translation (ms)" value={Math.round(agg._avg.translateMs ?? 0)} />
            </div>
            <div className="mt-4">
              <Table head={["Time", "Session", "Seq", "ASR ms", "Translate ms", "English"]}>
                {perf.map((p) => (
                  <tr key={p.id}>
                    <td className="whitespace-nowrap px-4 py-2 text-xs">{fmt(p.createdAt)}</td>
                    <td className="px-4 py-2 font-mono text-xs">{p.session.code}</td>
                    <td className="px-4 py-2">{p.seq}</td>
                    <td className="px-4 py-2">{p.asrMs ?? "—"}</td>
                    <td className="px-4 py-2">{p.translateMs ?? "—"}</td>
                    <td className="max-w-md truncate px-4 py-2 text-xs text-slate-600">{p.english}</td>
                  </tr>
                ))}
              </Table>
            </div>
          </>
        )}
      </section>
      <section>
        <h2 className="text-lg font-bold">System activity</h2>
        <LogTable logs={other} />
      </section>
    </div>
  );
}

async function Errors() {
  const logs = await prisma.systemLog.findMany({ where: { level: "ERROR" }, orderBy: { createdAt: "desc" }, take: 200 });
  return logs.length ? <LogTable logs={logs} showMeta /> : <Empty>No errors recorded.</Empty>;
}

function LogTable({ logs, showMeta }: { logs: { id: string; level: string; source: string; message: string; meta: Prisma.JsonValue; sessionId: string | null; createdAt: Date }[]; showMeta?: boolean }) {
  if (!logs.length) return <Empty>No entries.</Empty>;
  return (
    <div className="mt-4">
      <Table head={["Time", "Level", "Source", "Message", showMeta ? "Details" : ""]}>
        {logs.map((l) => (
          <tr key={l.id} className="align-top">
            <td className="whitespace-nowrap px-4 py-2 text-xs">{fmt(l.createdAt)}</td>
            <td className="px-4 py-2"><span className={`text-xs font-semibold ${l.level === "ERROR" ? "text-red-300" : l.level === "WARN" ? "text-amber-200" : "text-slate-500"}`}>{l.level}</span></td>
            <td className="px-4 py-2 font-mono text-xs">{l.source}</td>
            <td className="px-4 py-2 text-sm">{l.message}</td>
            <td className="px-4 py-2">{showMeta && l.meta && <pre className="max-w-md overflow-x-auto whitespace-pre-wrap break-all text-[11px] text-slate-500">{JSON.stringify(l.meta, null, 1)}</pre>}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

/* ---------------------------------------------------------------- shared */

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
          <tr>{head.map((h, i) => <th key={i} scope="col" className="px-4 py-3 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">{children}</p>;
}
