import fs from "fs";
import path from "path";

const REPERTOIRE_MODELES = path.resolve(process.cwd(), "legal_templates");

interface ChampModele {
  cle: string;
  label: string;
  obligatoire: boolean;
}

interface InfoModele {
  type: string;
  nomAr: string;
  description: string;
  champs: ChampModele[];
}

export class ChargeurModele {
  chargerInfo(typeModele: string): InfoModele | null {
    const cheminJSON = path.resolve(
      process.cwd(),
      "document_templates",
      `${typeModele}.json`
    );
    if (!fs.existsSync(cheminJSON)) return null;
    try {
      return JSON.parse(fs.readFileSync(cheminJSON, "utf-8"));
    } catch {
      return null;
    }
  }

  chargerModele(typeModele: string): string | null {
    const cheminRef = path.join(REPERTOIRE_MODELES, typeModele, "reference.docs");
    if (fs.existsSync(cheminRef)) {
      try {
        return fs.readFileSync(cheminRef, "utf-8");
      } catch {
        return null;
      }
    }
    const cheminMD = path.join(REPERTOIRE_MODELES, typeModele, "template.md");
    if (!fs.existsSync(cheminMD)) return null;
    try {
      return fs.readFileSync(cheminMD, "utf-8");
    } catch {
      return null;
    }
  }

  chargerModeleDocx(typeModele: string): Buffer | null {
    const cheminDocx = path.join(REPERTOIRE_MODELES, typeModele, "reference.docx");
    if (!fs.existsSync(cheminDocx)) return null;
    try {
      return fs.readFileSync(cheminDocx);
    } catch {
      return null;
    }
  }

  remplirModele(
    modele: string,
    valeurs: Record<string, string>
  ): string {
    let resultat = modele;
    for (const [cle, valeur] of Object.entries(valeurs)) {
      const placeholder = `{{${cle}}}`;
      resultat = resultat.split(placeholder).join(valeur || "");
    }
    return resultat;
  }

  modeleExiste(typeModele: string): boolean {
    const cheminRef = path.join(REPERTOIRE_MODELES, typeModele, "reference.docs");
    if (fs.existsSync(cheminRef)) return true;
    const cheminMD = path.join(REPERTOIRE_MODELES, typeModele, "template.md");
    if (fs.existsSync(cheminMD)) return true;
    const cheminDocx = path.join(REPERTOIRE_MODELES, typeModele, "reference.docx");
    return fs.existsSync(cheminDocx);
  }

  aModeleDocx(typeModele: string): boolean {
    const cheminDocx = path.join(REPERTOIRE_MODELES, typeModele, "reference.docx");
    return fs.existsSync(cheminDocx);
  }
}

export const chargeurModele = new ChargeurModele();
