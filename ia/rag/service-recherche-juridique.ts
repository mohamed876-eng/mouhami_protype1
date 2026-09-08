import { moteurRecherche, ResultatRecherche } from "@/ia/rag/moteur-recherche";
import { constructeurPrompt, SourceResultat } from "@/ia/prompts/construction-contexte";
import { fournisseurGemini } from "@/ia/fournisseurs/gemini-provider";

export interface ReferenceArticle {
  numero: string;
  texte: string;
  chapitre: string;
  section: string;
  sousSection: string;
}

export interface SourceSortie {
  nomDocument: string;
  numeroPage: number;
  texte: string;
  articles: ReferenceArticle[];
}

export class ServiceRechercheJuridique {
  rechercherSources(question: string): {
    sources: SourceSortie[];
    promptComplet: string;
  } {
    const resultats = moteurRecherche.rechercher(question, 5);

    if (resultats.length === 0) {
      return { sources: [], promptComplet: "" };
    }

    const fusionnees = ServiceRechercheJuridique.fusionnerChunksParPage(resultats);

    const sources = fusionnees.map((r) => ({
      nomDocument: r.nomDocument,
      numeroPage: r.numeroPage,
      texte: r.texte,
      articles: ServiceRechercheJuridique.extraireArticles(r.texte),
    }));

    const promptSysteme = constructeurPrompt.construirePromptSysteme();
    const promptUtilisateur = constructeurPrompt.construirePromptUtilisateur(
      question,
      fusionnees
    );
    const promptComplet = `${promptSysteme}\n\n${promptUtilisateur}`;

    return { sources, promptComplet };
  }

  async genererReponse(promptComplet: string): Promise<string> {
    try {
      return await fournisseurGemini.genererTexte(promptComplet, {
        temperature: 0.1,
      });
    } catch {
      return "";
    }
  }

  private static extraireArticles(texte: string): ReferenceArticle[] {
    let chapitre = "";
    let section = "";
    let sousSection = "";
    const articles: ReferenceArticle[] = [];

    const lignes = texte.split("\n");
    let articleActuel: { numero: string; texte: string[] } | null = null;

    const viderArticle = () => {
      if (articleActuel) {
        const texteArticle = articleActuel.texte
          .join(" ")
          .replace(/\s+/g, " ")
          .replace(/\s*-\s*\d+\s*-\s*/g, "")
          .trim();
        if (texteArticle.length > 5) {
          articles.push({
            numero: articleActuel.numero,
            texte: texteArticle,
            chapitre,
            section,
            sousSection,
          });
        }
        articleActuel = null;
      }
    };

    for (const ligne of lignes) {
      const trimée = ligne.trim();
      if (!trimée) continue;

      const correspondanceLivre = trimée.match(/^الكتاب\s+(.+)/);
      if (correspondanceLivre) {
        viderArticle();
        section = `الكتاب ${correspondanceLivre[1].trim()}`;
        continue;
      }

      const correspondanceSection = trimée.match(/^القسم\s+(.+)/);
      if (correspondanceSection) {
        viderArticle();
        section = `القسم ${correspondanceSection[1].trim()}`;
        continue;
      }

      const correspondanceChapitre = trimée.match(/^الباب\s+(.+)/);
      if (correspondanceChapitre) {
        viderArticle();
        chapitre = `الباب ${correspondanceChapitre[1].trim()}`;
        continue;
      }

      const correspondanceSousSection = trimée.match(/^الفرع\s+(.+)/);
      if (correspondanceSousSection) {
        viderArticle();
        sousSection = `الفرع ${correspondanceSousSection[1].trim()}`;
        continue;
      }

      const estArticle = /^(?:المادة|الفصل)\s+(\d+[\w\-]*)\s*/.test(trimée);
      if (estArticle) {
        const correspondanceNum = trimée.match(/^(?:المادة|الفصل)\s+(\d+[\w\-]*)/);
        if (!correspondanceNum) continue;
        const reste = trimée.slice(correspondanceNum[0].length).trim();
        if (reste && /^(من|رقم|المادة|الفصل)/.test(reste)) {
          if (articleActuel) articleActuel.texte.push(trimée);
          continue;
        }
        viderArticle();
        articleActuel = { numero: correspondanceNum[1], texte: reste ? [reste] : [] };
        continue;
      }

      if (articleActuel && !trimée.match(/^-\s*\d+\s*-$/)) {
        articleActuel.texte.push(trimée);
      }
    }

    viderArticle();
    return articles;
  }

  private static fusionnerChunksParPage(resultats: ResultatRecherche[]): ResultatRecherche[] {
    const cartePages = new Map<string, ResultatRecherche>();

    for (const r of resultats) {
      const cle = `${r.nomDocument}_p${r.numeroPage}`;
      const existant = cartePages.get(cle);
      if (existant) {
        if (existant.texte.length < r.texte.length) {
          cartePages.set(cle, r);
        }
      } else {
        cartePages.set(cle, r);
      }
    }

    return Array.from(cartePages.values());
  }
}

export const serviceRechercheJuridique = new ServiceRechercheJuridique();
