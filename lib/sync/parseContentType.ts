import { parseRows } from "@/lib/google/sheets";
import { matchContentType } from "@/lib/fuzzy";

function num(v: string | undefined): number | null {
  if (!v || !v.trim()) return null;
  const n = Number(v.replace(/,/g, "").trim());
  return isNaN(n) ? null : n;
}

export interface ParsedContentTypeRow {
  month: string;
  contentType: string;
  views: number | null;
  reach: number | null;
  interactions: number | null;
  clicks: number | null;
  postCount: number | null;
  rawData: Record<string, string>;
}

export function parseContentTypeData(rows: string[][], month: string): ParsedContentTypeRow[] {
  return parseRows(rows, (headers, row) => {
    const rawData: Record<string, string> = {};
    headers.forEach((h, i) => { rawData[h] = row[i] ?? ""; });

    const getCol = (key: string) => {
      const idx = headers.findIndex((h) =>
        h.toLowerCase().trim() === key.toLowerCase().trim()
      );
      return idx >= 0 ? row[idx] ?? "" : "";
    };

    const rawType = getCol("סוג תוכן") || getCol("content type") || getCol("type") || (row[0] ?? "");
    const contentType = matchContentType(rawType) ?? rawType.toLowerCase().trim();

    return {
      month,
      contentType,
      views: num(getCol("צפיות") || getCol("views")),
      reach: num(getCol("הגעה") || getCol("reach")),
      interactions: num(getCol("אינטראקציות") || getCol("interactions")),
      clicks: num(getCol("קליקים") || getCol("clicks")),
      postCount: num(getCol("כמות פוסטים") || getCol("posts") || getCol("post count")),
      rawData,
    };
  }).filter((r) => r.contentType);
}
