import { NextRequest } from "next/server";
import { exigerAuthentification } from "@/infrastructure/middleware/authentification";
import { serviceRappels } from "@/fonctionnalites/rappels";
import { reponseSucces, reponseErreur } from "@/infrastructure/erreurs/reponse-api";

export async function GET(request: NextRequest) {
  try {
    const utilisateur = exigerAuthentification(request);
    const evenements = await serviceRappels.obtenirEvenementsAujourdhui(utilisateur.userId);
    return reponseSucces({ data: evenements });
  } catch (erreur: any) {
    return reponseErreur(erreur);
  }
}
