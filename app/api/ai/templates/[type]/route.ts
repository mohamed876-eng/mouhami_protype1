import { NextRequest, NextResponse } from "next/server";
import { exigerAuthentification } from "@/infrastructure/middleware/authentification";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    exigerAuthentification(request);
    const { type } = await params;
    const filePath = path.resolve(process.cwd(), `document_templates/${type}.json`);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, message: "النموذج غير موجود" },
        { status: 404 }
      );
    }
    const content = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return NextResponse.json({ success: true, template: content });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ" },
      { status: error.statusCode || 500 }
    );
  }
}
