import { NextRequest, NextResponse } from "next/server";
import { exigerAdmin } from "@/infrastructure/middleware/authentification";
import { prisma } from "@/infrastructure/base-de-donnees/prisma";
import { reponseSucces, reponseErreur } from "@/infrastructure/erreurs/reponse-api";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    exigerAdmin(request);
    const { id } = await params;
    await prisma.payment.delete({ where: { id } });
    return reponseSucces({ message: "تم حذف الدفعة بنجاح" });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error);
  }
}
