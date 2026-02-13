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
  const refreshToken = req.cookies.get("refresh_token")?.value;

  console.log("🍪 Access token exists:", !!token);
  console.log("🍪 Refresh token exists:", !!refreshToken);

  // If no tokens at all, redirect to login
  if (!token && !refreshToken) {
    console.log("❌ No tokens found, redirecting to /login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // If no access token but has refresh token, let it through
  // The client-side axios interceptor will handle the refresh
  if (!token && refreshToken) {
    console.log(
      "⏭️ No access token but has refresh token, letting through for client refresh",
    );
    return NextResponse.next();
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token!, secret);
    const jwtPayload = payload as unknown as JwtPayload;

    console.log("✅ Token valid, role:", jwtPayload.role);

    // Role-based access control
    if (path.startsWith("/admin") && jwtPayload.role !== "ADMIN") {
      console.log("🚫 Not admin, blocking access to admin route");
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (
      (path.startsWith("/profile") || path.startsWith("/dashboard")) &&
      jwtPayload.role !== "USER"
    ) {
      console.log("🚫 Admin trying to access user route, blocking");
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    console.log("✨ Access granted");
    return NextResponse.next();
  } catch (err) {
    const error = err as { code?: string };
    console.error("💥 JWT verification failed:", error.code);

    // ✅ If token is EXPIRED, let it through for client-side refresh
    if (error.code === "ERR_JWT_EXPIRED") {
      console.log("🔄 Token expired, letting through for client-side refresh");
      return NextResponse.next();
    }

    // ❌ For other errors (invalid signature, malformed, etc.), redirect to login
    console.log("❌ Invalid token, redirecting to login");
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/profile/:path*", "/dashboard/:path*", "/admin/:path*"],
};
