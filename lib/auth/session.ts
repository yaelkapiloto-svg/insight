import { cookies } from "next/headers";

const COOKIE_NAME = "kapiloto_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SessionData {
  isAdmin: boolean;
  email: string;
  expiresAt: number;
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return secret;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (padded.length % 4)) % 4;
  const str = atob(padded + "=".repeat(padLen));
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
  return bytes;
}

function utf8Bytes(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

function utf8String(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

async function getKey(): Promise<CryptoKey> {
  const keyBytes = utf8Bytes(getSecret());
  return crypto.subtle.importKey(
    "raw",
    keyBytes as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function sign(payload: string): Promise<string> {
  const key = await getKey();
  const data = utf8Bytes(payload);
  const sig = await crypto.subtle.sign("HMAC", key, data as BufferSource);
  return base64UrlEncode(new Uint8Array(sig));
}

async function verify(payload: string, signature: string): Promise<boolean> {
  const key = await getKey();
  const sigBytes = base64UrlDecode(signature);
  const data = utf8Bytes(payload);
  return crypto.subtle.verify(
    "HMAC",
    key,
    sigBytes as BufferSource,
    data as BufferSource
  );
}

export async function encodeSession(data: SessionData): Promise<string> {
  const payload = base64UrlEncode(utf8Bytes(JSON.stringify(data)));
  const signature = await sign(payload);
  return `${payload}.${signature}`;
}

export async function decodeSession(value: string): Promise<SessionData | null> {
  try {
    const [payload, signature] = value.split(".");
    if (!payload || !signature) return null;
    if (!(await verify(payload, signature))) return null;
    const data = JSON.parse(utf8String(base64UrlDecode(payload)));
    if (data.expiresAt < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  if (!value) return null;
  return decodeSession(value);
}

export async function setSession(data: Omit<SessionData, "expiresAt">) {
  const cookieStore = await cookies();
  const session: SessionData = {
    ...data,
    expiresAt: Date.now() + MAX_AGE_SECONDS * 1000,
  };
  const value = await encodeSession(session);
  cookieStore.set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export { COOKIE_NAME };
