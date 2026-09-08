import { NextRequest, NextResponse } from "next/server";
import { exigerAuthentification, exigerAdmin } from "@/infrastructure/middleware/authentification";
import { dossierTypeCasRepository } from "@/fonctionnalites/case-types/type-cas.repository";
import { reponseSucces, reponseErreur } from "@/infrastructure/erreurs/reponse-api";

export async function GET(request: NextRequest) {
  try {
    exigerAuthentification(request);
    const { searchParams } = new URL(request.url);
    const seulementActifs = searchParams.get("active") === "true";
    const types = await dossierTypeCasRepository.trouverTous({ seulementActifs });
    return reponseSucces({ types });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    exigerAdmin(request);
    const body = await request.json();
    const caseType = await dossierTypeCasRepository.creer(body);
    return reponseSucces({ caseType }, 201);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error);
  }
}
