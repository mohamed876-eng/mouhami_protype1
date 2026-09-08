import { GoogleGenAI } from "@google/genai";
import { FournisseurLLM, OptionsGeneration } from "./llm-provider";

const MODELE_DEFAUT = process.env.GEMINI_MODEL || "gemini-2.5-flash";

let clientGemini: GoogleGenAI | null = null;

function obtenirClient(): GoogleGenAI {
  if (!clientGemini) {
    const cleApi = process.env.GEMINI_API_KEY;
    if (!cleApi) {
      throw new Error("GEMINI_API_KEY n'est pas définie dans les variables d'environnement.");
    }
    clientGemini = new GoogleGenAI({ apiKey: cleApi });
  }
  return clientGemini;
}

export class FournisseurGemini implements FournisseurLLM {
  async genererTexte(
    prompt: string,
    options: OptionsGeneration = {}
  ): Promise<string> {
    const client = obtenirClient();
    const modele = options.modele || MODELE_DEFAUT;
    const temperature = options.temperature ?? 0.3;

    try {
      const reponse = await client.models.generateContent({
        model: modele,
        contents: prompt,
        config: {
          temperature,
          ...(options.maxTokens ? { maxOutputTokens: options.maxTokens } : {}),
        },
      });

      return reponse.text || "";
    } catch (erreur: any) {
      if (process.env.NODE_ENV === "development") {
        console.error("[FournisseurGemini] Erreur:", erreur?.message);
      }
      throw erreur;
    }
  }

  async estDisponible(): Promise<boolean> {
    try {
      const cleApi = process.env.GEMINI_API_KEY;
      if (!cleApi) return false;

      const client = obtenirClient();
      await client.models.generateContent({
        model: MODELE_DEFAUT,
        contents: "test",
        config: { maxOutputTokens: 5 },
      });
      return true;
    } catch {
      return false;
    }
  }
}

export const fournisseurGemini = new FournisseurGemini();
