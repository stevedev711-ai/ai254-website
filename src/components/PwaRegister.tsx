"use client";

import { useEffect } from "react";

/** Registers the service worker that makes AI254 LIVE installable and shows an offline screen. */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
  }, []);
  return null;
}
