// Service de génération PDF
// Utilise pdf-lib pour créer des documents PDF professionnels
// avec page de garde, table des matières, pagination

import fs from "fs";
import path from "path";
import { PDFDocument, rgb, PageSizes } from "pdf-lib";
import * as fontkit from "fontkit";

// fontkit est un module CommonJS/ESM sans export par défaut ; on utilise
// l'import de namespace et on le convertit vers l'interface `Fontkit` de
// pdf-lib (compatible au runtime).
type FontkitPdfLib = Parameters<PDFDocument["registerFontkit"]>[0];
const fontkitPdfLib = fontkit as unknown as FontkitPdfLib;

function chargerPoliceArabes() {
  const repertoire = path.join(process.cwd(), "lib", "assets", "fonts");
  return {
    regulier: fs.readFileSync(path.join(repertoire, "DroidKufi-Regular.ttf")),
    gras: fs.readFileSync(path.join(repertoire, "DroidKufi-Bold.ttf")),
  };
}

let policesArabes: { regulier: Buffer; gras: Buffer } | null = null;

function obtenirPolicesArabes() {
  if (!policesArabes) {
    policesArabes = chargerPoliceArabes();
  }
  return policesArabes;
}

interface PDFCaseData {
  reference: string;
  mahakimRef?: string;
  type: string;
  sousType?: string;
  tribunal?: string;
  dateCreation: string;
  etat: string;
  description?: string;
  notes?: string;
  client: {
    nom: string;
    prenom: string;
    cin: string;
    telephone: string;
    adresse?: string;
    ville?: string;
  };
  documents: Array<{
    nom: string;
    fileName: string;
    etat: string;
    uploadedAt: string;
  }>;
  hearings: Array<{
    date: string;
    type?: string;
    tribunal?: string;
    statut: string;
  }>;
  progress: number;
}

