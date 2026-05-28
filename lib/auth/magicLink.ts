import crypto from "crypto";
import { db, adminMagicTokens } from "@/lib/db";
import { eq, and, gt } from "drizzle-orm";

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function createAdminToken(email: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await db.insert(adminMagicTokens).values({ email, token, expiresAt });
  return token;
}

export async function verifyAdminToken(
  token: string
): Promise<string | null> {
  const rows = await db
    .select()
    .from(adminMagicTokens)
    .where(
      and(
        eq(adminMagicTokens.token, token),
        eq(adminMagicTokens.used, false),
        gt(adminMagicTokens.expiresAt, new Date())
      )
    )
    .limit(1);

  if (rows.length === 0) return null;

  await db
    .update(adminMagicTokens)
    .set({ used: true })
    .where(eq(adminMagicTokens.token, token));

  return rows[0].email;
}

export function generateClientToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
