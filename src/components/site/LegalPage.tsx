export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="container-x max-w-3xl py-16 sm:py-20">
      <h1 className="text-4xl font-extrabold">{title}</h1>
      <p className="mt-3 text-sm text-slate-500">Last updated {updated}</p>
      <div className="mt-10 space-y-8 text-[16px] leading-relaxed text-slate-700 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_a]:font-medium [&_a]:text-navy-600 [&_a]:underline">
        {children}
      </div>
    </div>
  );
}
