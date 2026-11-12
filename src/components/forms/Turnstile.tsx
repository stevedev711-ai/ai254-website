"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: { render: (el: HTMLElement, opts: Record<string, unknown>) => string; reset: (id?: string) => void };
  }
}

/** Renders Cloudflare Turnstile only when NEXT_PUBLIC_TURNSTILE_SITE_KEY is configured. */
export function Turnstile({ onToken }: { onToken: (t: string) => void }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const ref = useRef<HTMLDivElement>(null);
  const rendered = useRef(false);

  const render = () => {
    if (!siteKey || !ref.current || !window.turnstile || rendered.current) return;
    rendered.current = true;
    window.turnstile.render(ref.current, { sitekey: siteKey, callback: onToken, "expired-callback": () => onToken("") });
  };

  useEffect(render);
  if (!siteKey) return null;
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onLoad={render} />
      <div ref={ref} className="min-h-[65px]" />
    </>
  );
}
