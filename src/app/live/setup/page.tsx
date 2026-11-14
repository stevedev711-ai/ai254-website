import { SetupForm } from "@/components/live/SetupForm";

export const metadata = { title: "Set up your account", robots: { index: false } };

export default async function SetupPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <div className="card p-8 shadow-sm">
        <p className="eyebrow">AI254 LIVE</p>
        <h1 className="mt-2 text-2xl font-bold">Set up your account</h1>
        <p className="mt-2 text-sm text-slate-600">Choose a password to finish setting up your lecturer account.</p>
        {token ? <SetupForm token={token} /> : <p className="mt-6 rounded-lg bg-red-400/10 p-3 text-sm text-red-300">This link is incomplete. Ask an AI254 administrator for a new set-up link.</p>}
      </div>
    </main>
  );
}
