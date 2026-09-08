import { NextRequest, NextResponse } from "next/server";
import { exigerAuthentification, exigerAdmin } from "@/infrastructure/middleware/authentification";
import { serviceDossiers } from "@/fonctionnalites/dossiers";
import { reponseSucces, reponseErreur } from "@/infrastructure/erreurs/reponse-api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    exigerAuthentification(request);
    const { id } = await params;
    const cas = await serviceDossiers.trouverParId(id);
    return reponseSucces({ case: cas });
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
    const user = exigerAdmin(request);
    const { id } = await params;
    const body = await request.json();
    const cas = await serviceDossiers.mettreAJour(id, body, user.userId);
    return reponseSucces({ case: cas });
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
    const user = exigerAdmin(request);
    const { id } = await params;
    await serviceDossiers.supprimer(id, user.userId);
    return reponseSucces({ message: "تم حذف الملف بنجاح" });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error);
  }
}
