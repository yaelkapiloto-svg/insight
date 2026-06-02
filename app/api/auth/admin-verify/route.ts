import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { verifyAdminToken } from "@/lib/auth/magicLink";
import type { SessionData } from "@/lib/auth/session";

const sessionOptions = {
  cookieName: "kapiloto_admin_session",
  password: process.env.SESSION_SECRET!,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7,
  },
};

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/admin/login?error=missing", request.url));
  }

  const email = await verifyAdminToken(token);
  if (!email) {
    return NextResponse.redirect(new URL("/admin/login?error=invalid", request.url));
  }

  const response = NextResponse.redirect(new URL("/admin", request.url));
  const session = await getIronSession<SessionData>(request, response, sessionOptions);
  session.isAdmin = true;
  session.email = email;
  await session.save();

  return response;
}
