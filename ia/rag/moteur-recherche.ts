import fs from "fs";
import path from "path";

interface EntreeChunk {
  id: string;
  texte: string;
  nomDocument: string;
  numeroPage: number;
  indexChunk: number;
}

interface IndexInverse {
  [mot: string]: string[];
}

const REPERTOIRE_STOCKAGE = path.resolve(process.cwd(), "ai_data/legal_search");

const MOTS_ARRETS = new Set([
  "ما", "هو", "هي", "هم", "هن", "انا", "نحن", "انتم",
  "هل", "ماذا", "كيف", "لماذا", "اين", "متى", "كم",
  "في", "من", "الى", "على", "عن", "مع", "بين", "لدى", "حتى", "دون", "غير",
  "و", "ف", "ثم", "او", "لكن", "لان", "حيث", "بينما",
  "قد", "ان", "لن", "لم", "لا",
  "هذا", "هذه", "ذلك", "تلك",
  "كان", "كانت", "ليس",
  "كل", "بعض", "نعم",
  "له", "لها", "لهم", "علي", "عليه", "عليها",
  "اذا", "اي",
  "اعطيني", "اعطنا", "اريد", "نريد", "ابحث", "بحث", "ممكن",
]);

export interface ResultatRecherche {
  texte: string;
  nomDocument: string;
  numeroPage: number;
  score: number;
}

export class MoteurRechercheVectorielle {
  private cheminCollection: string;
  private cheminIndex: string;

  constructor() {
    if (!fs.existsSync(REPERTOIRE_STOCKAGE)) {
      fs.mkdirSync(REPERTOIRE_STOCKAGE, { recursive: true });
    }
    this.cheminCollection = path.join(REPERTOIRE_STOCKAGE, "library.json");
    this.cheminIndex = path.join(REPERTOIRE_STOCKAGE, "index.json");
  }

  ajouterChunk(
    id: string,
    texte: string,
    nomDocument: string,
    numeroPage: number,
    indexChunk: number
  ): void {
    const entrees = this.chargerTout();
    const indexExistant = entrees.findIndex((e) => e.id === id);
    const entree: EntreeChunk = {
      id,
      texte,
      nomDocument,
      numeroPage,
      indexChunk,
    };

    if (indexExistant >= 0) {
      const ancienTexte = entrees[indexExistant].texte;
      this.supprimerDeIndex(ancienTexte, id);
      entrees[indexExistant] = entree;
    } else {
      entrees.push(entree);
    }

    this.ajouterAIndex(texte, id);
    this.sauvegarderTout(entrees);
    this.sauvegarderIndex();
  }

  rechercher(requete: string, topK: number = 5): ResultatRecherche[] {
    const motsRequete = this.tokeniser(requete);
    if (motsRequete.length === 0) return [];

    const index = this.chargerIndex();
    const entrees = this.chargerTout();
    const nombreDocs = entrees.length;
    const cartesEntrees = new Map(entrees.map((e) => [e.id, e]));

    const scoresBruts: Map<string, number> = new Map();

    for (const mot of motsRequete) {
      const variantes = this.developperMot(mot);
      let maxIdf = 0;
      const morceauxCorrespondants = new Map<string, number>();

      for (const v of variantes) {
        const indexMot = index[v] || [];
        const idf =
          nombreDocs > 0
            ? Math.log((nombreDocs + 1) / (indexMot.length + 1)) + 1
            : 1;
        if (idf > maxIdf) maxIdf = idf;

        for (const chunkId of indexMot) {
          const tf = this.frequenceTerme(
            cartesEntrees.get(chunkId)?.texte || "",
            mot
          );
          if (tf === 0) continue;
          const existant = morceauxCorrespondants.get(chunkId) || 0;
          if (idf * tf > existant) {
            morceauxCorrespondants.set(chunkId, idf * tf);
          }
        }
      }

      for (const [chunkId, score] of morceauxCorrespondants) {
        scoresBruts.set(chunkId, (scoresBruts.get(chunkId) || 0) + score);
      }
    }

    if (scoresBruts.size === 0) return [];

    const tries = Array.from(scoresBruts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topK);

    const maxIdf = Math.log((nombreDocs + 1) / 1) + 1;
    const scoreMaxPossible = motsRequete.length * maxIdf * 10;

    return tries.map(([id, score]) => {
      const entree = cartesEntrees.get(id)!;
      return {
        texte: entree.texte,
        nomDocument: entree.nomDocument,
        numeroPage: entree.numeroPage,
        score: scoreMaxPossible > 0 ? score / scoreMaxPossible : 0,
      };
    });
  }

