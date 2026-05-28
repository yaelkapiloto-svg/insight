import { Card } from "@/components/ui/Card";
import { MetricChangePill } from "./MetricChangePill";
import type { MonthlyMetricData, ChangeData } from "@/types/report";

const METRIC_LABELS: Record<string, string> = {
  views: "צפיות",
  reach: "הגעה",
  interactions: "אינטראקציות",
  clicks: "קליקים",
};

const METRIC_ICONS: Record<string, string> = {
  views: "👁",
  reach: "📡",
  interactions: "❤️",
  clicks: "🖱",
};

function fmt(n: number | null): string {
  if (n === null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("he-IL");
}

interface Props {
  current: MonthlyMetricData | null;
  previous: MonthlyMetricData | null;
  changes: ChangeData;
  currentMonthLabel: string;
  previousMonthLabel: string;
}

export function MonthlyComparison({ current, previous, changes, currentMonthLabel, previousMonthLabel }: Props) {
  const metrics = ["views", "reach", "interactions", "clicks"] as const;

  return (
    <section>
      <h2 className="text-lg font-bold text-[#1a1a2e] mb-3">השוואה חודשית</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const change = changes[metric];
          return (
            <Card key={metric}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#1a1a2e]">{METRIC_LABELS[metric]}</span>
                <span>{METRIC_ICONS[metric]}</span>
              </div>

              <div className="mb-3">
                <div className="text-xs text-gray-400 mb-0.5">{currentMonthLabel}</div>
                <div className="text-2xl font-bold text-[#1a1a2e]">
                  {fmt(current?.[metric] ?? null)}
                </div>
                {change && (
                  <MetricChangePill
                    percent={change.percent}
                    direction={change.direction}
                    className="mt-1"
                  />
                )}
              </div>

              <div className="border-t border-[#e2e8f0] pt-2">
                <div className="text-xs text-gray-400 mb-0.5">{previousMonthLabel}</div>
                <div className="text-sm font-medium text-gray-500">
                  {fmt(previous?.[metric] ?? null)}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
