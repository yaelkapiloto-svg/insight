import { matchContentType } from "@/lib/fuzzy";

function num(v: string | undefined): number | null {
  if (!v) return null;
  const trimmed = v.replace(/,/g, "").replace(/%/g, "").replace(/\s/g, "").trim();
  if (!trimmed || trimmed === "-") return null;
  const n = Number(trimmed);
  return isNaN(n) ? null : n;
}

function parseMonthCell(v: string | undefined): string | null {
  if (!v) return null;
  const cleaned = v.trim();
  const iso = cleaned.match(/^(\d{4})-(\d{1,2})/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, "0")}-01`;
  const slash = cleaned.match(/^(\d{1,2})\/(\d{2,4})$/);
  if (slash) {
    const month = slash[1].padStart(2, "0");
    const yearRaw = slash[2];
    const year = yearRaw.length === 2 ? `20${yearRaw}` : yearRaw;
    return `${year}-${month}-01`;
  }
  return null;
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

/**
 * Parse the "נתונים סוג תוכן" sheet.
 * Expected structure (mirrors monthly sheet — 2 header rows):
 *   0 (A) = month "MM/YY"
 *   1 (B) = content type label (e.g. "רילס" / "סטוריז" / "פוסטים" / "קרוסלה")
 *   2 (C) = views
 *   3 (D) = reach
 *   4 (E) = interactions
 *   5 (F) = clicks
 *   6 (G) = post count
 *
 * Falls back gracefully: if column 1 doesn't look like a content-type label,
 * the row is skipped.
 */
const COL = {
  month: 0,
  contentType: 1,
  views: 2,
  reach: 3,
  interactions: 4,
  clicks: 5,
  postCount: 6,
} as const;

export function parseContentTypeData(rows: string[][]): ParsedContentTypeRow[] {
  if (rows.length < 2) return [];

  // Detect single vs double header row: if row 0 col 0 parses as a date, single header.
  const headerRows = parseMonthCell(rows[0]?.[COL.month]) ? 0 : 2;
  const headers = rows[Math.max(0, headerRows - 1)] ?? rows[0] ?? [];
  const dataRows = rows.slice(headerRows);

  const out: ParsedContentTypeRow[] = [];

  for (const row of dataRows) {
    const month = parseMonthCell(row[COL.month]);
    if (!month) continue;

    const rawType = row[COL.contentType]?.trim();
    if (!rawType) continue;

    const contentType = matchContentType(rawType) ?? rawType.toLowerCase().trim();
    if (!contentType) continue;

    const rawData: Record<string, string> = {};
    headers.forEach((h, i) => {
      if (h && row[i]) rawData[`${h}_${i}`] = row[i];
    });

    out.push({
      month,
      contentType,
      views: num(row[COL.views]),
      reach: num(row[COL.reach]),
      interactions: num(row[COL.interactions]),
      clicks: num(row[COL.clicks]),
      postCount: num(row[COL.postCount]),
      rawData,
    });
  }

  return out;
}
