import { NextRequest } from "next/server";
import { db, reportMonths } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.isAdmin) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const { month, analysisHtml, summaryHtml } = await request.json();

  if (!month) {
    return Response.json({ error: "חודש נדרש" }, { status: 400 });
  }

  const existing = await db
    .select()
    .from(reportMonths)
    .where(and(eq(reportMonths.clientId, id), eq(reportMonths.month, month)))
    .limit(1);

  let result;
  if (existing.length > 0) {
    [result] = await db
      .update(reportMonths)
      .set({
        status: "published",
        publishedAt: new Date(),
        ...(analysisHtml !== undefined && { analysisHtml }),
        ...(summaryHtml !== undefined && { summaryHtml }),
        updatedAt: new Date(),
      })
      .where(and(eq(reportMonths.clientId, id), eq(reportMonths.month, month)))
      .returning();
  } else {
    [result] = await db
      .insert(reportMonths)
      .values({
        clientId: id,
        month,
        status: "published",
        publishedAt: new Date(),
        analysisHtml,
        summaryHtml,
      })
      .returning();
  }

  return Response.json(result);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.isAdmin) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const { month, analysisHtml, summaryHtml } = await request.json();

  if (!month) {
    return Response.json({ error: "חודש נדרש" }, { status: 400 });
  }

  const existing = await db
    .select()
    .from(reportMonths)
    .where(and(eq(reportMonths.clientId, id), eq(reportMonths.month, month)))
    .limit(1);

  let result;
  if (existing.length > 0) {
    [result] = await db
      .update(reportMonths)
      .set({
        ...(analysisHtml !== undefined && { analysisHtml }),
        ...(summaryHtml !== undefined && { summaryHtml }),
        updatedAt: new Date(),
      })
      .where(and(eq(reportMonths.clientId, id), eq(reportMonths.month, month)))
      .returning();
  } else {
    [result] = await db
      .insert(reportMonths)
      .values({
        clientId: id,
        month,
        status: "draft",
        analysisHtml,
        summaryHtml,
      })
      .returning();
  }

  return Response.json(result);
}
