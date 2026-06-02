import { NextRequest } from "next/server";
import { db, monthlyMetrics, contentTypeMetrics } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { computeAnnualAverage, computeThreeMonthAverage } from "@/lib/calculations/averages";
import { computeChanges } from "@/lib/calculations/changes";
import type { MonthlyMetricData } from "@/types/report";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.isAdmin) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const month = request.nextUrl.searchParams.get("month");

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
  const availableMonths = all.map((r) => r.month);

  if (availableMonths.length === 0) {
    return Response.json({ availableMonths: [], current: null });
  }

  const targetMonth = month && availableMonths.includes(month) ? month : availableMonths[0];
  const currentRow = allMetricsRows.find((r) => r.month === targetMonth);
  const current = currentRow ? toMetricData(currentRow) : null;

  const sorted = [...all].sort((a, b) => a.month.localeCompare(b.month));
  const currentIdx = sorted.findIndex((r) => r.month === targetMonth);
  const previous = currentIdx > 0 ? sorted[currentIdx - 1] : null;

  const annualAverage = computeAnnualAverage(all, targetMonth);
  const threeMonthAverage = computeThreeMonthAverage(all, targetMonth);
  const changes = computeChanges(current, previous);

  const contentTypes = await db
    .select()
    .from(contentTypeMetrics)
    .where(eq(contentTypeMetrics.clientId, id));

  const rawData = currentRow?.rawData ?? null;

  return Response.json({
    availableMonths,
    month: targetMonth,
    current,
    previous,
    changes,
    annualAverage,
    threeMonthAverage,
    contentTypes: contentTypes.filter((c) => c.month === targetMonth),
    rawData,
  });
}
