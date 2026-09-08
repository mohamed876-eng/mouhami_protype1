import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { exigerAuthentification } from "@/infrastructure/middleware/authentification";
import { serviceRechercheJuridique } from "@/ia/rag/service-recherche-juridique";

const MODELE_DEFAUT = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export async function POST(request: NextRequest) {
  try {
    exigerAuthentification(request);
    const { question } = await request.json();
    if (!question || !question.trim()) {
      return NextResponse.json(
        { success: false, error: "يرجى كتابة سؤال للبحث في المكتبة القانونية" },
        { status: 400 }
      );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const { sources, promptComplet } =
            serviceRechercheJuridique.rechercherSources(question.trim());

          if (sources.length === 0) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  sources: [],
                  answer: "لم يتم العثور على أي نص قانوني مطابق داخل قاعدة المعرفة.",
                })}\n\n`
              )
            );
            controller.close();
            return;
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                sources: sources.map((s) => ({
                  documentName: s.nomDocument,
                  pageNumber: s.numeroPage,
                  text: s.texte,
                  articles: s.articles.map((a) => ({
                    number: a.numero,
                    text: a.texte,
                    chapter: a.chapitre,
                    section: a.section,
                    subsection: a.sousSection,
                  })),
                })),
              })}\n\n`
            )
          );

          let fullAnswer = "";
          try {
            const cleApi = process.env.GEMINI_API_KEY;
            if (!cleApi) throw new Error("GEMINI_API_KEY non définie");

            const client = new GoogleGenAI({ apiKey: cleApi });
            const streamRes = await client.models.generateContentStream({
              model: MODELE_DEFAUT,
              contents: promptComplet,
              config: { temperature: 0.1 },
            });

            for await (const chunk of streamRes) {
              const token = chunk.text || "";
              if (token) {
                fullAnswer += token;
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ token })}\n\n`)
                );
              }
            }
          } catch {
            fullAnswer = "تعذر الاتصال بالمساعد.";
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ token: fullAnswer })}\n\n`
              )
            );
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ done: true, answer: fullAnswer })}\n\n`
            )
          );
          controller.close();
        } catch (err: any) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                error: err.message || "حدث خطأ",
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
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
