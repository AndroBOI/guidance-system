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

        return NextResponse.redirect(new URL("/profile/dashboard", req.url));
      } catch (error) {
        console.log("[Middleware] Token verification failed:", error);
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

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

    if (path.startsWith("/admin") && jwtPayload.role !== "ADMIN") {
      console.log("[Middleware] Non-admin trying to access admin route");
      return NextResponse.redirect(new URL("/profile/dashboard", req.url));
    }

    if (
      (path.startsWith("/profile") ||
        path.startsWith("/dashboard") ||
        path === "/create/info") &&
      jwtPayload.role === "ADMIN"
    ) {
      console.log("[Middleware] Admin trying to access user route");
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }


    if (jwtPayload.role === "USER") {
      if (path === "/create/info" && jwtPayload.hasProfile) {
        console.log(
          "[Middleware] User with profile trying to access create/info",
        );
        return NextResponse.redirect(new URL("/profile/dashboard", req.url));
      }

      if (path.startsWith("/profile") && !jwtPayload.hasProfile) {
        console.log(
          "[Middleware] User without profile trying to access profile",
        );
        return NextResponse.redirect(new URL("/create/info", req.url));
      }
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
    "/admin/:path*",
    "/login",
    "/register",
    "/create/info",
  ],
};
