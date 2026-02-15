import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

interface JwtPayload {
  sub: string;
  email: string;
  role: "ADMIN" | "USER";
  hasProfile?: boolean;
  iat?: number;
  exp?: number;
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const token = req.cookies.get("access_token")?.value;

  console.log("[Middleware] Path:", path, "Has token:", !!token);

  // Public routes - redirect to appropriate dashboard if logged in
  if (path === "/login" || path === "/register") {
    if (token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        const jwtPayload = payload as unknown as JwtPayload;

        if (jwtPayload.role === "ADMIN") {
          return NextResponse.redirect(new URL("/admin/dashboard", req.url));
        }

        if (!jwtPayload.hasProfile) {
          return NextResponse.redirect(new URL("/create/info", req.url));
        }

        return NextResponse.redirect(new URL("/dashboard", req.url));
      } catch (error) {
        console.log("[Middleware] Token verification failed:", error);
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // Protected routes - require authentication
  if (!token) {
    console.log("[Middleware] No token, redirecting to login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const jwtPayload = payload as unknown as JwtPayload;

    console.log(
      "[Middleware] User role:",
      jwtPayload.role,
      "Has profile:",
      jwtPayload.hasProfile,
    );

    // Admin-only routes
    if (path.startsWith("/admin") && jwtPayload.role !== "ADMIN") {
      console.log("[Middleware] Non-admin trying to access admin route");
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Admin trying to access user routes
    if (
      (path.startsWith("/profile") ||
        path.startsWith("/dashboard") ||
        path === "/create/info") &&
      jwtPayload.role === "ADMIN"
    ) {
      console.log("[Middleware] Admin trying to access user route");
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    // User-specific route protection
    if (jwtPayload.role === "USER") {
      // If trying to access /create/info but already has profile
      if (path === "/create/info" && jwtPayload.hasProfile) {
        console.log(
          "[Middleware] User with profile trying to access create/info",
        );
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      // If trying to access /profile without profile (but allow /dashboard and /create/info)
      if (path.startsWith("/profile") && !jwtPayload.hasProfile) {
        console.log(
          "[Middleware] User without profile trying to access profile",
        );
        return NextResponse.redirect(new URL("/create/info", req.url));
      }

      // REMOVED: No longer block /dashboard for users without profile
      // Users can access dashboard regardless of profile status
    }

    console.log("[Middleware] Allowing access to:", path);
    return NextResponse.next();
  } catch (error) {
    console.log("[Middleware] Token verification error:", error);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/create/info",
  ],
};
