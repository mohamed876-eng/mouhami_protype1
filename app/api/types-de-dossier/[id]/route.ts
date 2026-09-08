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
    if (!caseType) throw ErreurApi.nonTrouve("Type de dossier");
    return reponseSucces({ caseType });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    exigerAdmin(request);
    const { id } = await params;
    const existing = await dossierTypeCasRepository.trouverParId(id);
    if (!existing) throw ErreurApi.nonTrouve("Type de dossier");
    const body = await request.json();
    const caseType = await dossierTypeCasRepository.mettreAJour(id, body);
    return reponseSucces({ caseType });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    exigerAdmin(request);
    const { id } = await params;
    const existing = await dossierTypeCasRepository.trouverParId(id);
    if (!existing) throw ErreurApi.nonTrouve("Type de dossier");
    await dossierTypeCasRepository.supprimer(id);
    return reponseSucces({ message: "تم حذف نوع القضية بنجاح" });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error);
  }
}
