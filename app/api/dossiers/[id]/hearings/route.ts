import { NextRequest } from "next/server";
import { dossierAudienceRepository } from "@/fonctionnalites/audiences";
import { exigerAuthentification, exigerAdmin } from "@/infrastructure/middleware/authentification";
import { reponseSucces, reponseErreur } from "@/infrastructure/erreurs/reponse-api";
import { dossierActiviteRepository } from "@/infrastructure/journalisation/activite.repository";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    exigerAuthentification(request);
    const { id } = await params;
    const hearings = await dossierAudienceRepository.trouverParCasId(id);
    return reponseSucces({ hearings });
  } catch (error) {
    if (error instanceof Response) return error;
    return reponseErreur(error instanceof Error ? error : new Error(String(error)));
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await exigerAdmin(request);
    const { id } = await params;
    const body = await request.json();
    const hearing = await dossierAudienceRepository.creer({
      casId: id,
      date: new Date(body.date),
      heure: body.heure || undefined,
      type: body.type || undefined,
      tribunal: body.tribunal || undefined,
      salle: body.salle || undefined,
      juge: body.juge || undefined,
      notes: body.notes || undefined,
    });

    await dossierActiviteRepository.creer({
      userId: user.userId,
      action: "creation",
      entite: "hearing",
      entiteId: hearing.id,
      description: `إضافة جلسة : ${new Date(hearing.date).toLocaleDateString("fr-FR")}`,
      casId: id,
    });

    return reponseSucces({ hearing }, 201);
  } catch (error) {
    if (error instanceof Response) return error;
    return reponseErreur(error instanceof Error ? error : new Error(String(error)));
  }
}
