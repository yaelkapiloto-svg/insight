import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { syncClient } from "@/lib/sync/syncClient";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.isAdmin) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;

  try {
    await syncClient(id);
    return Response.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "שגיאת סנכרון";
    return Response.json({ error: message }, { status: 500 });
  }
}
