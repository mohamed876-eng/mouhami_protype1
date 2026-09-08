import { NextRequest, NextResponse } from "next/server";
import { exigerAuthentification, exigerAdmin } from "@/infrastructure/middleware/authentification";
import { dossierTypeCasRepository } from "@/fonctionnalites/case-types/type-cas.repository";
import { reponseSucces, reponseErreur } from "@/infrastructure/erreurs/reponse-api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    exigerAuthentification(request);
    const { id } = await params;
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
    const body = await request.json();
    const document = await dossierTypeCasRepository.ajouterDocument({ caseTypeId: id, ...body });
    return reponseSucces({ document }, 201);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error);
  }
}
