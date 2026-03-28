/**
 * Auth utilities: JWT signing/verification + PIN hashing
 * Uses jose (already a transitive dep) — no new installs required.
 */
import { SignJWT, jwtVerify } from "jose";
import { createHash } from "crypto";
import { cookies } from "next/headers";

export const COOKIE_NAME = "nexus_session";
const TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days
const SLIDING_REFRESH_THRESHOLD = 7 * 24 * 60 * 60; // re-sign if < 7 days remain

// ─── Secret ──────────────────────────────────────────────────────────────────
function getSecret(): Uint8Array {
  const raw = process.env.JWT_SECRET;
  if (!raw || raw.length < 32) {
    throw new Error(
      "JWT_SECRET env var is missing or too short (min 32 chars). " +
        "Add it to .env.local: JWT_SECRET=<random 32+ byte base64 string>"
    );
  }
  return new TextEncoder().encode(raw);
}

// ─── PIN hashing ─────────────────────────────────────────────────────────────
/** SHA-256( userId + ":nexus:" + pin ) — deterministic, no bcrypt overhead */
export function hashPin(userId: string, pin: string): string {
  return createHash("sha256")
    .update(`${userId}:nexus:${pin}`)
    .digest("hex");
}

// ─── Token payload ───────────────────────────────────────────────────────────
export interface TokenPayload {
  sub: string;   // userId
  name: string;
  exp: number;
}

// ─── Sign ─────────────────────────────────────────────────────────────────────
export async function signToken(
  userId: string,
  name: string
): Promise<string> {
  const secret = getSecret();
  return new SignJWT({ name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_TTL_SECONDS}s`)
    .sign(secret);
}

// ─── Verify ───────────────────────────────────────────────────────────────────
export async function verifyToken(
  token: string
): Promise<TokenPayload | null> {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

// ─── Cookie helpers ───────────────────────────────────────────────────────────
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_TTL_SECONDS,
    // secure: only in production
    ...(process.env.NODE_ENV === "production" ? { secure: true } : {}),
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

/** Returns true if the token will expire within the sliding refresh threshold */
export function needsRefresh(payload: TokenPayload): boolean {
  const now = Math.floor(Date.now() / 1000);
  return payload.exp - now < SLIDING_REFRESH_THRESHOLD;
}
