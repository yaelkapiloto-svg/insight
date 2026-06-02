import { NextRequest } from "next/server";
import { db, clients, monthlyMetrics } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { computeAnnualAverage, computeThreeMonthAverage } from "@/lib/calculations/averages";
import { computeChanges } from "@/lib/calculations/changes";
import { generateAnalysis } from "@/lib/ai/generateAnalysis";
import type { MonthlyMetricData } from "@/types/report";

const HEBREW_MONTHS: Record<string, string> = {
  "01": "ינואר", "02": "פברואר", "03": "מרץ", "04": "אפריל",
  "05": "מאי", "06": "יוני", "07": "יולי", "08": "אוגוסט",
  "09": "ספטמבר", "10": "אוקטובר", "11": "נובמבר", "12": "דצמבר",
};

function formatMonth(month: string): string {
  const [year, mm] = month.split("-");
  return `${HEBREW_MONTHS[mm] ?? mm} ${year}`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.isAdmin) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const { month } = await request.json();

  if (!month) {
    return Response.json({ error: "חודש נדרש" }, { status: 400 });
  }

  const [client] = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  if (!client) {
    return Response.json({ error: "לקוח לא נמצא" }, { status: 404 });
  }

  const allMetricsRows = await db
    .select()
    .from(monthlyMetrics)
    .where(eq(monthlyMetrics.clientId, id))
    .orderBy(desc(monthlyMetrics.month));

  const toMetricData = (r: typeof allMetricsRows[0]): MonthlyMetricData => ({
    month: r.month,
    filmingDays: r.filmingDays,
    meetingsCount: r.meetingsCount,
    views: r.views,
    reach: r.reach,
    interactions: r.interactions,
    clicks: r.clicks,
    followersCount: r.followersCount,
    followersGrowth: r.followersGrowth,
  });

  const all = allMetricsRows.map(toMetricData);
  const current = all.find((r) => r.month === month);

  if (!current) {
    return Response.json({ error: "אין נתונים לחודש זה" }, { status: 404 });
  }

  const sorted = [...all].sort((a, b) => a.month.localeCompare(b.month));
  const currentIdx = sorted.findIndex((r) => r.month === month);
  const previous = currentIdx > 0 ? sorted[currentIdx - 1] : null;

  const annualAverage = computeAnnualAverage(all, month);
  const threeMonthAverage = computeThreeMonthAverage(all, month);
  const changes = computeChanges(current, previous);

  try {
    const html = await generateAnalysis({
      clientName: client.name,
      monthLabel: formatMonth(month),
      current,
      previous,
      changes,
      annualAverage,
      threeMonthAverage,
    });
    return Response.json({ html });
  } catch (err) {
    const message = err instanceof Error ? err.message : "שגיאת AI";
    return Response.json({ error: message }, { status: 500 });
  }
}
