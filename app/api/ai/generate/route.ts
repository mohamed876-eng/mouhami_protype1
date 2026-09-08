import { NextRequest, NextResponse } from "next/server";
import { exigerAuthentification } from "@/infrastructure/middleware/authentification";
import { generateurDocument } from "@/ia/moteur-documents/generateur-document";

export async function POST(request: NextRequest) {
  try {
    exigerAuthentification(request);
    const { templateType, fields } = await request.json();

    if (!templateType) {
      return NextResponse.json(
        { success: false, message: "نوع المستند مطلوب" },
        { status: 400 }
      );
    }

    if (!generateurDocument.peutGerer(templateType)) {
      return NextResponse.json(
        { success: false, message: "النموذج غير موجود" },
        { status: 404 }
      );
    }

    const result = await generateurDocument.generer(templateType, fields || {});

    return NextResponse.json({
      success: true,
      result: {
        text: result.apercu,
        docxBase64: result.docxBase64,
        fileName: result.nomFichier,
      },
    });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ" },
      { status: error.statusCode || 500 }
    );
  }
}
