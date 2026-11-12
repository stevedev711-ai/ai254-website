import { JoinForm } from "@/components/live/JoinForm";
import { InstallApp } from "@/components/live/InstallApp";

export const metadata = { title: "Join a lecture" };

export default async function StudentJoinPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code } = await searchParams;
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <p className="eyebrow">Student</p>
      <h1 className="mt-2 text-3xl font-bold">Join a lecture</h1>
      <p className="mt-2 text-slate-600">Enter your admission number, then choose an active lecture or type the session code your lecturer shows.</p>
      <JoinForm initialCode={code?.toUpperCase()} />
      <div className="mt-10">
        <InstallApp compact />
      </div>
    </main>
  );
}
