import { social } from "@/lib/site";

const icons: Record<string, React.ReactNode> = {
  facebook: (
    <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
  ),
  x: <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />,
  instagram: (
    <g fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </g>
  ),
  tiktok: (
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  ),
};

/** Footer social icons. Only accounts with a URL in `social` (src/lib/site.ts) are shown. */
export function SocialLinks() {
  const accounts = social.filter((s) => s.url);
  if (!accounts.length) return null;
  return (
    <div className="mt-6">
      <p className="text-sm font-semibold text-brand-ink">Follow AI254</p>
      <ul className="mt-3 flex gap-3">
        {accounts.map((s) => (
          <li key={s.network}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`AI254 on ${s.label} (opens in a new tab)`}
              title={s.label}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-500 text-white shadow-sm shadow-black/30 transition-all duration-150 hover:-translate-y-0.5 hover:bg-brand-gradient hover:shadow-md focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-page"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                {icons[s.network]}
              </svg>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
