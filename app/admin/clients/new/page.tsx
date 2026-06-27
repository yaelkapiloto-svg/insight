"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function NewClientPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    logoUrl: "",
    sheetId: "",
    driveFolderId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "שגיאה ביצירת לקוח");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "שגיאה לא ידועה");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1a1a2e] to-[#2d1b69] rounded-2xl mb-6 px-6 py-5">
        <div className="absolute -top-8 -left-8 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="relative">
          <h1 className="text-xl font-bold text-white">לקוח חדש</h1>
          <p className="text-sm text-white/50 mt-0.5">הוספת לקוח חדש למערכת</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl border border-[#e2e8f0]">
        <Field label="שם הלקוח *" required>
          <input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
            className="input"
            placeholder="שם הלקוח"
          />
        </Field>

        <Field label="קישור לוגו (URL)">
          <input
            value={form.logoUrl}
            onChange={(e) => update("logoUrl", e.target.value)}
            className="input"
            placeholder="https://..."
            dir="ltr"
          />
        </Field>

        <Field label="מזהה Google Sheet">
          <input
            value={form.sheetId}
            onChange={(e) => update("sheetId", e.target.value)}
            className="input"
            placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
            dir="ltr"
          />
          <p className="text-xs text-gray-400 mt-1">נמצא ב-URL של הגיליון: docs.google.com/spreadsheets/d/[כאן]/</p>
        </Field>

        <Field label="מזהה תיקיית Google Drive">
          <input
            value={form.driveFolderId}
            onChange={(e) => update("driveFolderId", e.target.value)}
            className="input"
            placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
            dir="ltr"
          />
          <p className="text-xs text-gray-400 mt-1">נמצא ב-URL של התיקייה: drive.google.com/drive/folders/[כאן]</p>
        </Field>

        {error && <p className="text-sm text-[#e94560]">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading}>
            {loading ? "יוצר..." : "צור לקוח"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            ביטול
          </Button>
        </div>
      </form>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s;
          font-family: inherit;
        }
        .input:focus {
          border-color: #e94560;
          box-shadow: 0 0 0 1px #e94560;
        }
      `}</style>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1a1a2e] mb-1">
        {label}
        {required && <span className="text-[#e94560]"> *</span>}
      </label>
      {children}
    </div>
  );
}
