import { NextRequest } from "next/server";
import { db, monthlyMetrics } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

async function requireAdmin() {
  const session = await getSession();
  if (!session?.isAdmin) return new Response("Unauthorized", { status: 401 });
  return null;
}

function normalizeMonth(month: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(month)) return month;
  if (/^\d{4}-\d{2}$/.test(month)) return `${month}-01`;
  throw new Error("Invalid month format");
}

function validDates(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((d): d is string => typeof d === "string")
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
    .sort();
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin();
  if (err) return err;

  const { id } = await params;
  const body = await request.json();
  const { month, filmingDates, meetingDates } = body;

  if (!month) {
    return Response.json({ error: "חודש נדרש" }, { status: 400 });
  }

  const normalizedMonth = normalizeMonth(month);
  const filming = validDates(filmingDates);
  const meetings = validDates(meetingDates);

  const existing = await db
    .select()
    .from(monthlyMetrics)
    .where(and(eq(monthlyMetrics.clientId, id), eq(monthlyMetrics.month, normalizedMonth)))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(monthlyMetrics).values({
      clientId: id,
      month: normalizedMonth,
      filmingDates: filming,
      meetingDates: meetings,
      filmingDays: filming.length,
      meetingsCount: meetings.length,
    });
  } else {
    await db
      .update(monthlyMetrics)
      .set({
        filmingDates: filming,
        meetingDates: meetings,
        updatedAt: new Date(),
      })
      .where(and(eq(monthlyMetrics.clientId, id), eq(monthlyMetrics.month, normalizedMonth)));
  }

  return Response.json({ ok: true, filmingDates: filming, meetingDates: meetings });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin();
  if (err) return err;

  const { id } = await params;
  const month = request.nextUrl.searchParams.get("month");
  if (!month) return Response.json({ error: "חודש נדרש" }, { status: 400 });

  const [row] = await db
    .select({
      filmingDates: monthlyMetrics.filmingDates,
      meetingDates: monthlyMetrics.meetingDates,
    })
    .from(monthlyMetrics)
    .where(and(eq(monthlyMetrics.clientId, id), eq(monthlyMetrics.month, normalizeMonth(month))))
    .limit(1);

  return Response.json({
    filmingDates: row?.filmingDates ?? [],
    meetingDates: row?.meetingDates ?? [],
  });
}
