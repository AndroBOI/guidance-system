import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
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
  console.log("Middleware checking path:", path);

  const token = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;

  console.log("Access token exists:", !!token);
  console.log("Refresh token exists:", !!refreshToken);

  if (path === "/login" || path === "/register") {
    if (refreshToken) {
      console.log("has refresh token, redirecting away from auth pages");

      if (token) {
        try {
          const secret = new TextEncoder().encode(process.env.JWT_SECRET);
          const { payload } = await jwtVerify(token, secret);
          const jwtPayload = payload as unknown as JwtPayload;

          const redirectPath =
            jwtPayload.role === "ADMIN" ? "/admin/dashboard" : "/dashboard";
          console.log(`🔄 Redirecting ${jwtPayload.role} to ${redirectPath}`);
          return NextResponse.redirect(new URL(redirectPath, req.url));
        } catch {
          console.log(
            "Token expired but has refresh, redirecting to /dashboard",
          );
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
      } else {
        console.log("🔄 Has refresh token, redirecting to /dashboard");
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }
    console.log("No tokens, allowing access to auth pages");
    return NextResponse.next();
  }

  if (!token && !refreshToken) {
    console.log("No tokens found, redirecting to /login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (!token && refreshToken) {
    console.log(
      "No access token but has refresh token, letting through for client refresh",
    );
    return NextResponse.next();
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token!, secret);
    const jwtPayload = payload as unknown as JwtPayload;

    console.log("Token valid, role:", jwtPayload.role);

    if (path.startsWith("/admin") && jwtPayload.role !== "ADMIN") {
      console.log("Not admin, blocking access to admin route");
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (
      (path.startsWith("/profile") || path.startsWith("/dashboard")) &&
      jwtPayload.role !== "USER"
    ) {
      console.log("Admin trying to access user route, blocking");
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    console.log("Access granted");
    return NextResponse.next();
  } catch (err) {
    const error = err as { code?: string };
    console.error("JWT verification failed:", error.code);

    if (error.code === "ERR_JWT_EXPIRED") {
      console.log("Token expired, letting through for client-side refresh");
      return NextResponse.next();
    }

    console.log("Invalid token, redirecting to login");
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: [
    "/",
    "/profile/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
