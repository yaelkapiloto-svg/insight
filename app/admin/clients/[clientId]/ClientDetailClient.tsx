"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Client, ReportMonth } from "@/lib/db/schema";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { Card } from "@/components/ui/Card";

const HEBREW_MONTHS: Record<string, string> = {
  "01": "ינואר", "02": "פברואר", "03": "מרץ", "04": "אפריל",
  "05": "מאי", "06": "יוני", "07": "יולי", "08": "אוגוסט",
  "09": "ספטמבר", "10": "אוקטובר", "11": "נובמבר", "12": "דצמבר",
};

function formatMonth(month: string) {
  const [year, mm] = month.split("-");
  return `${HEBREW_MONTHS[mm] ?? mm} ${year}`;
}

function getCurrentMonth(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

interface Props {
  client: Client;
  months: ReportMonth[];
  portalUrl: string;
}

export function ClientDetailClient({ client, months, portalUrl }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    if (months.length > 0) return months[0].month;
    return getCurrentMonth();
  });

  const currentReport = months.find((m) => m.month === selectedMonth);

  const [analysisHtml, setAnalysisHtml] = useState(currentReport?.analysisHtml ?? "");
  const [summaryHtml, setSummaryHtml] = useState(currentReport?.summaryHtml ?? "");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");

  async function copyPortalUrl() {
    await navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function saveDraft() {
    setSaving(true);
    setSaveStatus("idle");
    try {
      await fetch(`/api/clients/${client.id}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: selectedMonth, analysisHtml, summaryHtml }),
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  }

  async function publish() {
    setPublishing(true);
    try {
      await fetch(`/api/clients/${client.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: selectedMonth, analysisHtml, summaryHtml }),
      });
      router.refresh();
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">{client.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">פורטל לקוח</p>
        </div>
        <Button variant="secondary" onClick={copyPortalUrl}>
          {copied ? "✓ הועתק" : "העתק קישור לקוח"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Month selector */}
          <Card>
            <h2 className="font-semibold text-[#1a1a2e] mb-3">בחר חודש לעריכה</h2>
            <div className="flex flex-wrap gap-2">
              {months.map((m) => (
                <button
                  key={m.month}
                  onClick={() => {
                    setSelectedMonth(m.month);
                    setAnalysisHtml(m.analysisHtml ?? "");
                    setSummaryHtml(m.summaryHtml ?? "");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                    selectedMonth === m.month
                      ? "bg-[#1a1a2e] text-white border-[#1a1a2e]"
                      : "bg-white text-[#1a1a2e] border-[#e2e8f0] hover:border-[#1a1a2e]"
                  }`}
                >
                  {formatMonth(m.month)}
                  {m.status === "published" && (
                    <span className="mr-1.5 inline-block w-1.5 h-1.5 bg-green-500 rounded-full" />
                  )}
                </button>
              ))}
              <button
                onClick={() => {
                  setSelectedMonth(getCurrentMonth());
                  setAnalysisHtml("");
                  setSummaryHtml("");
                }}
                className="px-3 py-1.5 rounded-lg text-sm border border-dashed border-gray-300 text-gray-500 hover:border-[#1a1a2e] hover:text-[#1a1a2e] transition"
              >
                + חודש חדש
              </button>
            </div>
          </Card>

          {/* Analysis editor */}
          <Card>
            <h2 className="font-semibold text-[#1a1a2e] mb-1">ניתוח המספרים</h2>
            <p className="text-xs text-gray-400 mb-3">
              {formatMonth(selectedMonth)} — הטקסט שיופיע בדוח הלקוח
            </p>
            <RichTextEditor
              value={analysisHtml}
              onChange={setAnalysisHtml}
              placeholder="כתבי כאן את הניתוח המילולי של המספרים..."
            />
          </Card>

          {/* Summary editor */}
          <Card>
            <h2 className="font-semibold text-[#1a1a2e] mb-1">סיכום ומסקנות</h2>
            <p className="text-xs text-gray-400 mb-3">תובנות ולקחים לסוף הדוח</p>
            <RichTextEditor
              value={summaryHtml}
              onChange={setSummaryHtml}
              placeholder="כתבי כאן את הסיכום והמסקנות..."
            />
          </Card>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button onClick={saveDraft} disabled={saving} variant="secondary">
              {saving ? "שומר..." : "שמור טיוטה"}
            </Button>
            <Button onClick={publish} disabled={publishing} variant="primary">
              {publishing ? "מפרסם..." : `פרסם דוח ${formatMonth(selectedMonth)}`}
            </Button>
            {saveStatus === "saved" && <span className="text-sm text-green-600">נשמר ✓</span>}
            {saveStatus === "error" && <span className="text-sm text-[#e94560]">שגיאה בשמירה</span>}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <h3 className="font-semibold text-[#1a1a2e] mb-3">פרטי לקוח</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-400 text-xs">שם</dt>
                <dd className="font-medium">{client.name}</dd>
              </div>
              {client.sheetId && (
                <div>
                  <dt className="text-gray-400 text-xs">Google Sheet</dt>
                  <dd className="font-mono text-xs truncate" dir="ltr">{client.sheetId}</dd>
                </div>
              )}
              {client.driveFolderId && (
                <div>
                  <dt className="text-gray-400 text-xs">תיקיית Drive</dt>
                  <dd className="font-mono text-xs truncate" dir="ltr">{client.driveFolderId}</dd>
                </div>
              )}
            </dl>
          </Card>

          <Card>
            <h3 className="font-semibold text-[#1a1a2e] mb-3">סטטוס דוחות</h3>
            <div className="space-y-2">
              {months.slice(0, 6).map((m) => (
                <div key={m.month} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{formatMonth(m.month)}</span>
                  <Badge variant={m.status === "published" ? "published" : "draft"}>
                    {m.status === "published" ? "פורסם" : "טיוטה"}
                  </Badge>
                </div>
              ))}
              {months.length === 0 && (
                <p className="text-sm text-gray-400">אין דוחות עדיין</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
