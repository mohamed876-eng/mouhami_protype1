import { NextRequest, NextResponse } from "next/server";
import { exigerAuthentification } from "@/infrastructure/middleware/authentification";
import { prisma } from "@/infrastructure/base-de-donnees/prisma";
import { reponseSucces, reponseErreur } from "@/infrastructure/erreurs/reponse-api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    exigerAuthentification(request);
    const { id } = await params;
    const template = await prisma.caseTemplate.findUnique({
      where: { id },
      include: {
        documents: { orderBy: { ordre: "asc" } },
      },
    });
    if (!template) {
      return reponseErreur(new Error("النموذج غير موجود"), 404);
    }
    return reponseSucces({ template });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error);
  }
}
