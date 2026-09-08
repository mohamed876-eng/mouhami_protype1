import { NextRequest, NextResponse } from "next/server";
import { dossierActiviteRepository } from "@/infrastructure/journalisation/activite.repository";
import { reponseSucces, reponseErreur } from "@/infrastructure/erreurs/reponse-api";
import { exigerAuthentification } from "@/infrastructure/middleware/authentification";

export async function GET(request: NextRequest) {
  try {
    exigerAuthentification(request);
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 20;
    const activities = await dossierActiviteRepository.trouverRecents(limit);
    return reponseSucces({ activities });
  } catch (error: unknown) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error instanceof Error ? error : new Error(String(error)));
  }
}
