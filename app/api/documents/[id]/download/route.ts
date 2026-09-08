import { NextRequest, NextResponse } from "next/server";
import { exigerAuthentification } from "@/infrastructure/middleware/authentification";
import { serviceDocuments } from "@/fonctionnalites/documents";
import { reponseErreur } from "@/infrastructure/erreurs/reponse-api";
import path from "path";
import fs from "fs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    exigerAuthentification(request);
    const { id } = await params;
    const doc = await serviceDocuments.trouverParId(id);
    const filePath = path.resolve(doc.filePath);

    if (!fs.existsSync(filePath)) {
      return reponseErreur(new Error("الملف غير موجود على الخادم"), 404);
    }

    const fileBuffer = fs.readFileSync(filePath);
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${doc.fileName}"`,
      },
    });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error);
  }
}
