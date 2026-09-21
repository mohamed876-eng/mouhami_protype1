import { GoogleGenAI } from "@google/genai";
import { FournisseurLLM, OptionsGeneration } from "./llm-provider";

// Modèle unique pour toute l'application : vient du .env (GEMINI_MODEL) et sert
// de référence partout (réponses + streaming). Exporté pour que les routes ne
// définissent pas un second fallback divergent.
export const MODELE_DEFAUT = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// Budget de réflexion réduit sur les modèles "thinking" (2.5) : accélère le
// premier token tout en gardant une réponse raisonnée. 0 désactiverait la
// réflexion ; 512 est un compromis vitesse/qualité.
const BUDGET_REFLEXION = 512;

// Quota de tokens de sortie borné : évite des générations sans fin.
const MAX_TOKENS_PAR_DEFAUT = 1500;

// Appel Gemini bloquant (génération complète) : timeout global.
const TIMEOUT_GENERATION_MS = 60_000;

// Streaming : 30 s sans aucune arrivée de chunk = considéré comme bloqué.
const TIMEOUT_STALL_STREAM_MS = 30_000;

// Retry : 3 tentatives max, backoff exponentiel 0,5s → 1s → 2s.
const MAX_TENTATIVES = 3;
const BASE_ATTENTE_MS = 500;

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

function attendre(ms: number): Promise<void> {
  return new Promise((resoudre) => setTimeout(resoudre, ms));
}

/** Le modèle est « raisonneur » (gemini-2.x) : on peut lui fixer un budget de réflexion. */
function supporteReflexion(modele: string): boolean {
  return /(^|-)2\.5/.test(modele) || /thinking/i.test(modele);
}

/**
 * Erreurs transitoires (à retenter) : 429 quota/rate-limit, 5xx temporaires,
 * timeouts (grpc 4 / DEADLINE_EXCEEDED), resource exhausted (grpc 8).
 * Le reste (4xx clé/modèle, etc.) est définitif : pas de retry.
 */
function estErreurRetardable(erreur: any): boolean {
  const code = erreur?.status ?? erreur?.code ?? 0;
  const message = String(erreur?.message || "").toLowerCase();
  if (code === 429) return true;
  if (code >= 500 && code < 600) return true;
  if (erreur?.details?.[0]?.reason === "RATE_LIMITED") return true;
  if (erreur?.type === "rate_limit_error") return true;
  if (
    /(?:429|resource.?exhausted|rate.?limit|deadline.?exceeded|unavailable|internal|server|timeout|busy|temporar)/i.test(
      message
    )
  ) {
    return true;
  }
  // Codes gRPC équivalents : 4 deadline, 8 resource exhausted, 14 unavailable, 13 internal.
  if ([4, 8, 13, 14].includes(Number(code))) return true;

  // Panne réseau transitoire (fetch failed, DNS, socket…) : code 0, toujours
  // à retenter — une simple coupure ne doit pas faire échouer la requête.
  return (
    code === 0 &&
    /(?:fetch|econnreset|econnrefused|enetunreach|socket|network|temporary)/i.test(
      message
    )
  );
}

/** Code HTTP/gRPC stable pour que les routes puissent traduire le message. */
function extraireCodeErreur(erreur: any): number {
  return erreur?.status ?? erreur?.code ?? 0;
}

/**
 * Transforme l'erreur interne en une erreur lisible, portant :
 *   - `code`   : HTTP/gRPC exploitable par la route (429, 500, 0 = inconnu)
 *   - `retardable` : vrai si un nouvel essai plus tard pourrait réussir
 *   - `message` détaillé pour le debug.
 */
function creerErreurLisible(erreur: any): Error {
  const erreurFinale: any = new Error(
    erreur?.message ||
      (extraireCodeErreur(erreur) === 429
        ? "Quota Gemini dépassé"
        : "Erreur inconnue de l'API Gemini")
  );
  erreurFinale.code = extraireCodeErreur(erreur) || 0;
  erreurFinale.retardable = estErreurRetardable(erreur);
  erreurFinale.cause = erreur;
  return erreurFinale;
}

