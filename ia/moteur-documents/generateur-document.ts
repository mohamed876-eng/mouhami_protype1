import { chargeurModele } from "./chargeur-modele";
import { constructeurDocx } from "./constructeur-docx";
import { moteurModeleDocx } from "./moteur-modele-docx";

interface DocumentGenerate {
  docxBase64: string;
  nomFichier: string;
  apercu: string;
}

const CORRESPONDANCE_CHAMPS: Record<string, string> = {
  plaintiffName: "PLAINTIFF_NAME",
  cin: "PLAINTIFF_CIN",
  plaintiffCIN: "PLAINTIFF_CIN",
  plaintiffProfession: "PLAINTIFF_PROFESSION",
  plaintiffAddress: "PLAINTIFF_ADDRESS",
  clientName: "PLAINTIFF_NAME",
  clientAddress: "PLAINTIFF_ADDRESS",
  defendantName: "DEFENDANT_NAME",
  defendantCapacity: "DEFENDANT_CAPACITY",
  defendantAddress: "DEFENDANT_ADDRESS",
  lawyerName: "LAWYER_NAME",
  lawyerBar: "LAWYER_BAR",
  plaintiffPhone: "PLAINTIFF_PHONE",
  defendantPhone: "DEFENDANT_PHONE",
  lawyerLicense: "LAWYER_LICENSE",
  tribunal: "TRIBUNAL",
  appealCourt: "APPEAL_COURT",
  subject: "SUBJECT",
  date: "DATE",
  attachments: "ATTACHMENTS",
  legalArguments: "LEGAL_ARGUMENTS",
};

const PRODUIT_PAR_LLM = new Set([
  "facts",
  "requests",
  "conclusion",
  "legalArguments",
]);

const VALEURS_STATIQUES: Record<string, string> = {
  PLAINTIFF_PROFESSION: "..........",
  PLAINTIFF_ADDRESS: "..........",
  LAWYER_NAME: "..........",
  LAWYER_BAR: "..........",
  DEFENDANT_CAPACITY: "..........",
  DEFENDANT_ADDRESS: "..........",
  DEFENDANT_PHONE: "..........",
  PLAINTIFF_PHONE: "..........",
  LAWYER_LICENSE: "..........",
  ATTACHMENTS: "..........",
  DATE: new Date().toLocaleDateString("ar-MA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }),
};

export class GenerateurDocument {
  async generer(
    typeModele: string,
    champs: Record<string, string>
  ): Promise<DocumentGenerate> {
    const variablesModele: Record<string, string> = {};

    for (const [cleEntrante, valeur] of Object.entries(champs)) {
      const cleCorrespondante =
        CORRESPONDANCE_CHAMPS[cleEntrante] || cleEntrante.toUpperCase();
      variablesModele[cleCorrespondante] = valeur || "";
    }

    for (const [cle, valeurParDefaut] of Object.entries(VALEURS_STATIQUES)) {
      if (!variablesModele[cle]) {
        variablesModele[cle] = valeurParDefaut;
      }
    }

    variablesModele["FACTS"] = champs.facts || "..........";
    variablesModele["REQUESTS"] = champs.requests || "..........";
    variablesModele["CONCLUSION"] = VALEURS_STATIQUES.CONCLUSION || "..........";
    variablesModele["LEGAL_ARGUMENTS"] = champs.legalArguments || "..........";

    let bufferDocx: Buffer;

    if (chargeurModele.aModeleDocx(typeModele)) {
      bufferDocx = await moteurModeleDocx.construireDepuisDocx(
        typeModele,
        variablesModele
      );
    } else {
      const contenuModele = chargeurModele.chargerModele(typeModele);
      if (!contenuModele) {
        throw new Error("Modèle introuvable pour le type: " + typeModele);
      }

      const modeleRempli = chargeurModele.remplirModele(
        contenuModele,
        variablesModele
      );
      bufferDocx = await constructeurDocx.construireDepuisModele(
        modeleRempli,
        typeModele
      );
    }

    const nomFichier = `${typeModele}_${Date.now()}.docx`;

    return {
      docxBase64: bufferDocx.toString("base64"),
      nomFichier,
      apercu: Object.entries(variablesModele)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n"),
    };
  }

  peutGerer(typeModele: string): boolean {
    return chargeurModele.modeleExiste(typeModele);
  }
}

export const generateurDocument = new GenerateurDocument();
