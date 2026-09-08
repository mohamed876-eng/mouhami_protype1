import { NextRequest, NextResponse } from "next/server";
import { exigerAuthentification, exigerAdmin } from "@/infrastructure/middleware/authentification";
import { serviceDocuments } from "@/fonctionnalites/documents";
import { reponseSucces, reponseErreur } from "@/infrastructure/erreurs/reponse-api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    exigerAuthentification(request);
    const { id } = await params;
    const doc = await serviceDocuments.trouverParId(id);
    return reponseSucces({ document: doc });
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
    const doc = await serviceDocuments.mettreAJour(id, body, user.userId);
    return reponseSucces({ document: doc });
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
    await serviceDocuments.supprimer(id, user.userId);
    return reponseSucces({ message: "تم حذف المستند بنجاح" });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error);
  }
}
