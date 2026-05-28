import { NextRequest } from "next/server";
import { db, clients, reportMonths, monthlyMetrics, contentTypeMetrics, topContent } from "@/lib/db";
import { eq, and, desc } from "drizzle-orm";
import { computeAnnualAverage, computeThreeMonthAverage } from "@/lib/calculations/averages";
import { computeChanges } from "@/lib/calculations/changes";
import type { MonthlyMetricData, ReportData } from "@/types/report";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const monthParam = request.nextUrl.searchParams.get("month");

  const [client] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.magicToken, token), eq(clients.isActive, true)))
    .limit(1);

  if (!client) {
    return Response.json({ error: "לא נמצא" }, { status: 404 });
  }

  const allMonths = await db
    .select({ month: reportMonths.month })
    .from(reportMonths)
    .where(and(eq(reportMonths.clientId, client.id), eq(reportMonths.status, "published")))
    .orderBy(desc(reportMonths.month));

  const availableMonths = allMonths.map((r) => r.month);

  if (availableMonths.length === 0) {
    return Response.json({
      client: { id: client.id, name: client.name, logoUrl: client.logoUrl },
      availableMonths: [],
      month: null,
      status: "none",
    } as unknown as Partial<ReportData>);
  }

  const targetMonth = monthParam && availableMonths.includes(monthParam)
    ? monthParam
    : availableMonths[0];

  const [reportMonth] = await db
    .select()
    .from(reportMonths)
    .where(and(eq(reportMonths.clientId, client.id), eq(reportMonths.month, targetMonth)))
    .limit(1);

  const allMetricsRows = await db
    .select()
    .from(monthlyMetrics)
    .where(eq(monthlyMetrics.clientId, client.id))
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

  const allMetricData = allMetricsRows.map(toMetricData);
  const currentMetricsRow = allMetricsRows.find((r) => r.month === targetMonth);
  const currentMetrics = currentMetricsRow ? toMetricData(currentMetricsRow) : null;

  const sortedMonths = [...allMetricData].sort((a, b) => a.month.localeCompare(b.month));
  const currentIdx = sortedMonths.findIndex((r) => r.month === targetMonth);
  const previousMetrics = currentIdx > 0 ? sortedMonths[currentIdx - 1] : null;

  const annualAvg = computeAnnualAverage(allMetricData, targetMonth);
  const threeMonthAvg = computeThreeMonthAverage(allMetricData, targetMonth);
  const changes = computeChanges(currentMetrics, previousMetrics);

  const contentTypesRows = await db
    .select()
    .from(contentTypeMetrics)
    .where(and(eq(contentTypeMetrics.clientId, client.id), eq(contentTypeMetrics.month, targetMonth)));

  const topContentRows = await db
    .select()
    .from(topContent)
    .where(and(eq(topContent.clientId, client.id), eq(topContent.month, targetMonth)));

  const followersHistory = allMetricData
    .filter((r) => r.followersCount !== null)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((r) => ({
      month: r.month,
      followersCount: r.followersCount,
      followersGrowth: r.followersGrowth,
    }));

  const data: ReportData = {
    client: { id: client.id, name: client.name, logoUrl: client.logoUrl },
    month: targetMonth,
    status: reportMonth?.status ?? "published",
    analysisHtml: reportMonth?.analysisHtml ?? null,
    summaryHtml: reportMonth?.summaryHtml ?? null,
    publishedAt: reportMonth?.publishedAt?.toISOString() ?? null,
    currentMetrics,
    previousMetrics,
    averages: { annual: annualAvg, threeMonth: threeMonthAvg },
    changes,
    contentTypes: contentTypesRows.map((r) => ({
      contentType: r.contentType,
      views: r.views,
      reach: r.reach,
      interactions: r.interactions,
      clicks: r.clicks,
      postCount: r.postCount,
    })),
    topContent: topContentRows.map((r) => ({
      metric: r.metric,
      contentType: r.contentType,
      value: r.value,
      screenshotUrl: r.screenshotUrl,
      driveFileId: r.driveFileId,
    })),
    followersHistory,
    availableMonths,
  };

  return Response.json(data);
}
