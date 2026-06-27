"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Client, ReportMonth } from "@/lib/db/schema";
import type { MonthlyMetricData, MetricSet, ChangeData } from "@/types/report";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { Card } from "@/components/ui/Card";
import { DataPreview } from "@/components/admin/DataPreview";
import { DatesEditor } from "@/components/admin/DatesEditor";

const HEBREW_MONTHS: Record<string, string> = {
  "01": "ינואר", "02": "פברואר", "03": "מרץ", "04": "אפריל",
  "05": "מאי", "06": "יוני", "07": "יולי", "08": "אוגוסט",
  "09": "ספטמבר", "10": "אוקטובר", "11": "נובמבר", "12": "דצמבר",
};

function formatMonth(month: string) {
  const [year, mm] = month.split("-");
  return `${HEBREW_MONTHS[mm] ?? mm} ${year}`;
}

interface DataPayload {
  availableMonths: string[];
  month: string | null;
  current: MonthlyMetricData | null;
  previous: MonthlyMetricData | null;
  changes: ChangeData;
  annualAverage: MetricSet;
  threeMonthAverage: MetricSet;
  rawData: Record<string, string> | null;
}

interface Props {
  client: Client;
  months: ReportMonth[];
  portalUrl: string;
}

export function ClientDetailClient({ client, months, portalUrl }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [dataPayload, setDataPayload] = useState<DataPayload | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  const currentReport = months.find((m) => m.month === selectedMonth);

  const [analysisHtml, setAnalysisHtml] = useState(currentReport?.analysisHtml ?? "");
  const [summaryHtml, setSummaryHtml] = useState(currentReport?.summaryHtml ?? "");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoadingData(true);
      try {
        const url = selectedMonth
          ? `/api/clients/${client.id}/data?month=${selectedMonth}`
          : `/api/clients/${client.id}/data`;
        const res = await fetch(url);
        if (res.ok) {
          const data: DataPayload = await res.json();
          setDataPayload(data);
          if (!selectedMonth && data.month) {
            setSelectedMonth(data.month);
            const monthReport = months.find((m) => m.month === data.month);
            setAnalysisHtml(monthReport?.analysisHtml ?? "");
            setSummaryHtml(monthReport?.summaryHtml ?? "");
          }
        }
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, [selectedMonth, client.id, months]);

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

  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  async function sync() {
    setSyncing(true);
    setSyncStatus(null);
    try {
      const res = await fetch(`/api/clients/${client.id}/sync`, {
        method: "POST",
      });
      if (res.ok) {
        setSyncStatus("הסנכרון הצליח! 🎉");
        // Reload data
        const dataRes = await fetch(`/api/clients/${client.id}/data?month=${selectedMonth}`);
        if (dataRes.ok) setDataPayload(await dataRes.json());
        router.refresh();
      } else {
        const data = await res.json();
        setSyncStatus(`שגיאה: ${data.error || "סנכרון נכשל"}`);
      }
    } catch (err) {
      setSyncStatus(`שגיאת רשת: ${err instanceof Error ? err.message : "לא ידוע"}`);
    } finally {
      setSyncing(false);
    }
  }

  async function generateAI() {
    if (!selectedMonth) return;
    setGeneratingAI(true);
    setAiError(null);
    try {
      const res = await fetch(`/api/clients/${client.id}/ai-analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: selectedMonth }),
      });
      const data = await res.json();
      if (res.ok) {
        setAnalysisHtml(data.html);
      } else {
        setAiError(data.error || "שגיאה ביצירת ניתוח");
      }
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "שגיאת רשת");
    } finally {
      setGeneratingAI(false);
    }
  }

  // Client settings editing
  const [editingSettings, setEditingSettings] = useState(false);
  const [editName, setEditName] = useState(client.name);
  const [editSheetId, setEditSheetId] = useState(client.sheetId);
  const [editDriveFolderId, setEditDriveFolderId] = useState(client.driveFolderId);
  const [editLogoUrl, setEditLogoUrl] = useState(client.logoUrl ?? "");
  const [savingSettings, setSavingSettings] = useState(false);

  async function saveSettings() {
    setSavingSettings(true);
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          sheetId: editSheetId,
          driveFolderId: editDriveFolderId,
          logoUrl: editLogoUrl || null,
        }),
      });
      if (res.ok) {
        setEditingSettings(false);
        router.refresh();
      }
    } finally {
      setSavingSettings(false);
    }
  }

  const availableMonths = dataPayload?.availableMonths ?? [];

  return (
    <div>
      {/* gradient hero strip */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1a1a2e] to-[#2d1b69] rounded-2xl mb-6 px-6 py-5">
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#e94560]/15 rounded-full blur-2xl pointer-events-none" />
        <div className="relative">
          <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-white/80 transition mb-2">
            <span>←</span>
            <span>כל הלקוחות</span>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{client.name}</h1>
              <p className="text-sm text-white/50 mt-0.5">פורטל לקוח</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={sync} disabled={syncing} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                {syncing ? "מסנכרן..." : "↻ סנכרן נתונים"}
              </Button>
              <Button variant="secondary" onClick={copyPortalUrl} className="bg-white text-[#1a1a2e] hover:bg-white/90 font-semibold">
                {copied ? "✓ הועתק" : "העתק קישור לקוח"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {syncStatus && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          syncStatus.includes("שגיאה") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
        }`}>
          {syncStatus}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Month selector */}
          <Card>
            <h2 className="font-semibold text-[#1a1a2e] mb-3">בחר חודש</h2>
            <div className="flex flex-wrap gap-2">
              {availableMonths.map((m) => {
                const report = months.find((r) => r.month === m);
                return (
                  <button
                    key={m}
                    onClick={() => {
                      setSelectedMonth(m);
                      const monthReport = months.find((r) => r.month === m);
                      setAnalysisHtml(monthReport?.analysisHtml ?? "");
                      setSummaryHtml(monthReport?.summaryHtml ?? "");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition font-medium ${
                      selectedMonth === m
                        ? "bg-gradient-to-r from-[#1a1a2e] to-[#2d1b69] text-white border-transparent shadow-md"
                        : "bg-white text-[#1a1a2e] border-[#e2e8f0] hover:border-[#1a1a2e] hover:shadow-sm"
                    }`}
                  >
                    {formatMonth(m)}
                    {report?.status === "published" && (
                      <span className="mr-1.5 inline-block w-1.5 h-1.5 bg-green-500 rounded-full" />
                    )}
                  </button>
                );
              })}
              {availableMonths.length === 0 && !loadingData && (
                <p className="text-sm text-gray-400">לא נמצאו חודשים מסונכרנים. לחץ "סנכרן נתונים".</p>
              )}
            </div>
          </Card>

          {/* Data preview */}
          {selectedMonth && dataPayload?.current && (
            <DataPreview
              current={dataPayload.current}
              previous={dataPayload.previous}
              changes={dataPayload.changes}
              annualAverage={dataPayload.annualAverage}
              threeMonthAverage={dataPayload.threeMonthAverage}
              rawData={dataPayload.rawData}
            />
          )}

          {/* Filming days + meetings dates */}
          {selectedMonth && (
            <DatesEditor clientId={client.id} month={selectedMonth} />
          )}

          {/* Analysis editor with AI button */}
          {selectedMonth && (
            <Card>
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-semibold text-[#1a1a2e]">ניתוח המספרים</h2>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={generateAI}
                  disabled={generatingAI || !dataPayload?.current}
                >
                  {generatingAI ? "מנתח..." : "🤖 ניתוח אוטומטי"}
                </Button>
              </div>
              <p className="text-xs text-gray-400 mb-3">
                {formatMonth(selectedMonth)} — את יכולה לערוך את הטקסט אחרי שה-AI יצור אותו
              </p>
              {aiError && (
                <div className="mb-3 p-2 rounded-lg bg-red-50 text-red-700 text-xs">
                  {aiError}
                </div>
              )}
              <RichTextEditor
                key={`analysis-${selectedMonth}`}
                value={analysisHtml}
                onChange={setAnalysisHtml}
                placeholder="כתבי כאן את הניתוח המילולי או לחצי על 'ניתוח אוטומטי'..."
              />
            </Card>
          )}

          {/* Summary editor */}
          {selectedMonth && (
            <Card>
              <h2 className="font-semibold text-[#1a1a2e] mb-1">סיכום ומסקנות</h2>
              <p className="text-xs text-gray-400 mb-3">תובנות ולקחים לסוף הדוח</p>
              <RichTextEditor
                key={`summary-${selectedMonth}`}
                value={summaryHtml}
                onChange={setSummaryHtml}
                placeholder="כתבי כאן את הסיכום והמסקנות..."
              />
            </Card>
          )}

          {/* Actions */}
          {selectedMonth && (
            <div className="flex items-center gap-3">
              <Button onClick={saveDraft} disabled={saving} variant="secondary">
                {saving ? "שומר..." : "שמור טיוטה"}
              </Button>
              <button
                onClick={publish}
                disabled={publishing}
                className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-[#e94560] to-[#7c3aed] hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {publishing ? "מפרסם..." : `פרסם דוח ${formatMonth(selectedMonth)}`}
              </button>
              {saveStatus === "saved" && <span className="text-sm text-green-600">נשמר ✓</span>}
              {saveStatus === "error" && <span className="text-sm text-[#e94560]">שגיאה בשמירה</span>}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[#1a1a2e]">פרטי לקוח</h3>
              {!editingSettings && (
                <button
                  onClick={() => setEditingSettings(true)}
                  className="text-xs text-[#e94560] hover:underline"
                >
                  עריכה
                </button>
              )}
            </div>
            {editingSettings ? (
              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-gray-400 text-xs block mb-1">שם</label>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full border border-[#e2e8f0] rounded-lg px-2 py-1.5 text-sm outline-none focus:border-[#e94560]"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-xs block mb-1">Google Sheet ID</label>
                  <input
                    value={editSheetId}
                    onChange={(e) => setEditSheetId(e.target.value)}
                    className="w-full border border-[#e2e8f0] rounded-lg px-2 py-1.5 text-xs font-mono outline-none focus:border-[#e94560]"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-xs block mb-1">Drive Folder ID</label>
                  <input
                    value={editDriveFolderId}
                    onChange={(e) => setEditDriveFolderId(e.target.value)}
                    className="w-full border border-[#e2e8f0] rounded-lg px-2 py-1.5 text-xs font-mono outline-none focus:border-[#e94560]"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-xs block mb-1">קישור לוגו (URL)</label>
                  <input
                    value={editLogoUrl}
                    onChange={(e) => setEditLogoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full border border-[#e2e8f0] rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#e94560]"
                    dir="ltr"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button onClick={saveSettings} disabled={savingSettings} size="sm">
                    {savingSettings ? "שומר..." : "שמור"}
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingSettings(false);
                      setEditName(client.name);
                      setEditSheetId(client.sheetId);
                      setEditDriveFolderId(client.driveFolderId);
                      setEditLogoUrl(client.logoUrl ?? "");
                    }}
                    variant="ghost"
                    size="sm"
                  >
                    ביטול
                  </Button>
                </div>
              </div>
            ) : (
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
            )}
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