// Génère le PDF complet d'un dossier
export async function generateCasePDF(data: PDFCaseData): Promise<Buffer> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkitPdfLib);
  const arabes = obtenirPolicesArabes();
  const font = await doc.embedFont(arabes.regulier);
  const fontBold = await doc.embedFont(arabes.gras);

  const pages: Array<{ content: string[]; title: string }> = [];
  let pageCount = 0;

  // ─── Page de garde ───────────────────────────────────────
  const coverPage = doc.addPage(PageSizes.A4);
  const { width, height } = coverPage.getSize();
  pageCount++;

  // Titre
  coverPage.drawText("قضية رقم : " + data.reference, {
    x: width / 2 - 120,
    y: height - 100,
    size: 20,
    font: fontBold,
    color: rgb(0.12, 0.23, 0.37),
  });

  coverPage.drawText("ملف قانوني", {
    x: width / 2 - 60,
    y: height - 140,
    size: 16,
    font: font,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Informations client
  coverPage.drawText("المعلومات الشخصية", {
    x: 50,
    y: height - 220,
    size: 14,
    font: fontBold,
  });

  const clientInfo = [
    `الاسم : ${data.client.prenom} ${data.client.nom}`,
    `CIN : ${data.client.cin}`,
    `الهاتف : ${data.client.telephone}`,
  ];

  if (data.client.adresse) clientInfo.push(`العنوان : ${data.client.adresse}`);
  if (data.client.ville) clientInfo.push(`المدينة : ${data.client.ville}`);

  clientInfo.forEach((info, index) => {
    coverPage.drawText(info, {
      x: 50,
      y: height - 250 - index * 25,
      size: 11,
      font: font,
      color: rgb(0.2, 0.2, 0.2),
    });
  });

  // Informations dossier
  coverPage.drawText("معلومات القضية", {
    x: 50,
    y: height - 400,
    size: 14,
    font: fontBold,
  });

  const caseInfo = [
    `النوع : ${data.type}${data.sousType ? " - " + data.sousType : ""}`,
    `المحكمة : ${data.tribunal || "غير محدد"}`,
    `تاريخ الإنشاء : ${data.dateCreation}`,
    `الحالة : ${data.etat}`,
    `التقدم : ${data.progress}%`,
  ];

  if (data.mahakimRef) caseInfo.push(`مرجع محكيم : ${data.mahakimRef}`);

  caseInfo.forEach((info, index) => {
    coverPage.drawText(info, {
      x: 50,
      y: height - 430 - index * 25,
      size: 11,
      font: font,
      color: rgb(0.2, 0.2, 0.2),
    });
  });

  // Pied de page
  coverPage.drawText(`تم التصدير في : ${new Date().toLocaleDateString("fr-FR")}`, {
    x: 50,
    y: 50,
    size: 9,
    font: font,
    color: rgb(0.5, 0.5, 0.5),
  });

  // ─── Page : Description ──────────────────────────────────
  if (data.description) {
    const page = doc.addPage(PageSizes.A4);
    pageCount++;
    page.drawText("وصف القضية", {
      x: 50,
      y: height - 50,
      size: 16,
      font: fontBold,
    });

    // Gestion du texte long (wrap simple)
    const maxWidth = width - 100;
    const words = data.description.split(" ");
    let line = "";
    let y = height - 100;
    for (const word of words) {
      const testLine = line + word + " ";
      const testWidth = font.widthOfTextAtSize(testLine, 11);
      if (testWidth > maxWidth) {
        page.drawText(line, { x: 50, y, size: 11, font });
        y -= 20;
        line = word + " ";
      } else {
        line = testLine;
      }
    }
    if (line) page.drawText(line, { x: 50, y, size: 11, font });
  }

  // ─── Pages : Documents ───────────────────────────────────
  if (data.documents.length > 0) {
    const page = doc.addPage(PageSizes.A4);
    pageCount++;
    page.drawText("الوثائق", {
      x: 50,
      y: height - 50,
      size: 16,
      font: fontBold,
    });

    const columns = ["الاسم", "الملف", "الحالة", "التاريخ"];
    const colWidths = [120, 150, 80, 100];

    // Header
    let x = 50;
    columns.forEach((col, i) => {
      page.drawText(col, {
        x,
        y: height - 90,
        size: 10,
        font: fontBold,
        color: rgb(0.12, 0.23, 0.37),
      });
      x += colWidths[i];
    });

    // Ligne séparatrice
    page.drawLine({
      start: { x: 50, y: height - 100 },
      end: { x: width - 50, y: height - 100 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });

    // Data
    data.documents.forEach((doc, index) => {
      const rowY = height - 120 - index * 25;
      const cells = [
        doc.nom,
        doc.fileName,
        doc.etat,
        new Date(doc.uploadedAt).toLocaleDateString("fr-FR"),
      ];

      let cx = 50;
      cells.forEach((cell, ci) => {
        page.drawText(cell.substring(0, 20), {
          x: cx,
          y: rowY,
          size: 9,
          font,
        });
        cx += colWidths[ci];
      });
    });
  }

  // ─── Pages : Audiences ───────────────────────────────────
  if (data.hearings.length > 0) {
    const page = doc.addPage(PageSizes.A4);
    pageCount++;
    page.drawText("الجلسات", {
      x: 50,
      y: height - 50,
      size: 16,
      font: fontBold,
    });

    data.hearings.forEach((hearing, index) => {
      const y = height - 100 - index * 30;
      const hearingInfo = [
        `التاريخ : ${new Date(hearing.date).toLocaleDateString("fr-FR")}`,
        `النوع : ${hearing.type || "غير محدد"}`,
        `المحكمة : ${hearing.tribunal || "غير محدد"}`,
        `الحالة : ${hearing.statut}`,
      ].join(" | ");

      page.drawText(hearingInfo, {
        x: 50,
        y,
        size: 10,
        font,
      });
    });
  }

  // ─── Pagination générale ─────────────────────────────────
  const pageCount_total = doc.getPageCount();
  for (let i = 0; i < pageCount_total; i++) {
    const p = doc.getPage(i);
    p.drawText(`- ${i + 1} -`, {
      x: width / 2 - 10,
      y: 30,
      size: 9,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}
