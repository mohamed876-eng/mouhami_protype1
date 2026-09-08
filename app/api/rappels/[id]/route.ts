import { NextRequest } from "next/server";
import { exigerAuthentification } from "@/infrastructure/middleware/authentification";
import { serviceRappels } from "@/fonctionnalites/rappels";
import { reponseSucces, reponseErreur } from "@/infrastructure/erreurs/reponse-api";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const utilisateur = exigerAuthentification(request);
    const { id } = await params;
    const corps = await request.json();
    const evenement = await serviceRappels.mettreAJourEvenement(utilisateur.userId, id, corps);
    return reponseSucces({ data: evenement });
  } catch (erreur: any) {
    return reponseErreur(erreur);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const utilisateur = exigerAuthentification(request);
    const { id } = await params;
    await serviceRappels.supprimerEvenement(utilisateur.userId, id);
    return reponseSucces({ message: "تم حذف الحدث بنجاح" });
  } catch (erreur: any) {
    return reponseErreur(erreur);
  }
}
