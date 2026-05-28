import { type NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { verifyAdminToken } from "@/lib/auth/magicLink";
import { getSession } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return redirect("/admin/login?error=missing");
  }

  const email = await verifyAdminToken(token);
  if (!email) {
    return redirect("/admin/login?error=invalid");
  }

  const session = await getSession();
  session.isAdmin = true;
  session.email = email;
  await session.save();

  return redirect("/admin");
}
