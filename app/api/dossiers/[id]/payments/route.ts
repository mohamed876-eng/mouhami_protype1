import { NextRequest, NextResponse } from "next/server";
import { exigerAuthentification, exigerAdmin } from "@/infrastructure/middleware/authentification";
import { prisma } from "@/infrastructure/base-de-donnees/prisma";
import { dossierActiviteRepository } from "@/infrastructure/journalisation/activite.repository";
import { reponseSucces, reponseErreur } from "@/infrastructure/erreurs/reponse-api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    exigerAuthentification(request);
    const { id } = await params;
    const payments = await prisma.payment.findMany({
      where: { casId: id },
      orderBy: { date: "desc" },
    });
    return reponseSucces({ payments });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = exigerAdmin(request);
    const { id } = await params;
    const body = await request.json();
    const payment = await prisma.payment.create({
      data: {
        casId: id,
        montant: parseFloat(body.montant),
        date: new Date(body.date),
        mode: body.mode,
        reference: body.reference || undefined,
        notes: body.notes || undefined,
      },
    });

    await dossierActiviteRepository.creer({
      userId: user.userId,
      action: "creation",
      entite: "payment",
      entiteId: payment.id,
      description: `إضافة دفعة : ${payment.montant} درهم`,
      casId: id,
    });

    return reponseSucces({ payment }, 201);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error);
  }
}
