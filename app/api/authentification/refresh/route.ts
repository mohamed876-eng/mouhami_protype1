import { NextRequest, NextResponse } from "next/server";
import { serviceAuthentification } from "@/fonctionnalites/authentification/authentification.service";
import { reponseSucces, reponseErreur } from "@/infrastructure/erreurs/reponse-api";

export async function POST(request: NextRequest) {
  try {
    let refreshToken: string | undefined;
    try {
      const body = await request.json();
      refreshToken = body.refreshToken;
    } catch {}
    const token = refreshToken || request.cookies.get("refreshToken")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "رمز التحديث مطلوب" },
        { status: 400 }
      );
    }
    const result = await serviceAuthentification.rafraichir(token);

    const accessToken = result.jetonAcces;
    const newRefreshToken = result.jetonRafraichissement;

    const response = reponseSucces({ accessToken, refreshToken: newRefreshToken });

    const isProd = process.env.NODE_ENV === "production";

    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 15 * 60,
      path: "/",
    });

    response.cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error as Error);
  }
}
