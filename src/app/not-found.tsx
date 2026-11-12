import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Logo />
      <h1 className="mt-10 text-3xl font-bold">Page not found</h1>
      <p className="mt-3 text-slate-600">The page you are looking for does not exist or has moved.</p>
      <Link href="/" className="btn-primary mt-8">Go to the homepage</Link>
    </main>
  );
}
