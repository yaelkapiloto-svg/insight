import { Card } from "@/components/ui/Card";
import type { AverageData } from "@/types/report";

const METRIC_LABELS: Record<string, string> = {
  views: "צפיות",
  reach: "הגעה",
  interactions: "אינטראקציות",
  clicks: "קליקים",
};

function formatNum(n: number | null): string {
  if (n === null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("he-IL");
}

interface Props {
  averages: AverageData;
}

export function AverageCards({ averages }: Props) {
  const metrics = ["views", "reach", "interactions", "clicks"] as const;

  return (
    <section>
      <h2 className="text-lg font-bold text-[#1a1a2e] mb-3">ממוצעים</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric} className="space-y-3">
            <div className="text-sm font-medium text-[#1a1a2e]">{METRIC_LABELS[metric]}</div>
            <div>
              <div className="text-xs text-gray-400 mb-0.5">ממוצע שנתי</div>
              <div className="text-xl font-bold text-[#1a1a2e]">
                {formatNum(averages.annual[metric])}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-0.5">ממוצע 3 חודשים</div>
              <div className="text-lg font-semibold text-[#e94560]">
                {formatNum(averages.threeMonth[metric])}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
