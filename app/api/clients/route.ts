import { NextRequest } from "next/server";
import { db, clients } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { generateClientToken } from "@/lib/auth/magicLink";

async function requireAdmin() {
  const session = await getSession();
  if (!session?.isAdmin) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}

export async function GET() {
  const err = await requireAdmin();
  if (err) return err;

  const all = await db
    .select()
    .from(clients)
    .where(eq(clients.isActive, true))
    .orderBy(clients.createdAt);

  return Response.json(all);
}

export async function POST(request: NextRequest) {
  const err = await requireAdmin();
  if (err) return err;

  const body = await request.json();
  const { name, logoUrl, sheetId, driveFolderId } = body;

  if (!name) {
    return Response.json({ error: "שם לקוח נדרש" }, { status: 400 });
  }

  const magicToken = generateClientToken();

  const [client] = await db
    .insert(clients)
    .values({ name, logoUrl, sheetId: sheetId || "", driveFolderId: driveFolderId || "", magicToken })
    .returning();

  return Response.json(client, { status: 201 });
}
