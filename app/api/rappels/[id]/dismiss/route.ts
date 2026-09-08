import { NextRequest } from "next/server";
import { exigerAuthentification } from "@/infrastructure/middleware/authentification";
import { serviceRappels } from "@/fonctionnalites/rappels";
import { reponseSucces, reponseErreur } from "@/infrastructure/erreurs/reponse-api";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const utilisateur = exigerAuthentification(request);
    const { id } = await params;
    await serviceRappels.ignorerRappel(utilisateur.userId, id);
    return reponseSucces({ message: "تم إلغاء التذكير" });
  } catch (erreur: any) {
    return reponseErreur(erreur);
  }
}
