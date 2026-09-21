import { NextRequest, NextResponse } from "next/server";
import { exigerAuthentification } from "@/infrastructure/middleware/authentification";
import { serviceRechercheJuridique } from "@/ia/rag/service-recherche-juridique";
import {
  fournisseurGemini,
  MODELE_DEFAUT,
} from "@/ia/fournisseurs/gemini-provider";

// Heartbeat SSE : maintient la connexion vivante et rassure le client pendant
// la phase de « réflexion » du modèle (le premier token peut prendre ~20-30 s).
const INTERVAL_HEARTBEAT_MS = 15000;

/** Traduit l'erreur du fournisseur en message utilisateur arabe. */
function traduireErreurIA(erreur: any): string {
  const code = erreur?.code ?? 0;
  const retardable = !!erreur?.retardable;

  // 429 = quota / rate-limit, 8 = RESOURCE_EXHAUSTED (gRPC)
  if (code === 429 || code === 8) {
    return "عدد كبير من الاستفسارات في وقت قصير. انتظر قليلاً ثم أعد المحاولة.";
  }
  // Erreurs transitoires (5xx, timeout, serveur saturé) : réessayable
  if (retardable) {
    return "تعذر الاتصال بالمساعد حالياً. أعد المحاولة بعد لحظات.";
  }
  // Clé/modèle invalide ou erreur inconnue : problème de configuration
  return "مشكلة في خدمة الذكاء الاصطناعي، يرجى المحاولة لاحقاً.";
}

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
        let heartbeat: ReturnType<typeof setInterval> | null = null;
        const armerHeartbeat = () => {
          heartbeat = setInterval(() => {
            try {
              controller.enqueue(encoder.encode(`: ping\n\n`));
            } catch {
              // flux déjà fermé
            }
          }, INTERVAL_HEARTBEAT_MS);
        };
        const couperHeartbeat = () => {
          if (heartbeat) clearInterval(heartbeat);
          heartbeat = null;
        };

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
            armerHeartbeat();
            for await (const token of fournisseurGemini.genererEnStream(
              promptComplet,
              { temperature: 0.1, modele: MODELE_DEFAUT }
            )) {
              if (token) {
                fullAnswer += token;
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ token })}\n\n`)
                );
              }
            }
            couperHeartbeat();
          } catch (erreurAI: any) {
            couperHeartbeat();
            if (process.env.NODE_ENV === "development") {
              console.error("[legal-search] Erreur IA:", erreurAI?.message);
            }
            fullAnswer = traduireErreurIA(erreurAI);
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ token: fullAnswer, iaError: true })}\n\n`
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
          couperHeartbeat();
          if (process.env.NODE_ENV === "development") {
            console.error("[legal-search] Erreur flux:", err?.message);
          }
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