"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const CHUNK_MS = 5000;

/**
 * Captures the lecturer's microphone in short self-contained chunks and posts each one to
 * /api/live/sessions/:id/audio. Each chunk is recorded by a fresh MediaRecorder so it is a
 * complete, decodable file for the speech service.
 */
export function useAudioCapture(sessionId: string, enabled: boolean) {
  const [state, setState] = useState<"off" | "requesting" | "capturing" | "error">("off");
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const [stats, setStats] = useState({ sent: 0, failed: 0 });
  const stream = useRef<MediaStream | null>(null);
  const running = useRef(false);
  const raf = useRef<number>(0);

  const stopAll = useCallback(() => {
    running.current = false;
    cancelAnimationFrame(raf.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    setLevel(0);
  }, []);

  useEffect(() => {
    if (!enabled) {
      stopAll();
      setState("off");
      return;
    }
    let cancelled = false;
    (async () => {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        setState("error");
        setError("This browser cannot capture audio. Use a recent version of Chrome, Edge or Firefox.");
        return;
      }
      setState("requesting");
      try {
        const s = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
        if (cancelled) return s.getTracks().forEach((t) => t.stop());
        stream.current = s;
        running.current = true;
        setState("capturing");
        setError(null);

        // Input level meter
        const ctx = new AudioContext();
        const an = ctx.createAnalyser();
        an.fftSize = 512;
        ctx.createMediaStreamSource(s).connect(an);
        const buf = new Uint8Array(an.frequencyBinCount);
        const meter = () => {
          an.getByteTimeDomainData(buf);
          let peak = 0;
          for (const v of buf) peak = Math.max(peak, Math.abs(v - 128));
          setLevel(peak / 128);
          if (running.current) raf.current = requestAnimationFrame(meter);
          else ctx.close();
        };
        meter();

        const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"].find((m) => MediaRecorder.isTypeSupported(m)) ?? "";
        const loop = () => {
          if (!running.current || !stream.current) return;
          const rec = new MediaRecorder(stream.current, mime ? { mimeType: mime } : undefined);
          const parts: Blob[] = [];
          rec.ondataavailable = (e) => e.data.size && parts.push(e.data);
          rec.onstop = async () => {
            if (running.current) loop();
            const blob = new Blob(parts, { type: rec.mimeType || "audio/webm" });
            if (blob.size < 1200) return; // silence / empty
            try {
              const r = await fetch(`/api/live/sessions/${sessionId}/audio`, { method: "POST", headers: { "Content-Type": blob.type }, body: blob });
              setStats((st) => (r.ok ? { ...st, sent: st.sent + 1 } : { ...st, failed: st.failed + 1 }));
            } catch {
              setStats((st) => ({ ...st, failed: st.failed + 1 }));
            }
          };
          rec.start();
          setTimeout(() => rec.state !== "inactive" && rec.stop(), CHUNK_MS);
        };
        loop();
      } catch (e) {
        setState("error");
        setError((e as Error).name === "NotAllowedError" ? "Microphone permission was denied. Allow microphone access in your browser to capture the lecture." : "Could not access the microphone.");
      }
    })();
    return () => {
      cancelled = true;
      stopAll();
    };
  }, [enabled, sessionId, stopAll]);

  return { state, error, level, stats };
}
