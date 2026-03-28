import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "nexus_session";

const PUBLIC_PATHS = ["/login", "/setup"];
const PUBLIC_PREFIXES = ["/api/auth/", "/_next/", "/favicon", "/manifest", "/icons", "/sw.js", "/api/auth/setup"];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  return false;
}

function getSecret(): Uint8Array {
  const raw = process.env.JWT_SECRET ?? "";
  return new TextEncoder().encode(raw);
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow public paths through
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // tRPC API routes — let through (protectedProcedure handles auth there)
  // but still inject headers if token is present
  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    // No token — redirect to login (except for API routes which return 401)
    if (pathname.startsWith("/api/")) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "content-type": "application/json" } }
      );
    }
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret);

    const userId = (payload.sub as string) ?? "";
    const userName = (payload.name as string) ?? "";

    // Inject user identity into request headers for tRPC context
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", userId);
    requestHeaders.set("x-user-name", userName);

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });

    // Sliding expiry: re-sign if token expires within 7 days
    const exp = payload.exp as number;
    const now = Math.floor(Date.now() / 1000);
    const SEVEN_DAYS = 7 * 24 * 60 * 60;

    if (exp - now < SEVEN_DAYS) {
      // Re-sign token
      const { SignJWT } = await import("jose");
      const TTL = 30 * 24 * 60 * 60;
      const newToken = await new SignJWT({ name: userName })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(userId)
        .setIssuedAt()
        .setExpirationTime(`${TTL}s`)
        .sign(secret);

      response.cookies.set(COOKIE_NAME, newToken, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: TTL,
        ...(process.env.NODE_ENV === "production" ? { secure: true } : {}),
      });
    }

    return response;
  } catch {
    // Invalid token — redirect to login
    if (pathname.startsWith("/api/")) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "content-type": "application/json" } }
      );
    }
    const loginUrl = new URL("/login", req.url);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete(COOKIE_NAME);
    return res;
  }
}

export const config = {
  matcher: [
    /*
     * Match all paths except static files
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
