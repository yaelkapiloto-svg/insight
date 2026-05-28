import type { MonthlyMetricData, MetricSet } from "@/types/report";

const METRICS: (keyof MetricSet)[] = ["views", "reach", "interactions", "clicks"];

function average(values: (number | null)[]): number | null {
  const nums = values.filter((v): v is number => v !== null);
  if (nums.length === 0) return null;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function avgForMetric(rows: MonthlyMetricData[], metric: keyof MetricSet): number | null {
  return average(rows.map((r) => r[metric]));
}

export function computeAnnualAverage(rows: MonthlyMetricData[], currentMonth: string): MetricSet {
  const year = currentMonth.slice(0, 4);
  const yearRows = rows.filter((r) => r.month.startsWith(year) && r.month <= currentMonth);
  return {
    views: avgForMetric(yearRows, "views"),
    reach: avgForMetric(yearRows, "reach"),
    interactions: avgForMetric(yearRows, "interactions"),
    clicks: avgForMetric(yearRows, "clicks"),
  };
}

export function computeThreeMonthAverage(rows: MonthlyMetricData[], currentMonth: string): MetricSet {
  const sorted = [...rows]
    .filter((r) => r.month <= currentMonth)
    .sort((a, b) => b.month.localeCompare(a.month));
  const recent = sorted.slice(0, 3);
  return {
    views: avgForMetric(recent, "views"),
    reach: avgForMetric(recent, "reach"),
    interactions: avgForMetric(recent, "interactions"),
    clicks: avgForMetric(recent, "clicks"),
  };
}
