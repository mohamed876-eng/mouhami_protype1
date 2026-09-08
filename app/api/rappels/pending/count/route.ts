import { NextRequest } from "next/server";
import { exigerAuthentification } from "@/infrastructure/middleware/authentification";
import { serviceRappels } from "@/fonctionnalites/rappels";
import { reponseSucces, reponseErreur } from "@/infrastructure/erreurs/reponse-api";

export async function GET(request: NextRequest) {
  try {
    const utilisateur = exigerAuthentification(request);
    const compteEnAttente = await serviceRappels.obtenirCompteEnAttente(utilisateur.userId);
    return reponseSucces({ data: { count: compteEnAttente } });
  } catch (erreur: any) {
    return reponseErreur(erreur);
  }
}
