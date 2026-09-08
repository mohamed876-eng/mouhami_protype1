import { NextRequest, NextResponse } from "next/server";
import { exigerAuthentification, exigerAdmin } from "@/infrastructure/middleware/authentification";
import { serviceDossiers } from "@/fonctionnalites/dossiers";
import { reponseSucces, reponseErreur } from "@/infrastructure/erreurs/reponse-api";

export async function GET(request: NextRequest) {
  try {
    exigerAuthentification(request);
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) : undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;
    const search = searchParams.get("search") || undefined;
    const etat = searchParams.get("etat") || undefined;
    const type = searchParams.get("type") || undefined;
    const clientId = searchParams.get("clientId") || undefined;
    const result = await serviceDossiers.trouverTous({ page, limite: limit, recherche: search, etat, type, clientId });
    const pagination = { page: result.pagination.page, limit: result.pagination.limite, total: result.pagination.total, totalPages: result.pagination.totalPages };
    return reponseSucces({ cases: result.cases, pagination });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = exigerAdmin(request);
    const body = await request.json();
    const cas = await serviceDossiers.creer({ ...body, userId: user.userId });
    return reponseSucces({ case: cas }, 201);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error);
  }
}
