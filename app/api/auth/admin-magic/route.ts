import { NextRequest } from "next/server";
import { createAdminToken } from "@/lib/auth/magicLink";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (!password || typeof password !== "string") {
    return Response.json({ error: "נדרשת סיסמה" }, { status: 400 });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return Response.json({ error: "ADMIN_PASSWORD לא מוגדר בשרת" }, { status: 500 });
  }

  if (password !== adminPassword) {
    return Response.json({ error: "סיסמה לא נכונה" }, { status: 403 });
  }

  const adminEmail = process.env.ADMIN_EMAIL || "admin@kapiloto.com";
  const token = await createAdminToken(adminEmail);
  const loginUrl = `${request.nextUrl.origin}/api/auth/admin-verify?token=${token}`;

  return Response.json({ ok: true, loginUrl });
}
