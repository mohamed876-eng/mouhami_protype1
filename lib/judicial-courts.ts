export type TribunalType = "NORMAL" | "COMMERCIAL" | "ADMIN";

export interface Tribunal {
  id: number;
  nameAr: string;
  courtType: TribunalType;
}

export interface JudicialRegion {
  id: number;
  nameAr: string;
  tribunals: Tribunal[];
}

export const CUSTOM_TRIBUNAL_VALUE = "__custom__";

export const COURT_TYPE_LABELS: Record<TribunalType, string> = {
  NORMAL: "المحاكم العادية",
  COMMERCIAL: "المحاكم التجارية",
  ADMIN: "المحاكم الإدارية",
};

export const JUDICIAL_COURTS_SOURCE =
  "https://cartejudiciaire.justice.gov.ma/";

export const JUDICIAL_REGIONS: JudicialRegion[] = [
  {
    id: 11,
    nameAr: "آسفي",
    tribunals: [
      { id: 46, nameAr: "المحكمة الابتدائية بآسفي", courtType: "NORMAL" },
      { id: 47, nameAr: "المحكمة الابتدائية بالصويرة", courtType: "NORMAL" },
      { id: 48, nameAr: "المحكمة الابتدائية باليوسفية", courtType: "NORMAL" },
    ],
  },
  {
    id: 12,
    nameAr: "الجديدة",
    tribunals: [
      { id: 84, nameAr: "المحكمة الابتدائية بالجديدة", courtType: "NORMAL" },
      { id: 85, nameAr: "المحكمة الابتدائية بسيدي بنور", courtType: "NORMAL" },
    ],
  },
  {
    id: 16,
    nameAr: "الحسيمة",
    tribunals: [
      { id: 9, nameAr: "المحكمة الابتدائية بالحسيمة", courtType: "NORMAL" },
      { id: 10, nameAr: "المحكمة الابتدائية بتارجيست", courtType: "NORMAL" },
    ],
  },
  {
    id: 1,
    nameAr: "الدار البيضاء-سطات",
    tribunals: [
      { id: 1094, nameAr: "المحكمة الابتدائية التجارية بالدار البيضاء", courtType: "COMMERCIAL" },
      { id: 1095, nameAr: "المحكمة الابتدائية التجارية بالرباط", courtType: "COMMERCIAL" },
      { id: 91, nameAr: "المحكمة الابتدائية الاجتماعية بالدار البيضاء", courtType: "NORMAL" },
      { id: 90, nameAr: "المحكمة الابتدائية الزجرية بالدار البيضاء", courtType: "NORMAL" },
      { id: 89, nameAr: "المحكمة الابتدائية المدنية بالدار البيضاء", courtType: "NORMAL" },
      { id: 50, nameAr: "المحكمة الابتدائية بالمحمدية", courtType: "NORMAL" },
      { id: 52, nameAr: "المحكمة الابتدائية ببنسليمان", courtType: "NORMAL" },
    ],
  },
  {
    id: 2,
    nameAr: "الرباط-سلا-القنيطرة",
    tribunals: [
      { id: 1104, nameAr: "المحكمة الابتدائية الإدارية بالدار البيضاء", courtType: "ADMIN" },
      { id: 1105, nameAr: "المحكمة الابتدائية الإدارية بالرباط", courtType: "ADMIN" },
      { id: 22, nameAr: "المحكمة الابتدائية بالخميسات", courtType: "NORMAL" },
      { id: 21, nameAr: "المحكمة الابتدائية بالرباط", courtType: "NORMAL" },
      { id: 20, nameAr: "المحكمة الابتدائية بالرماني", courtType: "NORMAL" },
      { id: 25, nameAr: "المحكمة الابتدائية بتمارة", courtType: "NORMAL" },
      { id: 24, nameAr: "المحكمة الابتدائية بتيفلت", courtType: "NORMAL" },
      { id: 23, nameAr: "المحكمة الابتدائية بسلا", courtType: "NORMAL" },
    ],
  },
  {
    id: 9,
    nameAr: "الشرق",
    tribunals: [
      { id: 37, nameAr: "المحكمة الابتدائية لفكيك ببوعرفة", courtType: "NORMAL" },
      { id: 36, nameAr: "المحكمة الابتدائية ببركان", courtType: "NORMAL" },
      { id: 34, nameAr: "المحكمة الابتدائية بتاوريرت", courtType: "NORMAL" },
      { id: 38, nameAr: "المحكمة الابتدائية بجرادة", courtType: "NORMAL" },
      { id: 35, nameAr: "المحكمة الابتدائية ببوجدة", courtType: "NORMAL" },
    ],
  },
  {
    id: 22,
    nameAr: "العيون-الساقية الحمراء",
    tribunals: [
      { id: 15, nameAr: "المحكمة الابتدائية بالداخلة", courtType: "NORMAL" },
      { id: 31, nameAr: "المحكمة الابتدائية بالسمارة", courtType: "NORMAL" },
      { id: 32, nameAr: "المحكمة الابتدائية بالعيون", courtType: "NORMAL" },
      { id: 33, nameAr: "المحكمة الابتدائية ببوجدور", courtType: "NORMAL" },
    ],
  },
  {
    id: 15,
    nameAr: "الفيوم",
    tribunals: [
      { id: 68, nameAr: "المحكمة الابتدائية بأبي الجعد", courtType: "NORMAL" },
      { id: 66, nameAr: "المحكمة الابتدائية بخريبكة", courtType: "NORMAL" },
      { id: 67, nameAr: "المحكمة الابتدائية بوادي زم", courtType: "NORMAL" },
    ],
  },
  {
    id: 10,
    nameAr: "القنيطرة",
    tribunals: [
      { id: 4, nameAr: "المحكمة الابتدائية بالقنيطرة", courtType: "NORMAL" },
      { id: 5, nameAr: "المحكمة الابتدائية بسوق أربعاء الغرب", courtType: "NORMAL" },
      { id: 1147, nameAr: "المحكمة الابتدائية بسيدي سليمان", courtType: "NORMAL" },
      { id: 3, nameAr: "المحكمة الابتدائية بسيدي قاسم", courtType: "NORMAL" },
      { id: 2, nameAr: "المحكمة الابتدائية بمشرع بلقصري", courtType: "NORMAL" },
    ],
  },
  {
    id: 17,
    nameAr: "الناضور",
    tribunals: [
      { id: 27, nameAr: "المحكمة الابتدائية بالدريوش", courtType: "NORMAL" },
      { id: 26, nameAr: "المحكمة الابتدائية بالناضور", courtType: "NORMAL" },
    ],
  },
  {
    id: 14,
    nameAr: "بني ملال-خنيفرة",
    tribunals: [
      { id: 60, nameAr: "المحكمة الابتدائية بأزيلال", courtType: "NORMAL" },
      { id: 62, nameAr: "المحكمة الابتدائية بالفقيه بن صالح", courtType: "NORMAL" },
      { id: 63, nameAr: "المحكمة الابتدائية ببني ملال", courtType: "NORMAL" },
      { id: 83, nameAr: "المحكمة الابتدائية بخنيفرة", courtType: "NORMAL" },
      { id: 59, nameAr: "المحكمة الابتدائية بدمنات", courtType: "NORMAL" },
      { id: 58, nameAr: "المحكمة الابتدائية بسوق السبت أولاد النمة", courtType: "NORMAL" },
      { id: 61, nameAr: "المحكمة الابتدائية بقصبة تادلة", courtType: "NORMAL" },
    ],
  },
  {
    id: 23,
    nameAr: "تارودانت",
    tribunals: [
      { id: 57, nameAr: "المحكمة الابتدائية بأولاد تايمة", courtType: "NORMAL" },
      { id: 55, nameAr: "المحكمة الابتدائية بتارودانت", courtType: "NORMAL" },
      { id: 53, nameAr: "المحكمة الابتدائية بطاطا", courtType: "NORMAL" },
    ],
  },
  {
    id: 18,
    nameAr: "تازة",
    tribunals: [
      { id: 64, nameAr: "المحكمة الابتدائية بتازة", courtType: "NORMAL" },
      { id: 65, nameAr: "المحكمة الابتدائية بجرسيف", courtType: "NORMAL" },
    ],
  },
  {
    id: 7,
    nameAr: "تطوان",
    tribunals: [
      { id: 42, nameAr: "المحكمة الابتدائية بالمضيق", courtType: "NORMAL" },
      { id: 41, nameAr: "المحكمة الابتدائية بتطوان", courtType: "NORMAL" },
      { id: 40, nameAr: "المحكمة الابتدائية بشفشاون", courtType: "NORMAL" },
      { id: 39, nameAr: "المحكمة الابتدائية ببوزان", courtType: "NORMAL" },
    ],
  },
  {
    id: 19,
    nameAr: "درعة-تافيلالت",
    tribunals: [
      { id: 13, nameAr: "المحكمة الابتدائية بأرفود", courtType: "NORMAL" },
      { id: 11, nameAr: "المحكمة الابتدائية بالرشيدية", courtType: "NORMAL" },
      { id: 12, nameAr: "المحكمة الابتدائية بالريش", courtType: "NORMAL" },
      { id: 14, nameAr: "المحكمة الابتدائية بميدلت", courtType: "NORMAL" },
    ],
  },
  {
    id: 13,
    nameAr: "سطات",
    tribunals: [
      { id: 29, nameAr: "المحكمة الابتدائية ببرشيد", courtType: "NORMAL" },
      { id: 30, nameAr: "المحكمة الابتدائية ببن أحمد", courtType: "NORMAL" },
      { id: 28, nameAr: "المحكمة الابتدائية بسطات", courtType: "NORMAL" },
    ],
  },
  {
    id: 8,
    nameAr: "سوس-ماسة",
    tribunals: [
      { id: 1099, nameAr: "المحكمة الابتدائية الإدارية بأكادير", courtType: "ADMIN" },
      { id: 1106, nameAr: "المحكمة الابتدائية الإدارية بالداخلة", courtType: "ADMIN" },
      { id: 1108, nameAr: "المحكمة الابتدائية الإدارية بالعيون", courtType: "ADMIN" },
      { id: 1089, nameAr: "المحكمة الابتدائية التجارية بأكادير", courtType: "COMMERCIAL" },
      { id: 1096, nameAr: "المحكمة الابتدائية التجارية بالداخلة", courtType: "COMMERCIAL" },
      { id: 1097, nameAr: "المحكمة الابتدائية التجارية بالعيون", courtType: "COMMERCIAL" },
      { id: 88, nameAr: "المحكمة الابتدائية بأكادير", courtType: "NORMAL" },
      { id: 86, nameAr: "المحكمة الابتدائية بإنزكان", courtType: "NORMAL" },
      { id: 56, nameAr: "المحكمة الابتدائية ببويكرى", courtType: "NORMAL" },
      { id: 54, nameAr: "المحكمة الابتدائية بتزنيت", courtType: "NORMAL" },
    ],
  },
  {
    id: 6,
    nameAr: "طنجة-تطوان-الحسيمة",
    tribunals: [
      { id: 1101, nameAr: "المحكمة الابتدائية الإدارية بطنجة", courtType: "ADMIN" },
      { id: 1092, nameAr: "المحكمة الابتدائية التجارية بطنجة", courtType: "COMMERCIAL" },
      { id: 18, nameAr: "المحكمة الابتدائية بأصيلة", courtType: "NORMAL" },
      { id: 19, nameAr: "المحكمة الابتدائية بالعرائش", courtType: "NORMAL" },
      { id: 16, nameAr: "المحكمة الابتدائية بالقصر الكبير", courtType: "NORMAL" },
      { id: 17, nameAr: "المحكمة الابتدائية بطنجة", courtType: "NORMAL" },
    ],
  },
  {
    id: 3,
    nameAr: "فاس-مكناس",
    tribunals: [
      { id: 1103, nameAr: "المحكمة الابتدائية الإدارية بفاس", courtType: "ADMIN" },
      { id: 1107, nameAr: "المحكمة الابتدائية الإدارية ببوجدة", courtType: "ADMIN" },
      { id: 1093, nameAr: "المحكمة الابتدائية التجارية بفاس", courtType: "COMMERCIAL" },
      { id: 1098, nameAr: "المحكمة الابتدائية التجارية ببوجدة", courtType: "COMMERCIAL" },
      { id: 70, nameAr: "المحكمة الابتدائية لبولمان بميسور", courtType: "NORMAL" },
      { id: 69, nameAr: "المحكمة الابتدائية بتاونات", courtType: "NORMAL" },
      { id: 71, nameAr: "المحكمة الابتدائية بصفرو", courtType: "NORMAL" },
      { id: 72, nameAr: "المحكمة الابتدائية بفاس", courtType: "NORMAL" },
    ],
  },
  {
    id: 21,
    nameAr: "كلميم-واد نون",
    tribunals: [
      { id: 74, nameAr: "المحكمة الابتدائية بسيدي إفني", courtType: "NORMAL" },
      { id: 76, nameAr: "المحكمة الابتدائية بطانطان", courtType: "NORMAL" },
      { id: 73, nameAr: "المحكمة الابتدائية بكلميم", courtType: "NORMAL" },
    ],
  },
  {
    id: 4,
    nameAr: "مراكش-آسفي",
    tribunals: [
      { id: 1100, nameAr: "المحكمة الابتدائية الإدارية ببني ملال", courtType: "ADMIN" },
      { id: 1102, nameAr: "المحكمة الابتدائية الإدارية بمراكش", courtType: "ADMIN" },
      { id: 1090, nameAr: "المحكمة الابتدائية التجارية ببني ملال", courtType: "COMMERCIAL" },
      { id: 1091, nameAr: "المحكمة الابتدائية التجارية بمراكش", courtType: "COMMERCIAL" },
      { id: 79, nameAr: "المحكمة الابتدائية بإمنتانوت", courtType: "NORMAL" },
      { id: 77, nameAr: "المحكمة الابتدائية بابن جرير", courtType: "NORMAL" },
      { id: 80, nameAr: "المحكمة الابتدائية بتحناوت", courtType: "NORMAL" },
      { id: 82, nameAr: "المحكمة الابتدائية بشيشاوة", courtType: "NORMAL" },
      { id: 78, nameAr: "المحكمة الابتدائية بقلعة السراغنة", courtType: "NORMAL" },
      { id: 81, nameAr: "المحكمة الابتدائية بمراكش", courtType: "NORMAL" },
    ],
  },
  {
    id: 5,
    nameAr: "مكناس",
    tribunals: [
      { id: 6, nameAr: "المحكمة الابتدائية بأزرو", courtType: "NORMAL" },
      { id: 8, nameAr: "المحكمة الابتدائية بالحاجب", courtType: "NORMAL" },
      { id: 7, nameAr: "المحكمة الابتدائية بمكناس", courtType: "NORMAL" },
    ],
  },
  {
    id: 20,
    nameAr: "ورزازات",
    tribunals: [
      { id: 43, nameAr: "المحكمة الابتدائية بتنغير", courtType: "NORMAL" },
      { id: 44, nameAr: "المحكمة الابتدائية بزاكورة", courtType: "NORMAL" },
      { id: 45, nameAr: "المحكمة الابتدائية بورزازات", courtType: "NORMAL" },
    ],
  },
];

export function getJudicialRegionByTribunal(tribunal?: string | null) {
  const normalizedTribunal = tribunal?.trim();
  if (!normalizedTribunal) return undefined;

  return JUDICIAL_REGIONS.find((region) =>
    region.tribunals.some(
      (court) => court.nameAr.replace(/\s+/g, " ") === normalizedTribunal.replace(/\s+/g, " ")
    )
  );
}
