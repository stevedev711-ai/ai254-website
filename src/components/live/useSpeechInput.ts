"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* Minimal typings for the Web Speech API (not in lib.dom for all TS versions). */
type SR = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

/**
 * Browser speech-to-text for student questions. Runs on the student's device
 * (Web Speech API); only the resulting text is sent to AI254.
 */
export function useSpeechInput(lang: string, onFinal: (text: string) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rec = useRef<SR | null>(null);
  const cb = useRef(onFinal);
  cb.current = onFinal;

  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
    setSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  const stop = useCallback(() => {
    rec.current?.stop();
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    setError(null);
    const r = new Ctor();
    r.lang = lang;
    r.continuous = true;
    r.interimResults = false;
    r.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) cb.current(e.results[i][0].transcript.trim());
    };
    r.onerror = (e) => {
      setError(e.error === "not-allowed" ? "Microphone permission was denied. Allow it in your browser settings, or type instead." : e.error === "language-not-supported" ? "This browser does not support voice input in the selected language. Please type." : "Voice input stopped. Try again or type your question.");
      setListening(false);
    };
    r.onend = () => setListening(false);
    rec.current = r;
    try {
      r.start();
      setListening(true);
    } catch {
      setError("Could not start the microphone.");
    }
  }, [lang]);

  useEffect(() => () => rec.current?.stop(), []);
  useEffect(() => stop, [lang, stop]);

  return { supported, listening, error, start, stop };
}
