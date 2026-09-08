import { NextRequest, NextResponse } from "next/server";
import { exigerAuthentification, exigerAdmin } from "@/infrastructure/middleware/authentification";
import { serviceDocuments } from "@/fonctionnalites/documents";
import { reponseSucces, reponseErreur } from "@/infrastructure/erreurs/reponse-api";

export async function GET(request: NextRequest) {
  try {
    exigerAuthentification(request);
    const types = await serviceDocuments.trouverTousTypes();
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
    const type = await serviceDocuments.creerType(body);
    return reponseSucces({ type }, 201);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error);
  }
}
