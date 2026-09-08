import { NextRequest } from "next/server";
import { dossierAudienceRepository } from "@/fonctionnalites/audiences";
import { exigerAuthentification } from "@/infrastructure/middleware/authentification";
import { reponseSucces, reponseErreur } from "@/infrastructure/erreurs/reponse-api";

export async function GET(request: NextRequest) {
  try {
    exigerAuthentification(request);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const hearings = await dossierAudienceRepository.trouverTous({
      skip: (page - 1) * limit,
      take: limit,
    });
    return reponseSucces({ hearings });
  } catch (error) {
    if (error instanceof Response) return error;
    return reponseErreur(error instanceof Error ? error : new Error(String(error)));
  }
}
