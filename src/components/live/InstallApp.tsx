"use client";

import { useEffect, useState } from "react";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

/**
 * "Install the AI254 LIVE app" prompt.
 * - Chrome / Edge / Android: uses the browser's install prompt.
 * - iPhone / iPad (Safari): shows the Share → Add to Home Screen steps.
 * - Hidden when already running as an installed app, or after the user dismisses it.
 */
export function InstallApp({ compact = false }: { compact?: boolean }) {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [showIosSteps, setShowIosSteps] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
    let dismissed = false;
    try {
      dismissed = localStorage.getItem("ai254.install.dismissed") === "1";
    } catch {}
    if (standalone || dismissed) return;

    const ua = navigator.userAgent;
    const isIos = /iphone|ipad|ipod/i.test(ua) || (ua.includes("Macintosh") && "ontouchend" in document);
    setIos(isIos);
    if (isIos) setHidden(false);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      setHidden(false);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function dismiss() {
    try {
      localStorage.setItem("ai254.install.dismissed", "1");
    } catch {}
    setHidden(true);
  }

  async function install() {
    if (ios) return setShowIosSteps((v) => !v);
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setDeferred(null);
  }

  if (installed) return <p role="status" className="mx-auto max-w-xl rounded-xl bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">AI254 LIVE is installed. Open it from your home screen or app list.</p>;
  if (hidden) return null;

  return (
    <div className={`mx-auto flex max-w-xl flex-col gap-3 rounded-2xl border border-navy-400/30 bg-surface p-4 text-left shadow-sm ${compact ? "" : "sm:p-5"}`}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-192.png" alt="" className="h-12 w-12 shrink-0 rounded-xl ring-1 ring-slate-200" />
        <div className="min-w-0 flex-1 basis-40">
          <p className="font-semibold">Install the AI254 LIVE app</p>
          <p className="text-sm text-slate-600">Open lectures straight from your home screen, full-screen.</p>
        </div>
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <button onClick={install} className="btn-primary btn-sm flex-1 sm:flex-none">{ios ? "How to install" : "Install app"}</button>
          <button onClick={dismiss} className="px-2 text-xs text-slate-500 hover:text-slate-700" aria-label="Dismiss install suggestion">Not now</button>
        </div>
      </div>
      {ios && showIosSteps && (
        <ol className="list-decimal space-y-1 rounded-xl bg-slate-50 py-3 pl-9 pr-4 text-sm text-slate-700">
          <li>Open this page in <strong>Safari</strong>.</li>
          <li>Tap the <strong>Share</strong> button <span aria-hidden>(⬆︎)</span> at the bottom of the screen.</li>
          <li>Choose <strong>Add to Home Screen</strong>, then tap <strong>Add</strong>.</li>
        </ol>
      )}
    </div>
  );
}
