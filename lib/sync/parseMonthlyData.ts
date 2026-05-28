import { parseRows } from "@/lib/google/sheets";
import { matchMonth } from "@/lib/fuzzy";

function num(v: string | undefined): number | null {
  if (!v || !v.trim()) return null;
  const n = Number(v.replace(/,/g, "").trim());
  return isNaN(n) ? null : n;
}

function parseMonthCell(v: string): string | null {
  // Expect "MM/YYYY", "YYYY-MM", or Hebrew month + year like "ינואר 2025"
  if (!v?.trim()) return null;
  const iso = v.match(/^(\d{4})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-01`;
  const slash = v.match(/^(\d{1,2})\/(\d{4})/);
  if (slash) return `${slash[2]}-${slash[1].padStart(2, "0")}-01`;

  const parts = v.trim().split(/\s+/);
  if (parts.length >= 2) {
    const mm = matchMonth(parts[0]);
    const year = parts[1].match(/^\d{4}$/) ? parts[1] : parts[0].match(/^\d{4}$/) ? parts[0] : null;
    if (mm && year) return `${year}-${mm}-01`;
  }
  return null;
}

export interface ParsedMonthlyRow {
  month: string;
  filmingDays: number | null;
  meetingsCount: number | null;
  views: number | null;
  reach: number | null;
  interactions: number | null;
  clicks: number | null;
  followersCount: number | null;
  followersGrowth: number | null;
  rawData: Record<string, string>;
}

const COLUMN_MAP: Record<string, keyof ParsedMonthlyRow> = {
  // Hebrew headers
  "חודש": "month",
  "ימי צילום": "filmingDays",
  "פגישות": "meetingsCount",
  "צפיות": "views",
  "הגעה": "reach",
  "אינטראקציות": "interactions",
  "קליקים": "clicks",
  "עוקבים": "followersCount",
  "גדילת עוקבים": "followersGrowth",
  // English fallbacks
  "month": "month",
  "filming days": "filmingDays",
  "meetings": "meetingsCount",
  "views": "views",
  "reach": "reach",
  "interactions": "interactions",
  "clicks": "clicks",
  "followers": "followersCount",
  "followers growth": "followersGrowth",
};

export function parseMonthlyData(rows: string[][]): ParsedMonthlyRow[] {
  return parseRows(rows, (headers, row) => {
    const result: Partial<ParsedMonthlyRow> & { rawData: Record<string, string> } = {
      rawData: {},
    };

    headers.forEach((h, i) => {
      const v = row[i] ?? "";
      result.rawData[h] = v;
      const field = COLUMN_MAP[h.trim()];
      if (!field) return;
      if (field === "month") {
        result.month = parseMonthCell(v) ?? undefined;
      } else {
        (result as Record<string, unknown>)[field] = num(v);
      }
    });

    return result as ParsedMonthlyRow;
  }).filter((r) => r.month);
}
