import { NextRequest, NextResponse } from "next/server";
import { exigerAuthentification } from "@/infrastructure/middleware/authentification";
import { serviceRecherche } from "@/fonctionnalites/recherche/recherche.service";
import { reponseSucces, reponseErreur } from "@/infrastructure/erreurs/reponse-api";

export async function GET(request: NextRequest) {
  try {
    exigerAuthentification(request);
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const limite = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : undefined;
    const resultat = await serviceRecherche.rechercher(q, limite);
    return reponseSucces({ ...resultat });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error);
  }
}
