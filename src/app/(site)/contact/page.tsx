import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/ContactForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact AI254 by email at info@ai254.net or by phone on +254 705 771 360.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <section className="relative">
      <div className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(ellipse_at_top_right,rgba(4,160,225,0.16)_0%,transparent_55%)]" aria-hidden />
      <div className="container-x grid gap-12 py-16 sm:py-20 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="eyebrow">Contact Us</p>
          <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">Get in touch</h1>
          <p className="lead mt-5">Questions about AI254, our classroom work or the technology? Send us a message, or reach us directly.</p>
          <ul className="mt-10 space-y-4">
            <ContactItem label="Email" value={site.email} href={`mailto:${site.email}`} icon="M3 6h18v12H3zM3 6l9 7 9-7" />
            <ContactItem label="Phone" value={site.phone} href={site.phoneHref} icon="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
            <ContactItem label="Country" value={site.country} icon="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
          </ul>
          <p className="mt-8 text-sm text-slate-500">
            For a demonstration of AI254 LIVE, use the <a href="/request-a-demo" className="font-medium text-cyan-300 underline">demo request form</a> so we have the details we need.
          </p>
        </div>
        <div className="card p-6 shadow-sm sm:p-10">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}

function ContactItem({ label, value, href, icon }: { label: string; value: string; href?: string; icon: string }) {
  const inner = (
    <>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-400/15 text-cyan-300">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden><path d={icon} /></svg>
      </span>
      <span>
        <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
        <span className="block text-lg font-semibold text-brand-ink">{value}</span>
      </span>
    </>
  );
  return (
    <li>
      {href ? <a href={href} className="flex items-center gap-4 rounded-xl p-2 -m-2 hover:bg-slate-50">{inner}</a> : <div className="flex items-center gap-4">{inner}</div>}
    </li>
  );
}
