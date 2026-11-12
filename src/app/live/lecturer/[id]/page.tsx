import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { headers } from "next/headers";
import { loadOwnedSession } from "@/lib/live/access";
import { LecturerConsole } from "@/components/live/LecturerConsole";
import { liveServicesConfigured } from "@/lib/live/services";
import { site } from "@/lib/site";

export const metadata = { title: "Lecture console", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ConsolePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { session } = await loadOwnedSession(id);
  if (!session) notFound();
  const h = await headers();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ? site.url : `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
  const joinUrl = `${origin}/live/student?code=${session.code}`;
  const qr = await QRCode.toDataURL(joinUrl, { margin: 1, width: 360, color: { dark: "#111111", light: "#FFFFFF" } });
  return (
    <LecturerConsole
      initial={JSON.parse(JSON.stringify(session))}
      joinUrl={joinUrl}
      qr={qr}
      liveAvailable={liveServicesConfigured()}
    />
  );
}
