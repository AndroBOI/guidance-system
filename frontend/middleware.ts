import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

interface JwtPayload {
  sub: string;
  email: string;
  role: "ADMIN" | "USER";
  iat?: number;
  exp?: number;
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  console.log("🔍 Middleware checking path:", path);

  const token = req.cookies.get("access_token")?.value;
  console.log("🍪 Token exists:", !!token);

  if (!token) {
    console.log("❌ No token found, redirecting to /login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const jwtPayload = payload as unknown as JwtPayload;

    console.log("✅ Token valid, role:", jwtPayload.role);

    if (path.startsWith("/admin") && jwtPayload.role !== "ADMIN") {
      console.log("🚫 Not admin, blocking access to admin route");
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    console.log("✨ Access granted");
    return NextResponse.next();
  } catch (err) {
    console.error("💥 JWT verification failed:", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: [
    "/profile",
    "/profile/history",
    "/dashboard/:path*",
    "/admin/:path*",
  ],
};
