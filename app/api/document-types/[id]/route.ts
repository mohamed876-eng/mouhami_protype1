import { NextRequest, NextResponse } from "next/server";
import { exigerAdmin } from "@/infrastructure/middleware/authentification";
import { serviceDocuments } from "@/fonctionnalites/documents";
import { reponseSucces, reponseErreur } from "@/infrastructure/erreurs/reponse-api";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    exigerAdmin(request);
    const { id } = await params;
    const body = await request.json();
    const type = await serviceDocuments.mettreAJourType(id, body);
    return reponseSucces({ type });
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
    await serviceDocuments.supprimerType(id);
    return reponseSucces({ message: "تم حذف النوع بنجاح" });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error);
  }
}
