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

// Version du pipeline de normalisation. Quand elle change, l'index est
// reconstruit automatiquement au démarrage (voir reindexerSiNecessaire).
const VERSION_NORMALISATION = 2;

// Clé des n-grammes dans l'index inversé : séparée des mots pour ne jamais
// entrer en collision avec une entrée lexicale.
const PREFIXE_NGRAMME = "#3:";

// Tailles bornées pour un comportement prévisible.
const TAILLE_NGRAMME = 3;
const SEUIL_COMPTEUR_TF = 20;

// Synonymes juridiques (formes normalisées). Petite liste sûre : on n'ajoute
// que des équivalents sémantiques directs, pour ne pas générer de bruit.
const SYNONYMES: Record<string, string[]> = {
  طلاق: ["تطليق"],
  تطليق: ["طلاق"],
  ارث: ["ميراث", "تركه"],
  ميراث: ["ارث", "تركه"],
  تركه: ["ارث", "ميراث"],
  محكمه: ["محاكم"],
  محاكم: ["محكمه"],
  دعوي: ["دعاوي", "دعوا"],
  دعاوي: ["دعوي"],
  دعوا: ["دعوي"],
  عقد: ["عقود"],
  عقود: ["عقد"],
  قاصر: ["صغير"],
  صغير: ["قاصر"],
};

/** Préfixes de liaison arabes, du plus long au plus court (pour un max).
 * « والطلاق » → « الطلاق » puis « طلاق » ; « بالطلاق » → « الطلاق »/« طلاق ». */
const PREFIXES_LIAISON = ["وال", "بال", "فال", "كال", "لل", "ال", "و", "ب", "ف", "ل", "ك"];

/**
 * Signaux terminologiques par référentiel juridique. Quand le questionnement
 * n'emploie que des mots génériques (« الأحكام », « النهائية », « القضائية »),
 * le score lexical ne discrimine pas assez le bon code. Chaque signal présent
 * dans la question booste les chunks de ce document.
 */
const REFERENTIELS: { fragmentNom: string; signaux: string[] }[] = [
  {
    fragmentNom: "مدونة الأسرة",
    signaux: [
      "مدونه الاسره", "الاسره", "الزواج", "الطلاق", "التطليق", "الخلع",
      "النسب", "الحضان", "النفقه", "المهر", "الصداق", "الوصيه", "الميراث",
      "الارث", "الكفاله", "الرضاع", "الشقاق", "فصل الزوجيه", "العضل",
      "الفقه المالكي",
    ],
  },
  {
    fragmentNom: "المسطرة المدنية",
    signaux: [
      "المسطره المدنيه", "المسطره", "المدني", "المساعده القضائيه",
      "المساعده", "التماس", "التعرض", "الاختصاص", "الاستعجالي", "التحفيظ",
      "الطعن", "النهائيه", "النفاذ", "الامر على عراض", "الاداء",
    ],
  },
  {
    fragmentNom: "CriminalProccedure",
    signaux: [
      "المسطره الجنائيه", "التحقيق", "التحقيق الجنائي", "الاعتقال",
      "الاعتقال الاحتياطي", "الاحتياطي", "المشتبه", "المتهم", "الجريمه",
      "الجنايه", "الجنحه", "وكيل الملك", "النيابه", "الضابطه القضائيه",
      "السراح", "الاحتفاظ", "المحاكمه", "الجنايات",
    ],
  },
  {
    fragmentNom: "ONC",
    signaux: [
      "الالتزام", "الالتزامات", "العقود", "المدين", "الدائن", "التعويض",
      "الوفاء", "الكراء", "الايجار", "البائع", "المشتري", "الغبن",
      "المسؤوليه", "تقادم", "شروط العقد", "اركان العقد", "الاخلال",
    ],
  },
];

// Booster porté par chaque signal retrouvé (plafonné) : un document ciblé par
// 2 signaux est multiplié par ~1,8 — assez pour départager sans écraser.
const POIDS_SIGNAL = 0.4;
const MAX_SIGNAUX_COMPTES = 3;

export interface ResultatRecherche {
  texte: string;
  nomDocument: string;
  numeroPage: number;
  score: number;
}

