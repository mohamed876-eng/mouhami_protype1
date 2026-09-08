import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
} from "docx";

export class ConstructeurDocx {
  async construireDepuisModele(
    modeleRempli: string,
    titre: string
  ): Promise<Buffer> {
    const paragraphes: Paragraph[] = [];
    const lignes = modeleRempli.split("\n");

    for (const ligneBrute of lignes) {
      const ligne = ligneBrute.trimEnd();
      const trimée = ligne.trim();

      if (!trimée) {
        paragraphes.push(this.ligneVide(60));
        continue;
      }

      if (trimée.startsWith("---")) {
        paragraphes.push(this.separateurSection());
        continue;
      }

      if (trimée.startsWith("# ")) {
        paragraphes.push(this.titre(trimée.replace("# ", "")));
        continue;
      }

      if (trimée.startsWith("**") && trimée.endsWith("**")) {
        paragraphes.push(this.enteteSection(trimée.replace(/\*\*/g, "")));
        continue;
      }

      if (
        trimée.includes(":**") ||
        (trimée.includes(":") && !trimée.includes("{{"))
      ) {
        const indexDeuxPoints = trimée.indexOf(":");
        const etiquette = trimée.substring(0, indexDeuxPoints).trim();
        const valeur = trimée.substring(indexDeuxPoints + 1).trim();
        if (etiquette && valeur) {
          paragraphes.push(this.ligneChamp(etiquette, valeur));
          continue;
        }
      }

      paragraphes.push(this.texteCorps(trimée));
    }

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440,
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
              size: {
                width: 12240,
                height: 15840,
              },
            },
          },
          children: paragraphes,
        },
      ],
    });

    return await Packer.toBuffer(doc);
  }

  private ligneVide(espacement: number = 60): Paragraph {
    return new Paragraph({ spacing: { after: espacement } });
  }

  private separateurSection(): Paragraph {
    return new Paragraph({
      spacing: { before: 200, after: 200 },
    });
  }

  private titre(texte: string): Paragraph {
    return new Paragraph({
      children: [
        new TextRun({
          text: texte,
          bold: true,
          size: 36,
          font: "Tajawal",
        }),
      ],
      alignment: AlignmentType.CENTER,
      bidirectional: true,
      spacing: { before: 400, after: 300 },
    });
  }

  private enteteSection(texte: string): Paragraph {
    return new Paragraph({
      children: [
        new TextRun({
          text: texte,
          bold: true,
          size: 28,
          font: "Tajawal",
        }),
      ],
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { before: 300, after: 150 },
    });
  }

  private ligneChamp(etiquette: string, valeur: string): Paragraph {
    return new Paragraph({
      children: [
        new TextRun({
          text: etiquette,
          bold: true,
          size: 24,
          font: "Tajawal",
        }),
        new TextRun({
          text: "  " + valeur,
          size: 24,
          font: "Tajawal",
        }),
      ],
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { after: 80 },
    });
  }

  private texteCorps(texte: string): Paragraph {
    return new Paragraph({
      children: [
        new TextRun({
          text: texte,
          size: 24,
          font: "Tajawal",
        }),
      ],
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { after: 120 },
      indent: { right: 200 },
    });
  }
}

export const constructeurDocx = new ConstructeurDocx();
