import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth-token";

/**
 * Route protection for staff areas of AI254 LIVE.
 *   /live/lecturer/*, /api/lecturer/*  → LECTURER or ADMIN
 *   /live/admin/*,    /api/admin/*     → ADMIN
 * Route handlers and server actions re-check roles; this is the first gate.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsAdmin = pathname.startsWith("/live/admin") || pathname.startsWith("/api/admin");
  const needsStaff = needsAdmin || pathname.startsWith("/live/lecturer") || pathname.startsWith("/api/lecturer");
  if (!needsStaff) return NextResponse.next();

  const user = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  const allowed = user && (needsAdmin ? user.role === "ADMIN" : user.role === "LECTURER" || user.role === "ADMIN");
  if (allowed) return NextResponse.next();

  if (pathname.startsWith("/api/")) return NextResponse.json({ ok: false, error: "Not authorised" }, { status: user ? 403 : 401 });
  const url = req.nextUrl.clone();
  url.pathname = "/live/login";
  url.search = `?role=${needsAdmin ? "admin" : "lecturer"}&next=${encodeURIComponent(pathname + req.nextUrl.search)}${user ? "&denied=1" : ""}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/live/lecturer/:path*", "/live/admin/:path*", "/api/admin/:path*", "/api/lecturer/:path*"] };
