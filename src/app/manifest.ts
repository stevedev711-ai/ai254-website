import type { MetadataRoute } from "next";

/** Makes AI254 LIVE installable as an app (Android, iPhone, Windows, macOS, ChromeOS). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/live",
    name: "AI254 LIVE",
    short_name: "AI254 LIVE",
    description: "Real-time Kiswahili lecture support for university students and lecturers.",
    start_url: "/live?source=app",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#0C1834",
    theme_color: "#0C1834",
    categories: ["education"],
    lang: "en-KE",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Join a lecture", short_name: "Join", url: "/live/student", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Lecturer sign-in", short_name: "Lecturer", url: "/live/lecturer", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
