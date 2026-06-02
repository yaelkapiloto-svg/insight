import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth/magicLink";
import { setSession } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/admin/login?error=missing", request.url));
  }

  const email = await verifyAdminToken(token);
  if (!email) {
    return NextResponse.redirect(new URL("/admin/login?error=invalid", request.url));
  }

  await setSession({ isAdmin: true, email });

  return NextResponse.redirect(new URL("/admin", request.url));
}
