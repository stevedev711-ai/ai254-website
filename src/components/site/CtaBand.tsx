import Link from "next/link";

export function CtaBand({ title, body, primary = { href: "/request-a-demo", label: "Request a Demo" }, secondary }: {
  title: string;
  body: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <section className="section">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-3xl bg-brand-gradient px-6 py-14 text-center sm:px-12 sm:py-16">
          <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:18px_18px]" aria-hidden />
          <h2 className="relative mx-auto max-w-2xl text-3xl font-bold text-white sm:text-4xl">{title}</h2>
          <p className="relative mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-white/90">{body}</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link href={primary.href} className="btn bg-white text-navy-600 hover:bg-navy-50">{primary.label}</Link>
            {secondary && <Link href={secondary.href} className="btn border border-white/50 text-white hover:bg-white/10">{secondary.label}</Link>}
          </div>
        </div>
      </div>
    </section>
  );
}
