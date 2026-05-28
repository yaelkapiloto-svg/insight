import { db } from "@/lib/db";
import {
  clients,
  monthlyMetrics,
  contentTypeMetrics,
  topContent,
  reportMonths,
  syncLogs,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { readSheet } from "@/lib/google/sheets";
import { parseMonthlyData } from "./parseMonthlyData";
import { parseContentTypeData } from "./parseContentType";
import { matchDriveFiles } from "./matchDriveFiles";

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

    // 2. Parse content-type metrics (sheet has all months together)
    const ctRows = await readSheet(client.sheetId, CONTENT_TYPE_SHEET);
    // Detect month column and group rows by month
    if (ctRows.length > 1) {
      const headers = ctRows[0];
      const monthIdx = headers.findIndex((h) => h.toLowerCase().includes("חודש") || h.toLowerCase() === "month");
      const monthSet = new Set<string>();
      if (monthIdx >= 0) {
        ctRows.slice(1).forEach((r) => {
          const m = r[monthIdx];
          if (m) monthSet.add(m);
        });
        for (const rawMonth of monthSet) {
          const monthRows = [ctRows[0], ...ctRows.slice(1).filter((r) => r[monthIdx] === rawMonth)];
          const parsedMonth = parsed.find((p) => p.rawData[headers[monthIdx]] === rawMonth);
          if (!parsedMonth) continue;
          const ctData = parseContentTypeData(monthRows, parsedMonth.month);
          for (const ct of ctData) {
            await db
              .insert(contentTypeMetrics)
              .values({ clientId, ...ct })
              .onConflictDoUpdate({
                target: [contentTypeMetrics.clientId, contentTypeMetrics.month, contentTypeMetrics.contentType],
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
        }
      }
    }

    // 3. Match Drive screenshots for each month's top content
    if (client.driveFolderId) {
      const metrics = ["views", "reach", "interactions", "clicks"];
      const contentTypes = ["reels", "stories", "posts", "carousel"];

      for (const row of parsed) {
        const files = await matchDriveFiles(
          client.driveFolderId,
          row.month,
          contentTypes,
          metrics
        );
        for (const file of files) {
          await db
            .insert(topContent)
            .values({
              clientId,
              month: row.month,
              metric: file.metric,
              contentType: file.contentType,
              driveFileId: file.driveFileId,
              value: null,
            })
            .onConflictDoUpdate({
              target: [topContent.clientId, topContent.month, topContent.metric],
              set: {
                contentType: file.contentType,
                driveFileId: file.driveFileId,
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
      .set({ status: "success", finishedAt: new Date(), details: { rowsSynced: parsed.length } })
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
