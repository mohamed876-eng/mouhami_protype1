export interface SourceResultat {
  texte: string;
  nomDocument: string;
  numeroPage: number;
  score: number;
}

// Plafond par source : on n'envoie que le début de chaque page retenue pour
// ne pas gonfler le contexte et accélérer le premier token (prefill réduit).
const MAX_TEXTE_SOURCE = 1800;

export class ConstructeurPrompt {
  construirePromptSysteme(): string {
    return [
      "أنت مساعد بحث قانوني متخصص في القانون المغربي.",
      "دورك هو تحليل النصوص القانونية المقدمة والإجابة بناءً عليها.",
      "",
      "القواعد:",
      "- استخرج المعلومة من النصوص المقدمة فقط.",
      "- إذا وجدت نصاً ذا صلة بالسؤال، اشرحه واذكر رقم المادة أو الفصل إن وجد.",
      "- لا تخترع معلومات من عندك.",
      '- إذا لم تجد أي نص ذي صلة، قل فقط: "لم يتم العثور على نص قانوني يرد مباشرة على هذا السؤال."',
      "",
      "صِغ إجابتك باللغة العربية الفصحى الواضحة.",
      "قسّم الإجابة إلى فقرات إن لزم الأمر.",
    ].join("\n");
  }

  construirePromptUtilisateur(
    question: string,
    sources: SourceResultat[]
  ): string {
    if (sources.length === 0) {
      return `سؤال المستخدم: ${question}\n\nلم يتم العثور على نص قانوني يرد مباشرة على هذا السؤال.`;
    }

    const contexte = sources
      .map((s, i) => {
        const texteSource =
          s.texte.length > MAX_TEXTE_SOURCE
            ? s.texte.slice(0, MAX_TEXTE_SOURCE)
            : s.texte;
        return `[المصدر ${i + 1}]\nالوثيقة: ${s.nomDocument} (صفحة ${s.numeroPage})\nالنص:\n${texteSource}`;
      })
      .join("\n\n---\n\n");

    return [
      "سؤال المستخدم:",
      question,
      "",
      "النصوص القانونية المتوفرة:",
      "",
      contexte,
      "",
      "أجب عن السؤال بناءً على النصوص أعلاه فقط.",
      "إذا كان أي من النصوص يحتوي على معلومات ذات صلة، استخدمها وأشر إلى المصدر.",
      'إذا لم تجد أي نص ذي صلة، قل فقط: لم يتم العثور على نص قانوني يرد على هذا السؤال.',
    ].join("\n");
  }
}

export const constructeurPrompt = new ConstructeurPrompt();
