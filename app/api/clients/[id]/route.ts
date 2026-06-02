import { NextRequest } from "next/server";
import { db, clients } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

async function requireAdmin() {
  const session = await getSession();
  if (!session?.isAdmin) return new Response("Unauthorized", { status: 401 });
  return null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin();
  if (err) return err;

  const { id } = await params;
  const [client] = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  if (!client) return Response.json({ error: "לא נמצא" }, { status: 404 });
  return Response.json(client);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin();
  if (err) return err;

  const { id } = await params;
  const body = await request.json();
  const { name, logoUrl, sheetId, driveFolderId, isActive } = body;

  const [updated] = await db
    .update(clients)
    .set({
      ...(name !== undefined && { name }),
      ...(logoUrl !== undefined && { logoUrl }),
      ...(sheetId !== undefined && { sheetId }),
      ...(driveFolderId !== undefined && { driveFolderId }),
      ...(isActive !== undefined && { isActive }),
      updatedAt: new Date(),
    })
    .where(eq(clients.id, id))
    .returning();

  if (!updated) return Response.json({ error: "לא נמצא" }, { status: 404 });
  return Response.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin();
  if (err) return err;

  const { id } = await params;
  await db.update(clients).set({ isActive: false }).where(eq(clients.id, id));
  return Response.json({ ok: true });
}
