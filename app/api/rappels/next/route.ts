import { NextRequest } from "next/server";
import { exigerAuthentification } from "@/infrastructure/middleware/authentification";
import { serviceRappels } from "@/fonctionnalites/rappels";
import { reponseSucces, reponseErreur } from "@/infrastructure/erreurs/reponse-api";

export async function GET(request: NextRequest) {
  try {
    const utilisateur = exigerAuthentification(request);
    const evenement = await serviceRappels.obtenirProchainEvenement(utilisateur.userId);
    return reponseSucces({ data: evenement || null });
  } catch (erreur: any) {
    return reponseErreur(erreur);
  }
}
