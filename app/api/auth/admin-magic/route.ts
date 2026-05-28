import { NextRequest } from "next/server";
import { createAdminToken } from "@/lib/auth/magicLink";
import { sendAdminMagicLink } from "@/lib/email";

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email || typeof email !== "string") {
    return Response.json({ error: "נדרש כתובת אימייל" }, { status: 400 });
  }

  const allowedEmail = process.env.ADMIN_EMAIL;
  if (email.toLowerCase() !== allowedEmail?.toLowerCase()) {
    return Response.json({ error: "כתובת האימייל אינה מורשית" }, { status: 403 });
  }

  const token = await createAdminToken(email);
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/admin-verify?token=${token}`;

  // If Resend is configured — send by email. Otherwise return the URL directly.
  if (process.env.RESEND_API_KEY) {
    try {
      await sendAdminMagicLink(email, token);
      return Response.json({ ok: true });
    } catch (err) {
      console.error("Email send error:", err);
      // Fall through to showing the link on screen
    }
  }

  return Response.json({ ok: true, loginUrl });
}
