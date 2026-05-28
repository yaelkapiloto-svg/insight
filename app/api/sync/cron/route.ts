import { NextRequest } from "next/server";
import { db, clients } from "@/lib/db";
import { eq } from "drizzle-orm";
import { syncClient } from "@/lib/sync/syncClient";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const allClients = await db
    .select()
    .from(clients)
    .where(eq(clients.isActive, true));

  const results = await Promise.allSettled(
    allClients.map((c) => syncClient(c.id))
  );

  const summary = results.map((r, i) => ({
    clientId: allClients[i].id,
    status: r.status,
    error: r.status === "rejected" ? String(r.reason) : undefined,
  }));

  return Response.json({ ok: true, summary });
}
