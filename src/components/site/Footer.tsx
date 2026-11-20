import Link from "next/link";
import { Logo } from "../Logo";
import { site } from "@/lib/site";
import { SocialLinks } from "./SocialLinks";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/who-we-are", label: "Who We Are" },
  { href: "/what-we-do", label: "What We Do" },
  { href: "/our-technology", label: "Our Technology" },
  { href: "/request-a-demo", label: "Request a Demo" },
  { href: "/pilot-results", label: "Pilot Results" },
  { href: "/glossary", label: "Science Glossary" },
  { href: "/live", label: "AI254 LIVE" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="container-x grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">{site.description}</p>
          <SocialLinks />
        </div>
        <nav aria-label="Footer" className="md:col-span-3">
          <h2 className="text-sm font-semibold text-brand-ink">Quick Links</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {quickLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-slate-600 hover:text-cyan-300">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="md:col-span-4">
          <h2 className="text-sm font-semibold text-brand-ink">Contact</h2>
          <dl className="mt-4 space-y-2.5 text-sm text-slate-600">
            <div className="flex gap-2">
              <dt className="w-16 shrink-0 text-slate-500">Email</dt>
              <dd><a href={`mailto:${site.email}`} className="hover:text-cyan-300">{site.email}</a></dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-16 shrink-0 text-slate-500">Phone</dt>
              <dd><a href={site.phoneHref} className="hover:text-cyan-300">{site.phone}</a></dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-16 shrink-0 text-slate-500">Location</dt>
              <dd>{site.country}</dd>
            </div>
          </dl>
        </div>
      </div>
      <div className="border-t border-slate-200">
        <div className="container-x flex flex-col gap-3 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 AI254. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-cyan-300">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-cyan-300">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
