import { NextRequest, NextResponse } from "next/server";
import { dossierActiviteRepository } from "@/infrastructure/journalisation/activite.repository";
import { reponseSucces, reponseErreur } from "@/infrastructure/erreurs/reponse-api";
import { exigerAuthentification } from "@/infrastructure/middleware/authentification";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ casId: string }> }
) {
  try {
    exigerAuthentification(request);
    const { casId } = await params;
    const activities = await dossierActiviteRepository.trouverParCasId(casId);
    return reponseSucces({ activities });
  } catch (error: unknown) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error instanceof Error ? error : new Error(String(error)));
  }
}
