import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendAdminMagicLink(email: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/admin-verify?token=${token}`;

  await getResend().emails.send({
    from: process.env.EMAIL_FROM!,
    to: email,
    subject: "כניסה ל-KAPILOTO Admin",
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">כניסה למערכת KAPILOTO</h2>
        <p>לחץ על הכפתור הבא כדי להיכנס. הקישור תקף ל-15 דקות.</p>
        <a href="${url}" style="display:inline-block;background:#e94560;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">כניסה למערכת</a>
        <p style="color:#666;font-size:12px;margin-top:24px;">אם לא ביקשת קישור זה, התעלם מהודעה זו.</p>
      </div>
    `,
  });
}
