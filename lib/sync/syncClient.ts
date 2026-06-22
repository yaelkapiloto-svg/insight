import { db } from "@/lib/db";
import {
  clients,
  monthlyMetrics,
  contentTypeMetrics,
  topContent,
  reportMonths,
  syncLogs,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { readSheet } from "@/lib/google/sheets";
import { parseMonthlyData } from "./parseMonthlyData";
import { parseContentTypeData } from "./parseContentType";
import { findScreenshot } from "./matchDriveFiles";
import { pickWinners } from "@/lib/calculations/topContent";

const MONTHLY_SHEET = "נתונים פר חודש";
const CONTENT_TYPE_SHEET = "נתונים סוג תוכן";

export async function syncClient(clientId: string): Promise<void> {
  const [client] = await db
    .select()
    .from(clients)
    .where(eq(clients.id, clientId))
    .limit(1);

  if (!client || !client.sheetId) throw new Error("Client not found or no sheet ID");

  const [logRow] = await db
    .insert(syncLogs)
    .values({ clientId, status: "running" })
    .returning();

  try {
    // 1. Parse monthly metrics
    const monthlyRows = await readSheet(client.sheetId, MONTHLY_SHEET);
    const parsed = parseMonthlyData(monthlyRows);

    for (const row of parsed) {
      await db
        .insert(monthlyMetrics)
        .values({
          clientId,
          month: row.month,
          filmingDays: row.filmingDays,
          meetingsCount: row.meetingsCount,
          views: row.views,
          reach: row.reach,
          interactions: row.interactions,
          clicks: row.clicks,
          followersCount: row.followersCount,
          followersGrowth: row.followersGrowth,
          rawData: row.rawData,
        })
        .onConflictDoUpdate({
          target: [monthlyMetrics.clientId, monthlyMetrics.month],
          set: {
            filmingDays: row.filmingDays,
            meetingsCount: row.meetingsCount,
            views: row.views,
            reach: row.reach,
            interactions: row.interactions,
            clicks: row.clicks,
            followersCount: row.followersCount,
            followersGrowth: row.followersGrowth,
            rawData: row.rawData,
            updatedAt: new Date(),
          },
        });
    }

    // 2. Parse content-type metrics for all months at once
    let parsedCT: Awaited<ReturnType<typeof parseContentTypeData>> = [];
    try {
      const ctRows = await readSheet(client.sheetId, CONTENT_TYPE_SHEET);
      parsedCT = parseContentTypeData(ctRows);
      for (const ct of parsedCT) {
        await db
          .insert(contentTypeMetrics)
          .values({ clientId, ...ct })
          .onConflictDoUpdate({
            target: [
              contentTypeMetrics.clientId,
              contentTypeMetrics.month,
              contentTypeMetrics.contentType,
            ],
            set: {
              views: ct.views,
              reach: ct.reach,
              interactions: ct.interactions,
              clicks: ct.clicks,
              postCount: ct.postCount,
              rawData: ct.rawData,
            },
          });
      }
    } catch (err) {
      console.error("Content type sheet parsing failed:", err);
    }

    // 3. For each month, pick winners and find matching screenshots
    if (client.driveFolderId) {
      // Group content type rows by month
      const byMonth = new Map<string, typeof parsedCT>();
      for (const row of parsedCT) {
        const list = byMonth.get(row.month) ?? [];
        list.push(row);
        byMonth.set(row.month, list);
      }

      for (const [month, monthRows] of byMonth) {
        const winners = pickWinners(monthRows);

        for (const winner of winners) {
          let driveFileId: string | null = null;
          try {
            driveFileId = await findScreenshot(
              client.driveFolderId,
              month,
              winner.contentType,
              winner.metric
            );
          } catch (err) {
            console.error("Drive screenshot lookup failed:", err);
          }

          await db
            .insert(topContent)
            .values({
              clientId,
              month,
              metric: winner.metric,
              contentType: winner.contentType,
              value: winner.value,
              driveFileId,
            })
            .onConflictDoUpdate({
              target: [topContent.clientId, topContent.month, topContent.metric],
              set: {
                contentType: winner.contentType,
                value: winner.value,
                driveFileId,
              },
            });
        }
      }
    }

    // 4. Ensure report_months rows exist (as draft)
    for (const row of parsed) {
      await db
        .insert(reportMonths)
        .values({ clientId, month: row.month, status: "draft", syncedAt: new Date() })
        .onConflictDoUpdate({
          target: [reportMonths.clientId, reportMonths.month],
          set: { syncedAt: new Date() },
        });
    }

    await db
      .update(syncLogs)
      .set({
        status: "success",
        finishedAt: new Date(),
        details: {
          monthlyRows: parsed.length,
          contentTypeRows: parsedCT.length,
        },
      })
      .where(eq(syncLogs.id, logRow.id));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db
      .update(syncLogs)
      .set({ status: "error", finishedAt: new Date(), error: message })
      .where(eq(syncLogs.id, logRow.id));
    throw err;
  }
}
