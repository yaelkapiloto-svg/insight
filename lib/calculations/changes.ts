import type { MonthlyMetricData, ChangeData } from "@/types/report";

type Direction = "up" | "down" | "neutral";

function computeChange(
  current: number | null,
  previous: number | null
): ChangeData[keyof ChangeData] {
  if (current === null || previous === null || previous === 0) return null;
  const absolute = current - previous;
  const percent = Math.round((absolute / previous) * 100);
  const direction: Direction = absolute > 0 ? "up" : absolute < 0 ? "down" : "neutral";
  return { absolute, percent, direction };
}

export function computeChanges(
  current: MonthlyMetricData | null,
  previous: MonthlyMetricData | null
): ChangeData {
  if (!current || !previous) {
    return { views: null, reach: null, interactions: null, clicks: null };
  }
  return {
    views: computeChange(current.views, previous.views),
    reach: computeChange(current.reach, previous.reach),
    interactions: computeChange(current.interactions, previous.interactions),
    clicks: computeChange(current.clicks, previous.clicks),
  };
}
