import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth/magicLink";
import { encodeSession, COOKIE_NAME } from "@/lib/auth/session";

const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/admin/login?error=missing", request.url));
  }

  const email = await verifyAdminToken(token);
  if (!email) {
    return NextResponse.redirect(new URL("/admin/login?error=invalid", request.url));
  }

  const sessionValue = await encodeSession({
    isAdmin: true,
    email,
    expiresAt: Date.now() + MAX_AGE_SECONDS * 1000,
  });

  const response = NextResponse.redirect(new URL("/admin", request.url));
  response.cookies.set(COOKIE_NAME, sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });

  return response;
}
