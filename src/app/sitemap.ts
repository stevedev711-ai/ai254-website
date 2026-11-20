import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: [string, number][] = [
    ["/", 1],
    ["/who-we-are", 0.8],
    ["/what-we-do", 0.8],
    ["/our-technology", 0.9],
    ["/request-a-demo", 0.9],
    ["/contact", 0.7],
    ["/pilot-results", 0.8],
    ["/glossary", 0.7],
    ["/live", 0.6],
    ["/privacy", 0.3],
    ["/terms", 0.3],
  ];
  return pages.map(([path, priority]) => ({ url: `${site.url}${path}`, lastModified: new Date(), changeFrequency: "monthly", priority }));
}
