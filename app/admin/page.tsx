import Link from "next/link";
import { db, clients } from "@/lib/db";
import { eq } from "drizzle-orm";
import { ClientsTable } from "@/components/admin/ClientsTable";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const allClients = await db
    .select()
    .from(clients)
    .where(eq(clients.isActive, true))
    .orderBy(clients.createdAt);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">לקוחות</h1>
          <p className="text-sm text-gray-500 mt-0.5">{allClients.length} לקוחות פעילים</p>
        </div>
        <Link href="/admin/clients/new">
          <Button variant="primary">+ לקוח חדש</Button>
        </Link>
      </div>

      <ClientsTable clients={allClients} />
    </div>
  );
}
