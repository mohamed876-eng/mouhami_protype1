import { NextRequest, NextResponse } from "next/server";
import { exigerAuthentification } from "@/infrastructure/middleware/authentification";
import { prisma } from "@/infrastructure/base-de-donnees/prisma";
import { reponseSucces, reponseErreur } from "@/infrastructure/erreurs/reponse-api";

export async function GET(request: NextRequest) {
  try {
    exigerAuthentification(request);
    const templates = await prisma.caseTemplate.findMany({
      select: { id: true, nom: true },
      orderBy: { nom: "asc" },
    });
    return reponseSucces({ templates });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error);
  }
}
