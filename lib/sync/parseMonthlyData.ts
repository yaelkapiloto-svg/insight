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

  // ISO format YYYY-MM
  const iso = cleaned.match(/^(\d{4})-(\d{1,2})/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, "0")}-01`;

  // MM/YY or MM/YYYY
  const slash = cleaned.match(/^(\d{1,2})\/(\d{2,4})$/);
  if (slash) {
    const month = slash[1].padStart(2, "0");
    const yearRaw = slash[2];
    const year = yearRaw.length === 2 ? `20${yearRaw}` : yearRaw;
    return `${year}-${month}-01`;
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

/**
 * Five Fingers sheet structure:
 * - Rows 1-2 are header rows (category + sub-header)
 * - Row 3+ is data
 * Columns (0-indexed):
 *   0 (A) = month "MM/YY"
 *   1 (B) = views total (צפיות > טוטאל)
 *   5 (F) = reach (ריץ')
 *   6 (G) = interactions total (אינטראקציות > טוטאל)
 *  11 (L) = followers count (עוקבים)
 *  12 (M) = followers growth (כמה עוקבים נוספו)
 *  13 (N) = post count (מס׳ פוסטים שעלו)
 *  14 (O) = reels count (מס׳ רילס שעלו)
 *  15 (P) = clicks (הקלקות על הלינק)
 */
const COL = {
  month: 0,
  views: 1,
  reach: 5,
  interactions: 6,
  followers: 11,
  followersGrowth: 12,
  clicks: 15,
} as const;

export function parseMonthlyData(rows: string[][]): ParsedMonthlyRow[] {
  if (rows.length < 3) return [];

  const headers = rows[1] ?? rows[0] ?? [];
  const dataRows = rows.slice(2);

  return dataRows
    .map((row) => {
      const month = parseMonthCell(row[COL.month]);
      if (!month) return null;

      const rawData: Record<string, string> = {};
      headers.forEach((h, i) => {
        if (h && row[i]) rawData[`${h}_${i}`] = row[i];
      });

      return {
        month,
        filmingDays: null,
        meetingsCount: null,
        views: num(row[COL.views]),
        reach: num(row[COL.reach]),
        interactions: num(row[COL.interactions]),
        clicks: num(row[COL.clicks]),
        followersCount: num(row[COL.followers]),
        followersGrowth: num(row[COL.followersGrowth]),
        rawData,
      } as ParsedMonthlyRow;
    })
    .filter((r): r is ParsedMonthlyRow => r !== null);
}
