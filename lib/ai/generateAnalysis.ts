import Anthropic from "@anthropic-ai/sdk";
import type { MonthlyMetricData, MetricSet, ChangeData } from "@/types/report";

interface AnalysisInput {
  clientName: string;
  monthLabel: string;
  current: MonthlyMetricData;
  previous: MonthlyMetricData | null;
  changes: ChangeData;
  annualAverage: MetricSet;
  threeMonthAverage: MetricSet;
}

function fmt(n: number | null): string {
  if (n === null) return "אין נתון";
  return n.toLocaleString("he-IL");
}

function formatChanges(changes: ChangeData): string {
  const lines: string[] = [];
  const labels: Record<string, string> = {
    views: "צפיות",
    reach: "ריץ'",
    interactions: "אינטראקציות",
    clicks: "קליקים",
  };
  for (const [key, change] of Object.entries(changes)) {
    if (!change) continue;
    const arrow = change.direction === "up" ? "↑" : change.direction === "down" ? "↓" : "→";
    lines.push(`- ${labels[key]}: ${arrow} ${Math.abs(change.percent)}%`);
  }
  return lines.join("\n");
}

export async function generateAnalysis(input: AnalysisInput): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  const client = new Anthropic({ apiKey });

  const prompt = `אתה אנליסט מומחה של תוכן סושיאל מדיה. כתוב ניתוח קצר (2-4 פסקאות) בעברית של ביצועי החודש של הלקוח ${input.clientName} בחודש ${input.monthLabel}.

נתוני החודש הנוכחי:
- צפיות: ${fmt(input.current.views)}
- ריץ': ${fmt(input.current.reach)}
- אינטראקציות: ${fmt(input.current.interactions)}
- קליקים: ${fmt(input.current.clicks)}
- עוקבים: ${fmt(input.current.followersCount)}
- גדילת עוקבים: ${fmt(input.current.followersGrowth)}

${input.previous ? `נתוני החודש הקודם:
- צפיות: ${fmt(input.previous.views)}
- ריץ': ${fmt(input.previous.reach)}
- אינטראקציות: ${fmt(input.previous.interactions)}
- קליקים: ${fmt(input.previous.clicks)}

שינויים חודש מול חודש:
${formatChanges(input.changes)}` : "(אין נתוני חודש קודם להשוואה)"}

ממוצעים שנתיים:
- צפיות: ${fmt(input.annualAverage.views)}
- ריץ': ${fmt(input.annualAverage.reach)}
- אינטראקציות: ${fmt(input.annualAverage.interactions)}
- קליקים: ${fmt(input.annualAverage.clicks)}

ממוצעים 3 חודשים אחרונים:
- צפיות: ${fmt(input.threeMonthAverage.views)}
- ריץ': ${fmt(input.threeMonthAverage.reach)}
- אינטראקציות: ${fmt(input.threeMonthAverage.interactions)}
- קליקים: ${fmt(input.threeMonthAverage.clicks)}

הנחיות:
- כתוב בעברית, בגוף שלישי (לא "אנחנו"), בטון מקצועי וחיובי
- התמקד במגמות חיוביות, התקדמות, או תובנות ביצוע
- אזכר נתונים ספציפיים (אחוזים, ערכים) כדי לעגן את הניתוח
- ארגן בפסקאות קצרות, ללא רשימות
- החזר רק HTML פשוט עם תגיות <p> בלבד (ללא <html>/<body>)
- ללא מבוא או סיום - רק הניתוח עצמו`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text in AI response");
  }
  return textBlock.text.trim();
}
