import { NextRequest, NextResponse } from "next/server";
import { exigerAuthentification } from "@/infrastructure/middleware/authentification";
import { serviceClients } from "@/fonctionnalites/clients/client.service";
import { reponseSucces, reponseErreur } from "@/infrastructure/erreurs/reponse-api";

export async function GET(request: NextRequest) {
  try {
    const utilisateur = exigerAuthentification(request);
    const client = await serviceClients.trouverParUserId(utilisateur.userId);
    return reponseSucces({ client });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const utilisateur = exigerAuthentification(request);
    const body = await request.json();
    const existant = await serviceClients.trouverParUserId(utilisateur.userId);
    const client = await serviceClients.mettreAJourPropre(
      existant.id,
      { telephone: body.telephone, adresse: body.adresse, ville: body.ville },
      utilisateur.userId
    );
    return reponseSucces({ client });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error);
  }
}
