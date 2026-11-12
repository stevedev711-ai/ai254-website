import type { Metadata, Viewport } from "next";
import { Inter, Archivo } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { PwaRegister } from "@/components/PwaRegister";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", weight: ["600", "700", "800"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "AI254 — Real-time Kiswahili lecture support", template: "%s · AI254" },
  description: site.description,
  applicationName: "AI254",
  openGraph: { type: "website", siteName: "AI254", locale: "en_KE", title: "AI254 — Real-time Kiswahili lecture support", description: site.description },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/icon.svg", apple: "/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "AI254 LIVE", statusBarStyle: "default" },
};

export const viewport: Viewport = { themeColor: "#0C1834", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${archivo.variable}`}>
      <body className="min-h-screen font-sans">
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
