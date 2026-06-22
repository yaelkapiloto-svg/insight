import type { ParsedContentTypeRow } from "@/lib/sync/parseContentType";

export type MetricKey = "views" | "reach" | "interactions" | "clicks";

export interface Winner {
  metric: MetricKey;
  contentType: string;
  value: number;
}

const METRICS: MetricKey[] = ["views", "reach", "interactions", "clicks"];

type WinnableRow = Pick<ParsedContentTypeRow, "contentType" | "views" | "reach" | "interactions" | "clicks">;

export function pickWinners(rows: WinnableRow[]): Winner[] {
  return METRICS.flatMap<Winner>((metric) => {
    let best: WinnableRow | null = null;
    for (const row of rows) {
      const v = row[metric];
      if (v === null || v === undefined) continue;
      if (best === null || (v ?? 0) > (best[metric] ?? 0)) {
        best = row;
      }
    }
    if (!best || best[metric] === null) return [];
    return [{ metric, contentType: best.contentType, value: best[metric]! }];
  });
}
