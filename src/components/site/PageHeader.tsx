export function PageHeader({ eyebrow, title, intro, children, visual }: { eyebrow: string; title: string; intro?: string; children?: React.ReactNode; visual?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(4,160,225,0.16)_0%,transparent_55%)]" aria-hidden />
      <div className={`container-x py-16 sm:py-20 ${visual ? "grid items-center gap-12 lg:grid-cols-[1.25fr_1fr]" : ""}`}>
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">{title}</h1>
          {intro && <p className="lead mt-5 max-w-2xl">{intro}</p>}
          {children}
        </div>
        {visual}
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="max-w-2xl">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="h-section mt-3">{title}</h2>
      {children && <div className="lead mt-4">{children}</div>}
    </div>
  );
}
