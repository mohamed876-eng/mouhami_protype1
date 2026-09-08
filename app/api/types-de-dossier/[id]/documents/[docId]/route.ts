import { NextRequest, NextResponse } from "next/server";
import { exigerAdmin } from "@/infrastructure/middleware/authentification";
import { dossierTypeCasRepository } from "@/fonctionnalites/case-types/type-cas.repository";
import { reponseSucces, reponseErreur } from "@/infrastructure/erreurs/reponse-api";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    exigerAdmin(request);
    const { docId } = await params;
    const body = await request.json();
    const document = await dossierTypeCasRepository.mettreAJourDocument(docId, body);
    return reponseSucces({ document });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    exigerAdmin(request);
    const { docId } = await params;
    await dossierTypeCasRepository.supprimerDocument(docId);
    return reponseSucces({ message: "تم حذف المستند الإلزامي بنجاح" });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error);
  }
}
