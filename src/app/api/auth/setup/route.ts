import { NextRequest, NextResponse } from "next/server";
import { count } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { db, schema } from "@/db";
import { hashPin } from "@/lib/auth";

const { users } = schema;

export async function POST(req: NextRequest) {
  // Only allow if no users exist yet
  const rows = await db.select({ count: count() }).from(users);
  const userCount = rows[0]?.count ?? 0;

  if (userCount > 0) {
    return NextResponse.json(
      { error: "Setup already completed. Use the login page." },
      { status: 403 }
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

  if (pin.length < 4 || !/^\d+$/.test(pin)) {
    return NextResponse.json(
      { error: "PIN must be 4+ digits" },
      { status: 400 }
    );
  }

  const id = uuid();
  const pinHash = hashPin(id, pin);
  const now = new Date().toISOString();

  await db.insert(users).values({
    id,
    name,
    pinHash,
    settingsJson: "{}",
    createdAt: now,
  });

  return NextResponse.json({ ok: true, userId: id, name });
}
