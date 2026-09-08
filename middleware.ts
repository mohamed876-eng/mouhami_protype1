import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/utils/jwt";

export const runtime = "nodejs";

const PUBLIC_ROUTES = ["/login", "/api/authentification/login", "/api/authentification/register", "/api/authentification/refresh", "/api/health"];

function isPublicRoute(pathname: string): boolean {
  if (pathname.startsWith("/images/") || pathname.startsWith("/uploads/")) {
    return true;
  }
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith("/api/authentification/"));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("accessToken")?.value;

  if (!accessToken) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, message: "يرجى تسجيل الدخول أولاً" },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const payload = verifyAccessToken(accessToken);

    const estEspaceClient = pathname === "/client" || pathname.startsWith("/client/");

    if (!estEspaceClient && payload.role !== "admin") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { success: false, message: "Accès non autorisé" },
          { status: 403 }
        );
      }
      const clientUrl = new URL("/client/dashboard", request.url);
      clientUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(clientUrl);
    }

    if (estEspaceClient && payload.role !== "client") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { success: false, message: "Accès non autorisé" },
          { status: 403 }
        );
      }
      const adminUrl = new URL("/dashboard", request.url);
      adminUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(adminUrl);
    }

    const response = NextResponse.next();
    response.headers.set("x-user-id", payload.userId);
    response.headers.set("x-user-email", payload.email);
    response.headers.set("x-user-role", payload.role);
    response.headers.set("x-user-nom", encodeURIComponent(payload.nom));
    response.headers.set("x-user-prenom", encodeURIComponent(payload.prenom));
    return response;
  } catch {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, message: "الجلسة منتهية، يرجى تسجيل الدخول مرة أخرى" },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    return response;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
