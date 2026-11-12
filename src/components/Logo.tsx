/**
 * AI254 logo — vector redraw of the supplied brand mark (network node mark + wordmark).
 * Colours sampled from the original artwork: #264AA0 → #1674BC → #04A0E1, wordmark #111111.
 */
export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 140" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="ai254-g" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#264AA0" />
          <stop offset=".5" stopColor="#1674BC" />
          <stop offset="1" stopColor="#04A0E1" />
        </linearGradient>
      </defs>
      <g stroke="#1674BC" strokeWidth="2.5" opacity=".85">
        <line x1="66" y1="68" x2="22" y2="27" />
        <line x1="66" y1="68" x2="116" y2="18" />
        <line x1="66" y1="68" x2="18" y2="118" />
        <line x1="66" y1="68" x2="73" y2="127" />
        <line x1="66" y1="68" x2="114" y2="100" />
      </g>
      <circle cx="22" cy="27" r="11" fill="#264AA0" />
      <circle cx="116" cy="18" r="17" fill="#04A0E1" />
      <circle cx="66" cy="68" r="18" fill="url(#ai254-g)" />
      <circle cx="18" cy="118" r="17" fill="#264AA0" />
      <circle cx="73" cy="127" r="13" fill="#127AC3" />
      <circle cx="114" cy="100" r="11" fill="#04A0E1" />
    </svg>
  );
}

export function Logo({ className = "", inverted = false, suffix }: { className?: string; inverted?: boolean; suffix?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-8 w-8 shrink-0" />
      <span className={`font-display text-[1.6rem] font-extrabold leading-none tracking-tight ${inverted ? "text-white" : "text-brand-ink"}`}>
        AI254
        {suffix && <span className="ml-1.5 align-middle text-sm font-bold tracking-[0.2em] text-cyan-500">{suffix}</span>}
      </span>
    </span>
  );
}
