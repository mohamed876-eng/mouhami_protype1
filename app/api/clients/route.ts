import { NextRequest, NextResponse } from "next/server";
import { exigerAuthentification, exigerAdmin } from "@/infrastructure/middleware/authentification";
import { serviceClients } from "@/fonctionnalites/clients/client.service";
import { reponseSucces, reponseErreur } from "@/infrastructure/erreurs/reponse-api";

export async function GET(request: NextRequest) {
  try {
    exigerAuthentification(request);
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) : undefined;
    const limite = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;
    const recherche = searchParams.get("search") || undefined;
    const resultat = await serviceClients.trouverTous({ page, limite, recherche });
    return reponseSucces({
      clients: resultat.clients,
      pagination: { page: resultat.pagination.page, limit: resultat.pagination.limite, total: resultat.pagination.total, totalPages: resultat.pagination.totalPages },
    });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const utilisateur = exigerAdmin(request);
    const body = await request.json();
    const client = await serviceClients.creer({ ...body, userId: utilisateur.userId });
    return reponseSucces({ client }, 201);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error);
  }
}
