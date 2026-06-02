import { NextRequest, NextResponse } from "next/server";
import { decodeSession, COOKIE_NAME } from "@/lib/auth/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const cookie = request.cookies.get(COOKIE_NAME)?.value;
    const session = cookie ? await decodeSession(cookie) : null;

    if (!session?.isAdmin) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
