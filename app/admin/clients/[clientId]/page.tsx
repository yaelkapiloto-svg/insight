import { notFound } from "next/navigation";
import { db, clients, reportMonths } from "@/lib/db";
import { eq, and, desc } from "drizzle-orm";
import { ClientDetailClient } from "./ClientDetailClient";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;

  const [client] = await db
    .select()
    .from(clients)
    .where(eq(clients.id, clientId))
    .limit(1);

  if (!client) notFound();

  const months = await db
    .select()
    .from(reportMonths)
    .where(eq(reportMonths.clientId, clientId))
    .orderBy(desc(reportMonths.month));

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const portalUrl = `${appUrl}/report/${client.magicToken}`;

  return <ClientDetailClient client={client} months={months} portalUrl={portalUrl} />;
}