/**
 * Normalisation caractère-par-caractère d'un mot arabe :
 *   - suppression des diacritiques (tashkeel) : \u064B-\u065F, \u0653-\u0655,
 *     \u0656-\u065E, \u0670 (via NFKD qui décompose les lettres hamzées)
 *   - unification des hamzas : أإآ→ا, ؤ→و, ئ→ي (NFKD + remplacement)
 *   - ى→ي, ة→ه, tatweel « ـ » retiré.
 */
function normaliserCaracteres(mot: string): string {
  return mot
    .normalize("NFKC")
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0653-\u0655\u0656-\u065E\u0670]/g, "")
    .replace(/ـ/g, "")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[أإآ]/g, "ا")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي");
}

/** Formes « défixées » du mot (avec/après préfixes de liaison). */
function variantesDefixe(mot: string): string[] {
  const formes = new Set<string>([mot]);
  for (const prefixe of PREFIXES_LIAISON) {
    if (mot.startsWith(prefixe) && mot.length - prefixe.length >= TAILLE_NGRAMME) {
      formes.add(mot.slice(prefixe.length));
    }
  }
  return Array.from(formes);
}

/** Formes à chercher côté requête : mot + défixées + synonymes (défixés aussi). */
function variantesRecherche(mot: string): string[] {
  const formes = new Set<string>([mot, ...variantesDefixe(mot)]);
  const synonymes = SYNONYMES[mot];
  if (synonymes) {
    for (const synonyme of synonymes) {
      formes.add(synonyme);
      for (const forme of variantesDefixe(synonyme)) formes.add(forme);
    }
  }
  return Array.from(formes);
}

/** N-grammes de caractères (permet de matcher des formes fléchies/OCR). */
function ngrammes(mot: string, taille = TAILLE_NGRAMME): string[] {
  if (mot.length < taille) return [];
  const grammes: string[] = [];
  for (let i = 0; i + taille <= mot.length; i++) {
    grammes.push(mot.slice(i, i + taille));
  }
  return grammes;
}

export class MoteurRechercheVectorielle {
  private cheminCollection: string;
  private cheminIndex: string;
  private cheminMeta: string;
  private cacheEntrees: EntreeChunk[] | null = null;
  private signatureEntrees: string = "";
  private cacheIndex: IndexInverse | null = null;
  private signatureIndex: string = "";

