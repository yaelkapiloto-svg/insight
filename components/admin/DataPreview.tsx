"use client";

import { Card } from "@/components/ui/Card";
import type { MonthlyMetricData, MetricSet, ChangeData } from "@/types/report";

interface DataPreviewProps {
  current: MonthlyMetricData | null;
  previous: MonthlyMetricData | null;
  changes: ChangeData;
  annualAverage: MetricSet;
  threeMonthAverage: MetricSet;
  rawData: Record<string, string> | null;
}

function fmt(n: number | null): string {
  if (n === null || n === undefined) return "—";
  return n.toLocaleString("en-US");
}

function Num({ n, bold }: { n: number | null; bold?: boolean }) {
  return (
    <span dir="ltr" className={`inline-block ${bold ? "font-bold" : ""}`}>
      {fmt(n)}
    </span>
  );
}

function ChangeArrow({ change }: { change: ChangeData[keyof ChangeData] }) {
  if (!change) return null;
  const arrow = change.direction === "up" ? "↑" : change.direction === "down" ? "↓" : "→";
  const color =
    change.direction === "up" ? "text-green-600" : change.direction === "down" ? "text-red-600" : "text-gray-400";
  return (
    <span className={`text-xs font-medium ${color}`}>
      {arrow} {Math.abs(change.percent)}%
    </span>
  );
}

const METRICS: { key: keyof MetricSet; label: string }[] = [
  { key: "views", label: "צפיות" },
  { key: "reach", label: "ריץ'" },
  { key: "interactions", label: "אינטראקציות" },
  { key: "clicks", label: "קליקים" },
];

export function DataPreview({
  current,
  previous,
  changes,
  annualAverage,
  threeMonthAverage,
  rawData,
}: DataPreviewProps) {
  if (!current) {
    return (
      <Card>
        <p className="text-sm text-gray-400 text-center py-4">
          אין נתונים מסונכרנים לחודש זה. לחץ "סנכרן נתונים" למשיכת הנתונים מ-Google Sheets.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="font-semibold text-[#1a1a2e] mb-3">📊 נתונים מסונכרנים</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-gray-500 text-xs">
            <tr>
              <th className="text-right pb-2 font-medium">מטריקה</th>
              <th className="text-right pb-2 font-medium">החודש</th>
              <th className="text-right pb-2 font-medium">קודם</th>
              <th className="text-right pb-2 font-medium">שינוי</th>
              <th className="text-right pb-2 font-medium">ממוצע שנתי</th>
              <th className="text-right pb-2 font-medium">ממוצע 3ח'</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e8f0]">
            {METRICS.map((m) => (
              <tr key={m.key}>
                <td className="py-2 font-medium text-[#1a1a2e]">{m.label}</td>
                <td className="py-2"><Num n={current[m.key]} bold /></td>
                <td className="py-2 text-gray-500"><Num n={previous?.[m.key] ?? null} /></td>
                <td className="py-2">
                  <ChangeArrow change={changes[m.key]} />
                </td>
                <td className="py-2 text-gray-500"><Num n={annualAverage[m.key]} /></td>
                <td className="py-2 text-[#e94560]"><Num n={threeMonthAverage[m.key]} /></td>
              </tr>
            ))}
            <tr>
              <td className="py-2 font-medium text-[#1a1a2e]">עוקבים</td>
              <td className="py-2"><Num n={current.followersCount} bold /></td>
              <td className="py-2 text-gray-500"><Num n={previous?.followersCount ?? null} /></td>
              <td className="py-2 text-green-600 text-xs font-medium">
                <span dir="ltr">
                  {current.followersGrowth !== null && current.followersGrowth >= 0 ? "+" : ""}
                  {fmt(current.followersGrowth)}
                </span>
              </td>
              <td className="py-2 text-gray-400" colSpan={2}>—</td>
            </tr>
          </tbody>
        </table>
      </div>

      {rawData && Object.keys(rawData).length > 0 && (
        <details className="mt-4">
          <summary className="text-xs text-gray-500 cursor-pointer hover:text-[#1a1a2e]">
            הצג כל הנתונים הגולמיים ({Object.keys(rawData).length} שדות)
          </summary>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs bg-[#f8f8fb] rounded-lg p-3 max-h-60 overflow-y-auto">
            {Object.entries(rawData).map(([key, value]) => (
              <div key={key} className="flex justify-between gap-2">
                <span className="text-gray-500 truncate">{key.split("_")[0] || key}</span>
                <span className="font-mono text-[#1a1a2e]">{String(value)}</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </Card>
  );
}
