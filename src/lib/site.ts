export const site = {
  name: "AI254",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  email: "info@ai254.net",
  phone: "+254 705 771 360",
  phoneHref: "tel:+254705771360",
  country: "Kenya",
  description:
    "AI254 develops real-time Kiswahili lecture support technology for university education, beginning with scientific and technical subjects.",
};

/**
 * Official AI254 social media accounts. An icon appears in the footer only when its
 * URL is filled in, so no link points to an account that does not exist.
 */
export const social: { network: "facebook" | "x" | "instagram" | "tiktok"; label: string; url: string }[] = [
  { network: "facebook", label: "Facebook", url: "https://www.facebook.com/share/1LavsAoK6Y/" },
  { network: "x", label: "X", url: "" },
  { network: "instagram", label: "Instagram", url: "" },
  { network: "tiktok", label: "TikTok", url: "" },
];

export const nav = [
  { href: "/", label: "Home" },
  { href: "/who-we-are", label: "Who We Are" },
  { href: "/what-we-do", label: "What We Do" },
  { href: "/our-technology", label: "Our Technology" },
  { href: "/request-a-demo", label: "Request a Demo" },
  { href: "/contact", label: "Contact Us" },
];

/** Verified pilot figures. Keep in sync with project records. */
export const pilotFacts = {
  institution: "Maasai Mara University",
  subject: "Biology 101",
  pilots: 2,
  participations: 108,
  pilot1: 68,
  pilot2: 40,
  lectureSessions: 9,
};
