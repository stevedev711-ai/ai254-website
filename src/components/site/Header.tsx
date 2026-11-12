"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "../Logo";
import { nav } from "@/lib/site";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className={`sticky top-0 z-50 border-b bg-white/90 backdrop-blur transition-shadow ${scrolled ? "border-slate-200 shadow-sm" : "border-transparent"}`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:rounded focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>
      <div className="container-x flex h-16 items-center justify-between gap-4 lg:h-[72px]">
        <Link href="/" aria-label="AI254 home" className="shrink-0">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1.5 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-[13px] font-semibold text-white shadow-sm shadow-navy-900/20 transition-all duration-150 hover:-translate-y-px hover:shadow-md focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 xl:px-3.5 xl:text-sm ${
                isActive(item.href) ? "bg-navy-700 ring-2 ring-cyan-400 ring-offset-2" : "bg-navy-500 hover:bg-navy-600"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/live" className="btn whitespace-nowrap bg-brand-gradient px-4 py-2.5 text-white shadow-md shadow-cyan-900/20 transition-all hover:-translate-y-px hover:shadow-lg hover:brightness-110">
            <span className="h-2 w-2 rounded-full bg-white animate-pulseDot" aria-hidden />
            Our Tech
          </Link>
          <button
            type="button"
            className="btn-ghost p-2.5 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-slate-200 bg-white lg:hidden">
          <ul className="container-x grid gap-2 py-4">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`block rounded-lg px-4 py-3 text-base font-semibold text-white shadow-sm shadow-navy-900/20 transition-colors ${
                    isActive(item.href) ? "bg-navy-700 ring-2 ring-cyan-400 ring-offset-2" : "bg-navy-500 active:bg-navy-600"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/live" className="block rounded-lg bg-brand-gradient px-4 py-3 text-base font-semibold text-white shadow-sm">
                AI254 LIVE →
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
