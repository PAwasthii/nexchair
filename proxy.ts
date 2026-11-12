import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Must stay in sync with COOKIE_NAME in lib/auth/admin.ts
const SESSION_COOKIE = "nexchair_admin_session";

async function isAuthenticated(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;

  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authenticated = await isAuthenticated(req);

  if (pathname === "/admin/login") {
    // Redirect already-authenticated users away from the login page
    if (authenticated) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  // All other /admin/* paths require a valid session
  if (!authenticated) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
