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
      {/* page hero */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1a1a2e] to-[#2d1b69] rounded-2xl mb-6 px-6 py-5">
        <div className="absolute -top-8 -left-8 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">לקוחות</h1>
            <p className="text-sm text-white/50 mt-0.5">{allClients.length} לקוחות פעילים</p>
          </div>
          <Link
            href="/admin/clients/new"
            className="inline-flex items-center gap-1 bg-white text-[#1a1a2e] font-bold text-sm px-4 py-2 rounded-lg hover:bg-white/90 transition shadow-sm"
          >
            + לקוח חדש
          </Link>
        </div>
      </div>

      <ClientsTable clients={allClients} />
    </div>
  );
}
