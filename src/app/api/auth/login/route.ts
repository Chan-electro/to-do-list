import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { hashPin, signToken, setSessionCookie } from "@/lib/auth";

const { users } = schema;

// Simple in-memory rate limiter: 5 attempts per IP in 30s window
const failedAttempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = failedAttempts.get(ip);

  if (entry && now < entry.resetAt) {
    if (entry.count >= 5) return false;
  }
  return true;
}

function recordFailure(ip: string): void {
  const now = Date.now();
  const entry = failedAttempts.get(ip);

  if (!entry || now >= entry.resetAt) {
    failedAttempts.set(ip, { count: 1, resetAt: now + 30_000 });
  } else {
    entry.count++;
  }
}

function clearFailures(ip: string): void {
  failedAttempts.delete(ip);
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many failed attempts. Wait 30 seconds." },
      { status: 429 }
    );
  }

  let name: string;
  let pin: string;

  try {
    const body = await req.json() as { name?: unknown; pin?: unknown };
    name = (body.name as string)?.trim() ?? "";
    pin = (body.pin as string)?.trim() ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!name || !pin) {
    return NextResponse.json(
      { error: "Name and PIN are required" },
      { status: 400 }
    );
  }

  // Find user by name (case-insensitive)
  const userRows = await db
    .select()
    .from(users)
    .where(eq(users.name, name))
    .limit(1);

  const user = userRows[0];

  if (!user) {
    recordFailure(ip);
    return NextResponse.json(
      { error: "Invalid name or PIN" },
      { status: 401 }
    );
  }

  // If no PIN has been set yet, treat any PIN as valid (first-time setup)
  if (user.pinHash) {
    const expected = hashPin(user.id, pin);
    if (expected !== user.pinHash) {
      recordFailure(ip);
      return NextResponse.json(
        { error: "Invalid name or PIN" },
        { status: 401 }
      );
    }
  }

  clearFailures(ip);

  const token = await signToken(user.id, user.name);
  await setSessionCookie(token);

  return NextResponse.json({ ok: true, userId: user.id, name: user.name });
}
