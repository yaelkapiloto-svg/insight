import type { FollowerRow } from "@/types/report";

const HEBREW_MONTHS: Record<string, string> = {
  "01": "ינואר", "02": "פברואר", "03": "מרץ", "04": "אפריל",
  "05": "מאי", "06": "יוני", "07": "יולי", "08": "אוגוסט",
  "09": "ספטמבר", "10": "אוקטובר", "11": "נובמבר", "12": "דצמבר",
};

function formatMonth(month: string): string {
  const [year, mm] = month.split("-");
  return `${HEBREW_MONTHS[mm] ?? mm} ${year}`;
}

interface Props {
  history: FollowerRow[];
}

export function FollowersTable({ history }: Props) {
  if (history.length === 0) return null;

  const sorted = [...history].sort((a, b) => b.month.localeCompare(a.month));
  const growths = sorted
    .map((r) => r.followersGrowth)
    .filter((v): v is number => v !== null);
  const avgGrowth = growths.length > 0
    ? Math.round(growths.reduce((a, b) => a + b, 0) / growths.length)
    : null;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-[#1a1a2e]">גדילת עוקבים</h2>
        {avgGrowth !== null && (
          <span className="text-sm text-gray-500">
            ממוצע גדילה חודשי: <strong className="text-[#1a1a2e]">+{avgGrowth.toLocaleString("he-IL")}</strong>
          </span>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#f8f8fb] text-gray-500 text-xs">
            <tr>
              <th className="px-4 py-3 text-right font-medium">חודש</th>
              <th className="px-4 py-3 text-right font-medium">סה"כ עוקבים</th>
              <th className="px-4 py-3 text-right font-medium">גדילה</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e8f0]">
            {sorted.map((row) => (
              <tr key={row.month} className="hover:bg-[#f8f8fb] transition">
                <td className="px-4 py-2.5 font-medium text-[#1a1a2e]">{formatMonth(row.month)}</td>
                <td className="px-4 py-2.5">{row.followersCount?.toLocaleString("he-IL") ?? "—"}</td>
                <td className="px-4 py-2.5">
                  {row.followersGrowth !== null ? (
                    <span className={row.followersGrowth >= 0 ? "text-green-600" : "text-red-600"}>
                      {row.followersGrowth >= 0 ? "+" : ""}{row.followersGrowth.toLocaleString("he-IL")}
                    </span>
                  ) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