  constructor() {
    if (!fs.existsSync(REPERTOIRE_STOCKAGE)) {
      fs.mkdirSync(REPERTOIRE_STOCKAGE, { recursive: true });
    }
    this.cheminCollection = path.join(REPERTOIRE_STOCKAGE, "library.json");
    this.cheminIndex = path.join(REPERTOIRE_STOCKAGE, "index.json");
    this.cheminMeta = path.join(REPERTOIRE_STOCKAGE, "meta.json");
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
    if (nombreDocs === 0) return [];
    const cartesEntrees = new Map(entrees.map((e) => [e.id, e]));

    const idfDe = (nbDocs: number) =>
      Math.log((nombreDocs + 1) / (nbDocs + 1)) + 1;
    const maxIdf = idfDe(0);

    const scoresBruts: Map<string, number> = new Map();

    for (const mot of motsRequete) {
      let maxIdfMot = 0;
      const morceauxCorrespondants = new Map<string, number>();

      // 1) Correspondance lexicale : mot + défixés + synonymes.
      for (const variante of variantesRecherche(mot)) {
        const morceauxVariante = index[variante] || [];
        const idf = idfDe(morceauxVariante.length);
        if (idf > maxIdfMot) maxIdfMot = idf;

        const formesComptees = new Set([variante, ...variantesDefixe(variante)]);
        for (const chunkId of morceauxVariante) {
          const entree = cartesEntrees.get(chunkId);
          if (!entree) continue;
          const tf = this.frequenceTerme(entree.texte, formesComptees);
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

      // 2) Bonus n-grammes : tolérance morphologique (formes fléchies/OCR).
      const grammes = ngrammes(mot);
      if (grammes.length > 0 && maxIdfMot > 0) {
        const touchesParChunk = new Map<string, number>();
        for (const gramme of grammes) {
          const morceauxGramme = index[`${PREFIXE_NGRAMME}${gramme}`] || [];
          for (const chunkId of morceauxGramme) {
            touchesParChunk.set(chunkId, (touchesParChunk.get(chunkId) || 0) + 1);
          }
        }
        for (const [chunkId, nbTouches] of touchesParChunk) {
          const ratio = nbTouches / grammes.length;
          const bonus = ratio * maxIdfMot * 2;
          scoresBruts.set(chunkId, (scoresBruts.get(chunkId) || 0) + bonus);
        }
      }
    }

    // 3) Classifieur de référentiel : booste les documents dont le vocabulaire
    //    caractéristique apparaît dans la question.
    const coefficients = this.coefficientsDocuments(requete);
    if (coefficients.size > 0) {
      for (const [chunkId, score] of scoresBruts) {
        const entree = cartesEntrees.get(chunkId);
        if (!entree) continue;
        const coeff = coefficients.get(entree.nomDocument);
        if (coeff && coeff !== 1) {
          scoresBruts.set(chunkId, score * coeff);
        }
      }
    }

    if (scoresBruts.size === 0) return [];

    const tries = Array.from(scoresBruts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topK);

    // Borne max : score lexical (×10) + bonus n-grammes (×2) par mot.
    const scoreMaxPossible = motsRequete.length * maxIdf * 12;

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

  private frequenceTerme(texte: string, formesComptees: Set<string>): number {
    const mots = texte
      .split(/\s+/)
      .map(normaliserCaracteres)
      .filter((w) => w.length >= TAILLE_NGRAMME);
    let compteur = 0;
    for (const mot of mots) {
      if (compteur >= SEUIL_COMPTEUR_TF) break;
      if (formesComptees.has(mot)) compteur++;
    }
    return compteur > 0 ? 1 + Math.log2(compteur) : 0;
  }

  /** Coefficient (>1) par document dont le vocabulaire cible la question. */
  private coefficientsDocuments(requete: string): Map<string, number> {
    const requeteNorm = normaliserCaracteres(requete.toLowerCase())
      .replace(/\s+/g, " ")
      .trim();
    const coefficients = new Map<string, number>();
    if (requeteNorm.length < 3) return coefficients;

    const nomsDocuments = this.documentsIndexes();
    for (const referentiel of REFERENTIELS) {
      let touches = 0;
      for (const signal of referentiel.signaux) {
        if (requeteNorm.includes(signal)) {
          touches++;
          if (touches >= MAX_SIGNAUX_COMPTES) break;
        }
      }
      if (touches === 0) continue;

      const coeff = 1 + POIDS_SIGNAL * touches;
      for (const nom of nomsDocuments) {
        if (nom.includes(referentiel.fragmentNom)) {
          coefficients.set(
            nom,
            Math.max(coefficients.get(nom) || 1, coeff)
          );
        }
      }
    }
    return coefficients;
  }

  nombreChunks(): number {
    return this.chargerTout().length;
  }

  vider(): void {
    if (fs.existsSync(this.cheminCollection)) fs.unlinkSync(this.cheminCollection);
    if (fs.existsSync(this.cheminIndex)) fs.unlinkSync(this.cheminIndex);
    this.invaliderCaches();
  }

  /**
   * Préchauffe les caches au démarrage :
   *   - reconstruit l'index si la version de normalisation a changé
   *   - parse library/index SI/MU/une seule fois hors des handlers.
   */
  initialiser(): void {
    this.reindexerSiNecessaire();
    this.chargerIndex();
    this.chargerTout();
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
      .map(normaliserCaracteres);
  }

  private ajouterAuIndex(index: IndexInverse, mot: string, chunkId: string): void {
    if (!index[mot]) index[mot] = [];
    if (!index[mot].includes(chunkId)) {
      index[mot].push(chunkId);
    }
  }

  private ajouterAIndex(texte: string, chunkId: string): void {
    const index = this.chargerIndex();
    const mots = new Set(this.tokeniser(texte));
    for (const mot of mots) {
      for (const variante of new Set([mot, ...variantesDefixe(mot)])) {
        this.ajouterAuIndex(index, variante, chunkId);
      }
      for (const gramme of ngrammes(mot)) {
        this.ajouterAuIndex(index, `${PREFIXE_NGRAMME}${gramme}`, chunkId);
      }
    }
    this.sauvegarderIndex(index);
  }

  private supprimerDeIndex(texte: string, chunkId: string): void {
    const index = this.chargerIndex();
    const mots = new Set(this.tokeniser(texte));
    for (const mot of mots) {
      for (const variante of new Set([mot, ...variantesDefixe(mot)])) {
        this.retirerDeIndex(index, variante, chunkId);
      }
      for (const gramme of ngrammes(mot)) {
        this.retirerDeIndex(index, `${PREFIXE_NGRAMME}${gramme}`, chunkId);
      }
    }
    this.sauvegarderIndex(index);
  }

  private retirerDeIndex(index: IndexInverse, mot: string, chunkId: string): void {
    if (index[mot]) {
      index[mot] = index[mot].filter((id) => id !== chunkId);
      if (index[mot].length === 0) delete index[mot];
    }
  }

  private chargerIndex(): IndexInverse {
    if (
      this.cacheIndex !== null &&
      this.signatureFichier(this.cheminIndex) === this.signatureIndex
    ) {
      return this.cacheIndex;
    }
    if (!fs.existsSync(this.cheminIndex)) return {};
    try {
      const index = JSON.parse(fs.readFileSync(this.cheminIndex, "utf-8"));
      this.cacheIndex = index;
      this.signatureIndex = this.signatureFichier(this.cheminIndex);
      return index;
    } catch {
      return {};
    }
  }

  private sauvegarderIndex(index?: IndexInverse): void {
    if (!index) index = this.chargerIndex();
    fs.writeFileSync(this.cheminIndex, JSON.stringify(index));
    this.cacheIndex = index;
    this.signatureIndex = this.signatureFichier(this.cheminIndex);
  }

  private chargerTout(): EntreeChunk[] {
    if (
      this.cacheEntrees !== null &&
      this.signatureFichier(this.cheminCollection) === this.signatureEntrees
    ) {
      return this.cacheEntrees;
    }
    if (!fs.existsSync(this.cheminCollection)) return [];
    try {
      const entrees = JSON.parse(fs.readFileSync(this.cheminCollection, "utf-8"));
      this.cacheEntrees = entrees;
      this.signatureEntrees = this.signatureFichier(this.cheminCollection);
      return entrees;
    } catch {
      return [];
    }
  }

  private sauvegarderTout(entrees: EntreeChunk[]): void {
    fs.writeFileSync(this.cheminCollection, JSON.stringify(entrees, null, 2));
    this.cacheEntrees = entrees;
    this.signatureEntrees = this.signatureFichier(this.cheminCollection);
  }

  private signatureFichier(chemin: string): string {
    try {
      const stat = fs.statSync(chemin);
      return `${stat.mtimeMs}:${stat.size}`;
    } catch {
      return "";
    }
  }

  private invaliderCaches(): void {
    this.cacheEntrees = null;
    this.cacheIndex = null;
    this.signatureEntrees = "";
    this.signatureIndex = "";
  }

  /** Reconstruit l'index depuis library.json quand la normalisation évolue. */
  private reindexerSiNecessaire(): void {
    if (!fs.existsSync(this.cheminCollection)) return;
    try {
      const meta = JSON.parse(fs.readFileSync(this.cheminMeta, "utf-8") || "{}");
      if (meta.normalisationVersion === VERSION_NORMALISATION) return;
    } catch {
      // meta absente/corrompue → on reindexe par sécurité.
    }

    const entrees = this.chargerTout();
    const index: IndexInverse = {};
    for (const entree of entrees) {
      const mots = new Set(this.tokeniser(entree.texte));
      for (const mot of mots) {
        for (const variante of new Set([mot, ...variantesDefixe(mot)])) {
          this.ajouterAuIndex(index, variante, entree.id);
        }
        for (const gramme of ngrammes(mot)) {
          this.ajouterAuIndex(index, `${PREFIXE_NGRAMME}${gramme}`, entree.id);
        }
      }
    }

    this.sauvegarderIndex(index);
    this.cacheIndex = index;
    this.signatureIndex = this.signatureFichier(this.cheminIndex);

    try {
      const meta = JSON.parse(fs.readFileSync(this.cheminMeta, "utf-8") || "{}");
      meta.normalisationVersion = VERSION_NORMALISATION;
      fs.writeFileSync(this.cheminMeta, JSON.stringify(meta, null, 2));
    } catch {
      // meta non écrite : on ignorera (re-mesure au prochain boot, coût faible).
    }
  }
}

export const moteurRecherche = new MoteurRechercheVectorielle();
moteurRecherche.initialiser();