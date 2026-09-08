import { NextRequest } from "next/server";
import { exigerAuthentification } from "@/infrastructure/middleware/authentification";
import { serviceRappels } from "@/fonctionnalites/rappels";
import { reponseSucces, reponseErreur } from "@/infrastructure/erreurs/reponse-api";

export async function POST(request: NextRequest) {
  try {
    const utilisateur = exigerAuthentification(request);
    const corps = await request.json();
    const evenement = await serviceRappels.creerEvenement(utilisateur.userId, corps);
    return reponseSucces({ data: evenement }, 201);
  } catch (erreur: any) {
    return reponseErreur(erreur);
  }
}
