import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET() {
  const headersList = await headers();
  const userId = headersList.get("x-user-id");
  const userName = headersList.get("x-user-name");

  if (!userId) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user: { userId, name: userName } });
}
