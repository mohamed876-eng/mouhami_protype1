import { NextRequest, NextResponse } from "next/server";
import { exigerAuthentification } from "@/infrastructure/middleware/authentification";
import { reponseSucces, reponseErreur } from "@/infrastructure/erreurs/reponse-api";
import { dossierUtilisateurRepository } from "@/fonctionnalites/authentification/authentification.repository";

export async function GET(request: NextRequest) {
  try {
    const user = exigerAuthentification(request);
    const found = await dossierUtilisateurRepository.trouverParId(user.userId);
    if (!found) {
      return NextResponse.json(
        { success: false, message: "المستخدم غير موجود" },
        { status: 404 }
      );
    }
    const { password, refreshToken, ...safeUser } = found;
    return reponseSucces({ user: safeUser });
  } catch (error: unknown) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error as Error);
  }
}
