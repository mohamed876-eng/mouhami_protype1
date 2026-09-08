import { NextRequest, NextResponse } from "next/server";
import { exigerAuthentification, exigerAdmin } from "@/infrastructure/middleware/authentification";
import { serviceClients } from "@/fonctionnalites/clients/client.service";
import { reponseSucces, reponseErreur } from "@/infrastructure/erreurs/reponse-api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    exigerAuthentification(request);
    const { id } = await params;
    const client = await serviceClients.trouverParId(id);
    return reponseSucces({ client });
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
    const utilisateur = exigerAdmin(request);
    const { id } = await params;
    const body = await request.json();
    const client = await serviceClients.mettreAJour(id, body, utilisateur.userId);
    return reponseSucces({ client });
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
    const utilisateur = exigerAdmin(request);
    const { id } = await params;
    await serviceClients.supprimer(id, utilisateur.userId);
    return reponseSucces({ message: "تم حذف العميل بنجاح" });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error);
  }
}
