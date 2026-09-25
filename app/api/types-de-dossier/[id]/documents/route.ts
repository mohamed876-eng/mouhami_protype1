import { NextRequest, NextResponse } from "next/server";
import { exigerAuthentification, exigerAdmin } from "@/infrastructure/middleware/authentification";
import { dossierTypeCasRepository } from "@/fonctionnalites/case-types/type-cas.repository";
import { reponseSucces, reponseErreur } from "@/infrastructure/erreurs/reponse-api";
import { ErreurApi } from "@/infrastructure/erreurs/erreur-api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    exigerAuthentification(request);
    const { id } = await params;
    const caseType = await dossierTypeCasRepository.trouverParId(id);
    if (!caseType) throw ErreurApi.nonTrouve("نوع القضية");
    const documents = await dossierTypeCasRepository.trouverDocuments(id);
    return reponseSucces({ documents });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    exigerAdmin(request);
    const { id } = await params;
    const caseType = await dossierTypeCasRepository.trouverParId(id);
    if (!caseType) throw ErreurApi.nonTrouve("نوع القضية");

    const body = await request.json();
    if (typeof body.nameAr !== "string" || !body.nameAr.trim()) {
      throw ErreurApi.donneesInvalides("اسم المستند مطلوب");
    }
    if (body.order !== undefined && (!Number.isInteger(body.order) || body.order < 0)) {
      throw ErreurApi.donneesInvalides("ترتيب المستند غير صالح");
    }

    const document = await dossierTypeCasRepository.ajouterDocument({
      caseTypeId: id,
      nameAr: body.nameAr.trim(),
      description: typeof body.description === "string" ? body.description.trim() || undefined : undefined,
      isRequired: typeof body.isRequired === "boolean" ? body.isRequired : true,
      order: body.order,
    });
    return reponseSucces({ document }, 201);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error);
  }
}
