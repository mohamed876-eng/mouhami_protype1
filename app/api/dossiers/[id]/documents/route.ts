import { NextRequest, NextResponse } from "next/server";
import { exigerAuthentification, exigerAdmin } from "@/infrastructure/middleware/authentification";
import { serviceDocuments, validerRattachementDocument } from "@/fonctionnalites/documents";
import { reponseSucces, reponseErreur } from "@/infrastructure/erreurs/reponse-api";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    exigerAuthentification(request);
    const { id } = await params;
    const documents = await serviceDocuments.trouverParCasId(id);
    return reponseSucces({ documents });
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
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return reponseErreur(
        new Error("يرجى اختيار ملف للرفع"),
        400
      );
    }

    const checklistValue = formData.get("checklistItemId");
    const checklistItemId =
      typeof checklistValue === "string" && checklistValue
        ? checklistValue
        : undefined;
    await validerRattachementDocument(id, checklistItemId);

    const uploadsDir = path.resolve(UPLOAD_DIR);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filePath = path.join(uploadsDir, `${Date.now()}-${file.name}`);
    const arrayBuffer = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(arrayBuffer));

    const doc = await serviceDocuments.telecharger({
      casId: id,
      typeId: (formData.get("typeId") as string) || undefined,
      checklistItemId,
      nom: (formData.get("nom") as string) || file.name,
      description: (formData.get("description") as string) || undefined,
      fileName: file.name,
      filePath,
      fileSize: file.size,
      auteur: `${user.prenom} ${user.nom}`,
      isClientVisible: formData.get("isClientVisible") === "true",
      userId: user.userId,
    });

    return reponseSucces({ document: doc }, 201);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error);
  }
}
