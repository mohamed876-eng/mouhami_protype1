import { NextRequest, NextResponse } from "next/server";
import { exigerAdmin } from "@/infrastructure/middleware/authentification";
import { serviceDossiers } from "@/fonctionnalites/dossiers";
import { reponseSucces, reponseErreur } from "@/infrastructure/erreurs/reponse-api";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const user = exigerAdmin(request);
    const { id, itemId } = await params;
    const { coche } = await request.json();
    const result = await serviceDossiers.basculerChecklist(itemId, coche, user.userId, id);
    return reponseSucces({ progress: result.progression });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error);
  }
}
