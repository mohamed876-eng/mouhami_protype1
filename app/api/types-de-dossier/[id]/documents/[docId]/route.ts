import { NextRequest, NextResponse } from "next/server";
import { exigerAdmin } from "@/infrastructure/middleware/authentification";
import { dossierTypeCasRepository } from "@/fonctionnalites/case-types/type-cas.repository";
import { reponseSucces, reponseErreur } from "@/infrastructure/erreurs/reponse-api";
import { ErreurApi } from "@/infrastructure/erreurs/erreur-api";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    exigerAdmin(request);
    const { id, docId } = await params;
    const existing = await dossierTypeCasRepository.trouverDocumentParId(docId, id);
    if (!existing) {
      throw ErreurApi.nonTrouve("مستند نوع القضية");
    }
    const body = await request.json();
    const donnees: {
      nameAr?: string;
      description?: string | null;
      isRequired?: boolean;
      order?: number;
    } = {};

    if (body.nameAr !== undefined) {
      if (typeof body.nameAr !== "string" || !body.nameAr.trim()) {
        throw ErreurApi.donneesInvalides("اسم المستند مطلوب");
      }
      donnees.nameAr = body.nameAr.trim();
    }
    if (body.description !== undefined) {
      donnees.description = typeof body.description === "string" ? body.description.trim() || null : null;
    }
    if (body.isRequired !== undefined) {
      if (typeof body.isRequired !== "boolean") {
        throw ErreurApi.donneesInvalides("حالة الإلزام غير صالحة");
      }
      donnees.isRequired = body.isRequired;
    }
    if (body.order !== undefined) {
      if (!Number.isInteger(body.order) || body.order < 0) {
        throw ErreurApi.donneesInvalides("ترتيب المستند غير صالح");
      }
      donnees.order = body.order;
    }
    if (Object.keys(donnees).length === 0) {
      throw ErreurApi.donneesInvalides("لا توجد بيانات لتحديث المستند");
    }

    const document = await dossierTypeCasRepository.mettreAJourDocument(docId, donnees);
    return reponseSucces({ document });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    exigerAdmin(request);
    const { id, docId } = await params;
    const existing = await dossierTypeCasRepository.trouverDocumentParId(docId, id);
    if (!existing) {
      throw ErreurApi.nonTrouve("مستند نوع القضية");
    }
    await dossierTypeCasRepository.supprimerDocument(docId);
    return reponseSucces({ message: "تم حذف المستند بنجاح" });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error);
  }
}
