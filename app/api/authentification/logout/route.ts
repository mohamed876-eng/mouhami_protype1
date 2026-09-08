import { NextRequest, NextResponse } from "next/server";
import { serviceAuthentification } from "@/fonctionnalites/authentification/authentification.service";
import { exigerAuthentification } from "@/infrastructure/middleware/authentification";
import { reponseSucces, reponseErreur } from "@/infrastructure/erreurs/reponse-api";

export async function POST(request: NextRequest) {
  try {
    const user = exigerAuthentification(request);
    await serviceAuthentification.deconnexion(user.userId);

    const response = reponseSucces({ message: "تم تسجيل الخروج بنجاح" });

    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    response.cookies.delete("user");

    return response;
  } catch (error: unknown) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error as Error);
  }
}
