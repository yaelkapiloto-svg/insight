import { NextRequest } from "next/server";
import { db, clients } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { generateClientToken } from "@/lib/auth/magicLink";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.isAdmin) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const newToken = generateClientToken();

  const [updated] = await db
    .update(clients)
    .set({ magicToken: newToken, updatedAt: new Date() })
    .where(eq(clients.id, id))
    .returning();

  if (!updated) return Response.json({ error: "לא נמצא" }, { status: 404 });

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/report/${newToken}`;
  return Response.json({ url });
}
