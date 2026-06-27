"use client";

import { useState } from "react";
import Link from "next/link";
import type { Client } from "@/lib/db/schema";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface ClientsTableProps {
  clients: Client[];
}

export function ClientsTable({ clients }: ClientsTableProps) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copyLink(clientId: string) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;
    const url = `${appUrl}/report/${client.magicToken}`;
    await navigator.clipboard.writeText(url);
    setCopied(clientId);
    setTimeout(() => setCopied(null), 2000);
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-[#e2e8f0]">
        <p className="text-lg">אין לקוחות עדיין</p>
        <p className="text-sm mt-1">לחץ "לקוח חדש" כדי להתחיל</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#e2e8f0] shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gradient-to-r from-[#1a1a2e] to-[#2d1b69] text-white">
            <th className="px-5 py-3.5 text-right font-semibold text-xs tracking-wider">לקוח</th>
            <th className="px-5 py-3.5 text-right font-semibold text-xs tracking-wider">סטטוס</th>
            <th className="px-5 py-3.5 text-right font-semibold text-xs tracking-wider">תאריך הוספה</th>
            <th className="px-5 py-3.5 text-right font-semibold text-xs tracking-wider">פעולות</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f0f0f8] bg-white">
          {clients.map((client) => (
            <tr key={client.id} className="hover:bg-[#fafaff] transition-colors">
              <td className="px-5 py-3.5 font-semibold text-[#1a1a2e]">{client.name}</td>
              <td className="px-5 py-3.5">
                <Badge variant={client.isActive ? "published" : "draft"}>
                  {client.isActive ? "פעיל" : "לא פעיל"}
                </Badge>
              </td>
              <td className="px-5 py-3.5 text-gray-400 text-xs" dir="ltr">
                {client.createdAt ? new Date(client.createdAt).toLocaleDateString("he-IL") : "—"}
              </td>
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => copyLink(client.id)}>
                    {copied === client.id ? "✓ הועתק" : "העתק קישור"}
                  </Button>
                  <Link href={`/admin/clients/${client.id}`}>
                    <Button variant="ghost" size="sm">עריכה ←</Button>
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
