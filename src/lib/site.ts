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
