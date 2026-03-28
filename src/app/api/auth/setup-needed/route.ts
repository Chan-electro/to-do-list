import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { count } from "drizzle-orm";

export async function GET() {
  const rows = await db
    .select({ count: count() })
    .from(schema.users);

  const userCount = rows[0]?.count ?? 0;
  return NextResponse.json({ needed: userCount === 0 });
}
