import { NextRequest } from "next/server";
import { dossierAudienceRepository } from "@/fonctionnalites/audiences";
import { exigerAdmin } from "@/infrastructure/middleware/authentification";
import { reponseSucces, reponseErreur } from "@/infrastructure/erreurs/reponse-api";
import { dossierActiviteRepository } from "@/infrastructure/journalisation/activite.repository";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await exigerAdmin(request);
    const { id } = await params;
    const body = await request.json();
    const hearing = await dossierAudienceRepository.mettreAJour(id, body);

    await dossierActiviteRepository.creer({
      userId: user.userId,
      action: "modification",
      entite: "hearing",
      entiteId: hearing.id,
      description: `تعديل الجلسة`,
      casId: hearing.casId,
    });

    return reponseSucces({ hearing });
  } catch (error) {
    if (error instanceof Response) return error;
    return reponseErreur(error instanceof Error ? error : new Error(String(error)));
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await exigerAdmin(request);
    const { id } = await params;
    const hearing = await dossierAudienceRepository.trouverParId(id);
    if (!hearing) {
      return reponseErreur(new Error("الجلسة غير موجودة"), 404);
    }

    await dossierAudienceRepository.supprimer(id);

    await dossierActiviteRepository.creer({
      userId: user.userId,
      action: "suppression",
      entite: "hearing",
      entiteId: id,
      description: `حذف جلسة`,
      casId: hearing.casId,
    });

    return reponseSucces({ message: "تم حذف الجلسة بنجاح" });
  } catch (error) {
    if (error instanceof Response) return error;
    return reponseErreur(error instanceof Error ? error : new Error(String(error)));
  }
}