  private frequenceTerme(texte: string, mot: string): number {
    const normalise = this.normaliserArabe(texte.toLowerCase());
    const variantes = this.developperMot(mot);
    let compteur = 0;
    const maxTf = 20;
    for (const v of variantes) {
      let pos = 0;
      while ((pos = normalise.indexOf(v, pos)) !== -1 && compteur < maxTf) {
        compteur++;
        pos += v.length;
      }
    }
    return compteur > 0 ? 1 + Math.log2(compteur) : 0;
  }

  nombreChunks(): number {
    return this.chargerTout().length;
  }

  vider(): void {
    if (fs.existsSync(this.cheminCollection)) fs.unlinkSync(this.cheminCollection);
    if (fs.existsSync(this.cheminIndex)) fs.unlinkSync(this.cheminIndex);
  }

  documentsIndexes(): string[] {
    const entrees = this.chargerTout();
    const docs = new Set(entrees.map((e) => e.nomDocument));
    return Array.from(docs);
  }

  tousLesChunks(): EntreeChunk[] {
    return this.chargerTout();
  }

  supprimerChunk(id: string): void {
    const entrees = this.chargerTout();
    const entree = entrees.find((e) => e.id === id);
    if (entree) {
      this.supprimerDeIndex(entree.texte, id);
      this.sauvegarderIndex();
    }
    this.sauvegarderTout(entrees.filter((e) => e.id !== id));
  }

  private tokeniser(texte: string): string[] {
    return texte
      .toLowerCase()
      .normalize("NFKC")
      .replace(/[^\w\s\u0600-\u06FF]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && w.length < 100)
      .filter((w) => !MOTS_ARRETS.has(w))
      .map((w) => this.normaliserArabe(w));
  }

  private developperMot(mot: string): string[] {
    const variantes = [mot];
    if (mot.startsWith("ال") && mot.length > 4) {
      variantes.push(mot.slice(2));
    } else if (!mot.startsWith("ال") && mot.length > 2) {
      variantes.push("ال" + mot);
    }
    return [...new Set(variantes)];
  }

  private normaliserArabe(texte: string): string {
    return texte
      .replace(/[أإآ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ـ/g, "")
      .split(/\s+/)
      .map((w) => {
        const chars = [...w];
        for (let i = 2; i < chars.length - 1; i++) {
          if (chars[i] === "ا" && chars[i + 1] === "ل") {
            chars[i] = "ل";
            chars[i + 1] = "ا";
          }
        }
        return chars.join("");
      })
      .join(" ");
  }

  private ajouterAIndex(texte: string, chunkId: string): void {
    const index = this.chargerIndex();
    const mots = new Set(this.tokeniser(texte));
    for (const mot of mots) {
      if (!index[mot]) index[mot] = [];
      if (!index[mot].includes(chunkId)) {
        index[mot].push(chunkId);
      }
    }
    this.sauvegarderIndex(index);
  }

  private supprimerDeIndex(texte: string, chunkId: string): void {
    const index = this.chargerIndex();
    const mots = new Set(this.tokeniser(texte));
    for (const mot of mots) {
      if (index[mot]) {
        index[mot] = index[mot].filter((id) => id !== chunkId);
        if (index[mot].length === 0) delete index[mot];
      }
    }
    this.sauvegarderIndex(index);
  }

  private chargerIndex(): IndexInverse {
    if (!fs.existsSync(this.cheminIndex)) return {};
    try {
      return JSON.parse(fs.readFileSync(this.cheminIndex, "utf-8"));
    } catch {
      return {};
    }
  }

  private sauvegarderIndex(index?: IndexInverse): void {
    if (!index) index = this.chargerIndex();
    fs.writeFileSync(this.cheminIndex, JSON.stringify(index));
  }

  private chargerTout(): EntreeChunk[] {
    if (!fs.existsSync(this.cheminCollection)) return [];
    try {
      return JSON.parse(fs.readFileSync(this.cheminCollection, "utf-8"));
    } catch {
      return [];
    }
  }

  private sauvegarderTout(entrees: EntreeChunk[]): void {
    fs.writeFileSync(this.cheminCollection, JSON.stringify(entrees, null, 2));
  }
}

export const moteurRecherche = new MoteurRechercheVectorielle();
