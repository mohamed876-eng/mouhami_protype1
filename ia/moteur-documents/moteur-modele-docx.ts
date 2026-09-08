import AdmZip from "adm-zip";
import path from "path";

const REPERTOIRE_MODELES = path.resolve(process.cwd(), "legal_templates");

interface CorrespondanceWt {
  correspondanceComplete: string;
  index: number;
  longueur: number;
  texte: string;
}

export class MoteurModeleDocx {
  peutGerer(typeModele: string): boolean {
    const cheminDocx = path.join(REPERTOIRE_MODELES, typeModele, "reference.docx");
    const fs = require("fs");
    return fs.existsSync(cheminDocx);
  }

  async construireDepuisDocx(
    typeModele: string,
    valeurs: Record<string, string>
  ): Promise<Buffer> {
    const cheminDocx = path.join(REPERTOIRE_MODELES, typeModele, "reference.docx");

    const zip = new AdmZip(cheminDocx);

    for (const nomEntree of [
      "word/document.xml",
      "word/header1.xml",
      "word/footer1.xml",
    ]) {
      const entree = zip.getEntry(nomEntree);
      if (!entree) continue;

      let xml = entree.getData().toString("utf-8");

      xml = this.fusionnerPlaceholdersSepares(xml, Object.keys(valeurs));
      xml = this.remplacerPlaceholders(xml, valeurs);

      zip.updateFile(nomEntree, Buffer.from(xml, "utf-8"));
    }

    return zip.toBuffer();
  }

  private fusionnerPlaceholdersSepares(
    xml: string,
    clesConnues: string[]
  ): string {
    const regexWt = /<w:t[^>]*>([^<]*)<\/w:t>/g;
    const correspondancesWt: CorrespondanceWt[] = [];
    let m: RegExpExecArray | null;

    while ((m = regexWt.exec(xml)) !== null) {
      correspondancesWt.push({
        correspondanceComplete: m[0],
        index: m.index,
        longueur: m[0].length,
        texte: m[1],
      });
    }

    const ensembleCles = new Set(clesConnues);
    let decalage = 0;

    for (let i = 0; i < correspondancesWt.length; i++) {
      const trimée = correspondancesWt[i].texte.trim();
      if (trimée !== "{{") continue;

      const texteCle =
        i + 1 < correspondancesWt.length
          ? correspondancesWt[i + 1].texte.trim()
          : "";
      const texteFermeture =
        i + 2 < correspondancesWt.length
          ? correspondancesWt[i + 2].texte.trim()
          : "";

      if (!ensembleCles.has(texteCle)) continue;

      const estOuverture = true;
      const estFermeture =
        texteFermeture === "}}" || texteFermeture === "} }";
      if (!estOuverture || !estFermeture) continue;

      const textePlaceholder = `{{${texteCle}}}`;
      const ouvertureRun = correspondancesWt[i];
      const fermetureRun = correspondancesWt[i + 2];

      const posInsertion = ouvertureRun.index + decalage;
      const longInsertion = ouvertureRun.longueur;

      const remplacement = ouvertureRun.correspondanceComplete.replace(
        /<w:t[^>]*>[^<]*<\/w:t>/,
        `<w:t>${this.échapperXML(textePlaceholder)}</w:t>`
      );

      xml =
        xml.substring(0, posInsertion) +
        remplacement +
        xml.substring(posInsertion + longInsertion);

      decalage += remplacement.length - longInsertion;

      const cleRun = correspondancesWt[i + 1];
      const posCle = cleRun.index + decalage;
      xml =
        xml.substring(0, posCle) +
        xml.substring(posCle + cleRun.longueur);
      decalage -= cleRun.longueur;

      const posFermeture = fermetureRun.index + decalage;
      xml =
        xml.substring(0, posFermeture) +
        xml.substring(posFermeture + fermetureRun.longueur);
      decalage -= fermetureRun.longueur;

      i += 2;
    }

    return xml;
  }

  private remplacerPlaceholders(
    xml: string,
    valeurs: Record<string, string>
  ): string {
    for (const [cle, valeur] of Object.entries(valeurs)) {
      const placeholder = `{{${cle}}}`;
      if (xml.includes(placeholder)) {
        const échappé = this.échapperXML(valeur || "");
        xml = xml.split(placeholder).join(échappé);
      }
    }
    return xml;
  }

  private échapperXML(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  obtenirCheminModele(typeModele: string): string {
    return path.join(REPERTOIRE_MODELES, typeModele, "reference.docx");
  }
}

export const moteurModeleDocx = new MoteurModeleDocx();
