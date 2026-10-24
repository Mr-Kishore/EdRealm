import { NextResponse, type NextRequest } from "next/server";
import { decrypt, SESSION_COOKIE_NAME } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Static assets and internal paths
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Public endpoints:
  // - /feedback/[qr_token] (Public student feedback form)
  // - /api/trainers/[id]/qr (Public QR code image generation)
  if (
    pathname.startsWith("/feedback/") ||
    (pathname.startsWith("/api/trainers/") && pathname.endsWith("/qr"))
  ) {
    return NextResponse.next();
  }

  // 3. Read session token from cookie
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = sessionCookie ? await decrypt(sessionCookie) : null;
  const isAuthenticated = Boolean(session);

  // 4. Handle /login page
  if (pathname === "/login") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // 5. Protect all admin portal routes
  if (!isAuthenticated) {
    const callbackUrl = encodeURIComponent(`${pathname}${search}`);
    const loginUrl = new URL(`/login?callbackUrl=${callbackUrl}`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
