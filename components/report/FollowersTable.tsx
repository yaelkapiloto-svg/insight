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
  const growths = sorted.map((r) => r.followersGrowth).filter((v): v is number => v !== null);
  const avgGrowth = growths.length > 0
    ? Math.round(growths.reduce((a, b) => a + b, 0) / growths.length)
    : null;

  const maxCount = Math.max(...sorted.map((r) => r.followersCount ?? 0));

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[#1a1a2e]">גדילת עוקבים</h2>
        {avgGrowth !== null && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            <span className="text-xs font-semibold text-emerald-700">
              +{avgGrowth.toLocaleString("en-US")} ממוצע חודשי
            </span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-[#1a1a2e] to-[#2d1b69] text-white">
              <th className="px-5 py-3.5 text-right font-semibold text-xs tracking-wider">חודש</th>
              <th className="px-5 py-3.5 text-right font-semibold text-xs tracking-wider">סה״כ עוקבים</th>
              <th className="px-5 py-3.5 text-right font-semibold text-xs tracking-wider">גדילה</th>
              <th className="px-5 py-3.5 text-right font-semibold text-xs tracking-wider">צמיחה</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f0f8]">
            {sorted.map((row, i) => {
              const barWidth = maxCount > 0 && row.followersCount
                ? Math.round((row.followersCount / maxCount) * 100)
                : 0;
              const isPositive = (row.followersGrowth ?? 0) >= 0;

              return (
                <tr
                  key={row.month}
                  className={`hover:bg-[#fafaff] transition-colors ${i === 0 ? "bg-[#fafaff]" : ""}`}
                >
                  <td className="px-5 py-3">
                    <span className={`font-semibold ${i === 0 ? "text-[#1a1a2e]" : "text-gray-600"}`}>
                      {formatMonth(row.month)}
                    </span>
                    {i === 0 && (
                      <span className="mr-2 text-[10px] bg-[#1a1a2e] text-white px-1.5 py-0.5 rounded-full">עדכני</span>
                    )}
                  </td>
                  <td className="px-5 py-3 font-bold text-[#1a1a2e]" dir="ltr">
                    {row.followersCount?.toLocaleString("en-US") ?? "—"}
                  </td>
                  <td className="px-5 py-3">
                    {row.followersGrowth !== null ? (
                      <span
                        className={`inline-flex items-center gap-1 font-bold text-sm ${
                          isPositive ? "text-emerald-600" : "text-red-500"
                        }`}
                        dir="ltr"
                      >
                        <span>{isPositive ? "↑" : "↓"}</span>
                        {Math.abs(row.followersGrowth).toLocaleString("en-US")}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-5 py-3 w-28">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#1a1a2e] to-[#7c3aed] rounded-full"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
