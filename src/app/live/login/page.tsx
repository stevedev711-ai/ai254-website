import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/live/LoginForm";

export const metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ role?: string; next?: string; denied?: string }> }) {
  const { role, next, denied } = await searchParams;
  const isAdmin = role === "admin";
  const user = await getCurrentUser();
  const safeNext = next && next.startsWith("/live/") && !next.startsWith("//") ? next : undefined;
  if (user && !denied) redirect(safeNext ?? (user.role === "ADMIN" ? "/live/admin" : "/live/lecturer"));
  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <div className="card p-8 shadow-sm">
        <p className="eyebrow">{isAdmin ? "Administrator" : "Lecturer"}</p>
        <h1 className="mt-2 text-2xl font-bold">Sign in to AI254 LIVE</h1>
        {denied && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">Your account does not have access to that area.</p>}
        <LoginForm role={isAdmin ? "admin" : "lecturer"} next={safeNext} />
        <p className="mt-6 text-xs text-slate-500">
          Accounts are created by AI254 administrators. If you need access, contact <a href="mailto:info@ai254.net" className="underline">info@ai254.net</a>.
        </p>
      </div>
    </main>
  );
}
