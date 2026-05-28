import { closest, distance } from "fastest-levenshtein";

const CONTENT_TYPE_ALIASES: Record<string, string[]> = {
  reels: ["ריל", "רילס", "reels", "reel", "ריילס"],
  stories: ["סטורי", "סטוריז", "story", "stories", "סטוריס"],
  posts: ["פוסט", "פוסטים", "post", "posts", "פוסטס"],
  carousel: ["קרוסלה", "קרוסל", "carousel", "carousels", "קרוסלות"],
};

const METRIC_ALIASES: Record<string, string[]> = {
  views: ["צפיות", "views", "view", "צפייה"],
  reach: ["הגעה", "reach", "הגעות"],
  interactions: ["אינטראקציות", "תגובות", "interactions", "interaction", "אינטראקציה"],
  clicks: ["קליקים", "לחיצות", "clicks", "click", "קליק"],
};

export const MONTH_ALIASES: Record<string, string[]> = {
  "01": ["ינואר", "january", "jan"],
  "02": ["פברואר", "february", "feb"],
  "03": ["מרץ", "march", "mar"],
  "04": ["אפריל", "april", "apr"],
  "05": ["מאי", "may"],
  "06": ["יוני", "june", "jun"],
  "07": ["יולי", "july", "jul"],
  "08": ["אוגוסט", "august", "aug"],
  "09": ["ספטמבר", "september", "sep", "sept"],
  "10": ["אוקטובר", "october", "oct"],
  "11": ["נובמבר", "november", "nov"],
  "12": ["דצמבר", "december", "dec"],
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[ְ-ׇ]/g, "")
    .replace(/\s+/g, " ");
}

function matchAlias(input: string, aliases: Record<string, string[]>): string | null {
  const norm = normalize(input);
  for (const [canonical, list] of Object.entries(aliases)) {
    if (list.some((alias) => normalize(alias) === norm)) return canonical;
  }
  // Levenshtein fallback
  const allAliases = Object.entries(aliases).flatMap(([canonical, list]) =>
    list.map((alias) => ({ canonical, alias: normalize(alias) }))
  );
  const best = allAliases.reduce<{ canonical: string; dist: number } | null>((acc, { canonical, alias }) => {
    const d = distance(norm, alias);
    if (!acc || d < acc.dist) return { canonical, dist: d };
    return acc;
  }, null);
  if (best && best.dist <= 2) return best.canonical;
  return null;
}

export function matchContentType(input: string): string | null {
  return matchAlias(input, CONTENT_TYPE_ALIASES);
}

export function matchMetric(input: string): string | null {
  return matchAlias(input, METRIC_ALIASES);
}

export function matchMonth(input: string): string | null {
  return matchAlias(input, MONTH_ALIASES);
}

export function fuzzyMatch(needle: string, haystack: string[]): string | null {
  const norm = normalize(needle);
  const exact = haystack.find((h) => normalize(h) === norm);
  if (exact) return exact;
  const best = closest(norm, haystack.map(normalize));
  const originalIdx = haystack.findIndex((h) => normalize(h) === best);
  if (originalIdx >= 0 && distance(norm, normalize(haystack[originalIdx])) <= 3) {
    return haystack[originalIdx];
  }
  return null;
}