/** Config partagée génération + streaming: température, réflexion réduite, quota borné. */
function construireConfig(options: OptionsGeneration, modele: string) {
  return {
    temperature: options.temperature ?? 0.3,
    ...(options.maxTokens
      ? { maxOutputTokens: options.maxTokens }
      : { maxOutputTokens: MAX_TOKENS_PAR_DEFAUT }),
    ...(supporteReflexion(modele) ? { thinkingConfig: { thinkingBudget: BUDGET_REFLEXION } } : {}),
  };
}

export class FournisseurGemini implements FournisseurLLM {
  async genererTexte(
    prompt: string,
    options: OptionsGeneration = {}
  ): Promise<string> {
    const client = obtenirClient();
    const modele = options.modele || MODELE_DEFAUT;
    const config = construireConfig(options, modele);

    let derniereErreur: any;
    for (let essai = 1; essai <= MAX_TENTATIVES; essai++) {
      const controleur = new AbortController();
      const temporisateur = setTimeout(
        () => controleur.abort(),
        TIMEOUT_GENERATION_MS
      );

      try {
        const reponse = await client.models.generateContent({
          model: modele,
          contents: prompt,
          config: {
            ...config,
            abortSignal: controleur.signal,
            httpOptions: { timeout: TIMEOUT_GENERATION_MS },
          },
        });
        clearTimeout(temporisateur);
        return reponse.text || "";
      } catch (erreur: any) {
        clearTimeout(temporisateur);
        if (
          erreur?.name === "AbortError" ||
          /aborted|deadline/i.test(String(erreur?.message || ""))
        ) {
          erreur = { message: "Génération Gemini en timeout", status: 4 };
        }
        derniereErreur = erreur;

        if (essai < MAX_TENTATIVES && estErreurRetardable(erreur)) {
          await attendre(BASE_ATTENTE_MS * 2 ** (essai - 1));
          continue;
        }
        break;
      }
    }

    throw creerErreurLisible(derniereErreur);
  }

  /**
   * Streaming de tokens avec les mêmes garanties (retry/timeout).
   * On ne retente que si AUCUN token n'a encore été émis (échec au premier
   * token) ; en milieu de flux on propage l'erreur pour ne pas dupliquer.
   */
  async *genererEnStream(
    prompt: string,
    options: OptionsGeneration = {}
  ): AsyncGenerator<string> {
    const modele = options.modele || MODELE_DEFAUT;
    const config = construireConfig(options, modele);

    let derniereErreur: any;
    for (let essai = 1; essai <= MAX_TENTATIVES; essai++) {
      const controleur = new AbortController();
      let temporisateur: ReturnType<typeof setTimeout> | null = null;
      let tokensEmis = false;
      const armerTemporisateur = () => {
        temporisateur = setTimeout(
          () => controleur.abort(),
          TIMEOUT_STALL_STREAM_MS
        );
      };
      const desarmerTemporisateur = () => {
        if (temporisateur) clearTimeout(temporisateur);
        temporisateur = null;
      };

      try {
        const client = obtenirClient();
        const flux = await client.models.generateContentStream({
          model: modele,
          contents: prompt,
          config: {
            ...config,
            abortSignal: controleur.signal,
            httpOptions: { timeout: TIMEOUT_GENERATION_MS },
          },
        });

        armerTemporisateur();
        for await (const chunk of flux) {
          desarmerTemporisateur();
          const token = chunk.text || "";
          if (token) {
            tokensEmis = true;
            yield token;
          }
          armerTemporisateur();
        }
        desarmerTemporisateur();
        return;
      } catch (erreur: any) {
        desarmerTemporisateur();
        if (erreur?.name === "AbortError") {
          erreur = { message: "Stream Gemini en timeout", status: 4 };
        }
        derniereErreur = erreur;

        if (essai < MAX_TENTATIVES && !tokensEmis && estErreurRetardable(erreur)) {
          await attendre(BASE_ATTENTE_MS * 2 ** (essai - 1));
          continue;
        }
        throw creerErreurLisible(erreur);
      }
    }

    throw creerErreurLisible(derniereErreur);
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