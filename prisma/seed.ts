import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const noms = [
  "العلوي", "الشرقاوي", "الحمداوي", "المنصوري", "القابسي",
  "الفاسي", "التازي", "الحسني", "المرابط", "البلجي", "العلمي",
  "الودغيري", "الإدريسي", "الشرifi", "البوعزيزي", "الكريمي", "الناصري",
  "الخياطي", "العطاتي", "الشركي", "البوزيدي", "العبادي", "الداودي",
  "السملالي", "الخالدي", "البوحة", "الغازي", "الزناكي", "الموذني",
  "البركة", "الحدادي", "الكعبي", "الفيلالي", "النجاري", "العمري",
  "السكاكي", "الحريري", "الخضراوي", "الشمسي", "العلبوري", "القروي",
  "الزروالي", "البردوعي", "الخنفري", "المسعودي", "الجبلي",
];

const prenoms = [
  "أحمد", "محمد", "عبد الله", "حسن", "إدريس", "كريم",
  "ياسين", "أنس", "حمزة", "سفيان", "عمر", "خالد",
  "طارق", "زكرياء", "جمال", "رشيد", "عزيز",
  "منصف", "عادل", "نور الدين", "هشام", "عبد الرحمن",
  "فاطمة الزهراء", "أسماء", "سناء", "لطيفة", "مريم", "حنان",
  "سارة", "نادية", "كريمة", "وجدان", "إيمان", "بشرى",
  "هند", "سمية", "هدى", "خلود", "ابتسام", "سعاد",
  "منى", "رقية", "زهرة", "ندى", "لبنى",
  "محمد أمين", "يوسف", "عبد الإله", "وليد", "بدر", "ريان",
  "أيوب", "ماهر", "نبيل", "سامي", "أسامة",
];

const villes = [
  "الدار البيضاء", "الرباط", "مراكش", "فاس", "طنجة", "أكادير",
  "مكناس", "وجدة", "القنيطرة", "آسفي", "تطوان", "الحسيمة",
  "بني ملال", "سطات", "الجديدة", "الناظور", "قلعة السراغنة",
  "العيون", "الداخلة", "ورزازات", "زاكورة", "تنغير", "تازة",
  "بركان", "الصويرة",
];

const quartiers = [
  "المسيرة", "المنار", "الحي الحسني", "الواحة", "الزهراء",
  "سيدي مومن", "عين الذئاب", "المعاريف", "الجليزة", "القصور",
  "المدينة القديمة", "الحي المحمدي", "بن سلمان", "السالمية",
  "الأطلس", "النهضة", "الحمراء", "الوداد", "الدار البيضاء القديمة",
];

const professions = [
  "تاجر", "مهندس", "طبيب", "أستاذ", "موظف بنك", "موظفة حكومية",
  "حرفي", "رجل أعمال", "محاسب", "مهندس معماري", "محامي",
  "طبيب أسنان", " إطار بنكي", "مدير شركة", "صاحب مقاولة",
  "سائق", "متقاعد", "طالب", "نجار", "حداد", "خياط", "بقال",
];

const tribunaux = [
  "المحكمة الابتدائية بالدار البيضاء",
  "المحكمة الابتدائية بالرباط",
  "المحكمة الابتدائية بمراكش",
  "المحكمة الابتدائية بفاس",
  "المحكمة الابتدائية بطنجة",
  "المحكمة الابتدائية بأكادير",
  "محكمة الاستئناف بالدار البيضاء",
  "محكمة الاستئناف بالرباط",
  "محكمة الاستئناف بمراكش",
  "محكمة الاستئناف بفاس",
  "المحكمة التجارية بالدار البيضاء",
  "المحكمة التجارية بالرباط",
  "محكمة الأسرة بالدار البيضاء",
  "محكمة الأسرة بالرباط",
  "محكمة الأسرة بمراكش",
  "المحكمة الإدارية بالرباط",
  "المحكمة الإدارية بالدار البيضاء",
];

const juges = [
  "ال судة الحسن بن عمر",
  "ال судة فاطمة الزهراء أفيلال",
  "ال судة محمد الإدريسي",
  "ال судة كريم بوخريصة",
  "ال судة عبد الله المسعودي",
  "ال судة نادية بالفقيه",
  "ال судة إبراهيم الشرقاوي",
  "ال судة سعيدة العلوي",
  "ال судة يوسف التازي",
  "ال судة خديجة المرابط",
  "ال судة عادل البوعزيزي",
  "ال судة هشام الك庸",
];

const CLIENT_COUNT = 45;
let caseCounter = 0;

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomPhone(): string {
  const prefix = pick(["06", "07", "05"]);
  let num = "";
  for (let i = 0; i < 8; i++) num += Math.floor(Math.random() * 10);
  return prefix + num;
}

function randomCIN(): string {
  let num = "";
  for (let i = 0; i < 6; i++) num += Math.floor(Math.random() * 10);
  return num + pick(["1", "2"]);
}

function generateRef(): string {
  caseCounter++;
  const year = 2024 + Math.floor(Math.random() * 3);
  const pad = String(caseCounter).padStart(4, "0");
  return `CAB/${year}/${pad}`;
}

function generateMahakimRef(): string {
  const prefix = pick(["A", "B", "C", "D"]);
  const num = Math.floor(Math.random() * 5) + 1;
  const suffix = Math.floor(Math.random() * 9000 + 1000);
  return `MHD/${prefix}/${num}/${suffix}`;
}

const caseTypeArabic = [
  "القضايا المدنية", "القضايا الجنائية", "القضايا التجارية", "قضايا الأسرة",
  "القضايا العقارية", "القضايا الإدارية", "قضايا الشغل", "قضايا التنفيذ",
  "قضايا الإرث", "قضايا الكراء", "حوادث السير", "الطلاق", "النفقة",
  "الحضانة", "السرقة", "النصب", "خيانة الأمانة", "الشيكات", "الشركات",
];

const caseDescriptions = [
  "مطالبة بأداء ثمن بضاعة",
  "شكوى في حق مجهول",
  "طلب طلاق لسبب مشروع",
  "طلب نفقة أطفال",
  "نزاع عقاري حول ملكية أرض",
  "عقد كراء غير محترم",
  "طلب حضانة أطفال",
  "مطالبة بتعويض عن حادثة سير",
  "قضية شيك بدون رصيد",
  "دعوى استرجاع مبلغ مالي",
  "طلب تفويض حق السكنى",
  "نزاع تجاري بين شريكين",
  "case de harcèlement moral au travail",
  "succession contestée",
  "prise en charge alimentaire",
  "opposition à exécution",
  " demande de dommages-intérêts",
  "contentieux fiscal",
  "recours contre décision administrative",
  "دعوى إخلاء محل تجاري",
];

const hearingTypes = ["أولى", "استئناف", "نفاذ", "تحقيق", "تأديب"];
const hearingStatuses = ["planifiee", "tenue", "reportee", "annulee"] as const;
const paymentModes = ["especes", "cheques", "virement"] as const;
const caseStatuses = ["en_cours", "cloture", "suspendu"] as const;
const docStatuses = ["en_attente", "valide", "rejete"] as const;

async function connectWithRetry(maxRetries = 10, delayMs = 3000): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await prisma.$connect();
      await prisma.$executeRawUnsafe(`SELECT 1`);
      console.log("Connected to database");
      return;
    } catch (e: any) {
      console.log(`Connection attempt ${i + 1}/${maxRetries} failed: ${e.message?.slice(0, 80)}`);
      if (i < maxRetries - 1) {
        console.log(`Retrying in ${delayMs / 1000}s...`);
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }
  throw new Error("Failed to connect after maximum retries");
}

async function ensureConnection(): Promise<void> {
  try {
    await prisma.$executeRawUnsafe(`SELECT 1`);
  } catch {
    console.log("  Connection lost, reconnecting...");
    await prisma.$disconnect();
    await connectWithRetry(5, 3000);
  }
}

async function main() {
  await connectWithRetry();
  console.log("Resetting database...");
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "reminders",
      "reminder_events",
      "notifications",
      "activities",
      "payments",
      "documents",
      "case_checklist_items",
      "case_template_documents",
      "case_type_documents",
      "hearings",
      "cases",
      "clients",
      "users",
      "case_templates",
      "case_types",
      "document_types",
      "settings"
    CASCADE
  `);
  console.log("Database reset\n");

  // 1. Case Types
  console.log("Creating case types...");
  const caseTypesData = [
    { nameAr: "القضايا المدنية", description: "القضايا المدنية بأنواعها", docs: ["البطاقة الوطنية", "وكالة", "العقود", "المراسلات", "المذكرات"] },
    { nameAr: "القضايا الجنائية", description: "القضايا الجنائية والجنايات", docs: ["البطاقة الوطنية", "وكالة", "محضر الشرطة", "شهادة طبية", "صور"] },
    { nameAr: "القضايا التجارية", description: "القضايا التجارية وقضايا الشركات", docs: ["البطاقة الوطنية", "السجل التجاري", "العقود", "وكالة", "الفواتير"] },
    { nameAr: "قضايا الأسرة", description: "قضايا الأسرة والأحوال الشخصية", docs: ["البطاقة الوطنية", "عقد الزواج", "شهادة الميلاد", "وكالة", "شهادة السكنى"] },
    { nameAr: "القضايا العقارية", description: "قضايا العقار والملكية", docs: ["البطاقة الوطنية", "عقد الملكية", "الرسوم العقارية", "وكالة", "المخططات"] },
    { nameAr: "القضايا الإدارية", description: "قضايا الإدارة والمجالس", docs: ["البطاقة الوطنية", "القرار الإداري", "وكالة", "المذكرات"] },
    { nameAr: "قضايا الشغل", description: "قضايا الشغل والعمل", docs: ["البطاقة الوطنية", "عقد العمل", "وكالة", "كشف الراتب", "المقررات"] },
    { nameAr: "قضايا التنفيذ", description: "قضايا التنفيذ الجبري", docs: ["البطاقة الوطنية", "الحكم", "وكالة", "المحاضر", "الإنذارات"] },
    { nameAr: "قضايا الإرث", description: "قضايا الإرث والميراث", docs: ["البطاقة الوطنية", "شهادة الوفاة", "عقد الملكية", "وكالة", "شهادة الميلاد"] },
    { nameAr: "قضايا الكراء", description: "قضايا الكراء والإيجار", docs: ["البطاقة الوطنية", "عقد الكراء", "وكالة", "الإنذارات", "المحاضر"] },
    { nameAr: "حوادث السير", description: "قضايا حوادث السير", docs: ["البطاقة الوطنية", "محضر الشرطة", "شهادة طبية", "صور", "تقرير الخبرة"] },
    { nameAr: "الطلاق", description: "قضايا الطلاق والتطليق", docs: ["البطاقة الوطنية", "عقد الزواج", "شهادة السكنى", "وكالة", "المقال الافتتاحي"] },
    { nameAr: "النفقة", description: "قضايا النفقة", docs: ["البطاقة الوطنية", "عقد الزواج", "شهادة الميلاد", "كشف الراتب", "وكالة"] },
    { nameAr: "الحضانة", description: "قضايا الحضانة", docs: ["البطاقة الوطنية", "عقد الزواج", "شهادة الميلاد", "شهادة السكنى", "وكالة"] },
    { nameAr: "السرقة", description: "قضايا السرقة والنشل", docs: ["البطاقة الوطنية", "وكالة", "محضر الشرطة", "صور", "شكاية"] },
    { nameAr: "النصب", description: "قضايا النصب والاحتيال", docs: ["البطاقة الوطنية", "وكالة", "محضر الشرطة", "العقود", "الفواتير", "شكاية"] },
    { nameAr: "خيانة الأمانة", description: "قضايا خيانة الأمانة", docs: ["البطاقة الوطنية", "وكالة", "العقود", "المحاضر", "شكاية"] },
    { nameAr: "الشيكات", description: "قضايا الشيكات", docs: ["البطاقة الوطنية", "وكالة", "الشيك", "محضر الشرطة", "كشف الحساب"] },
    { nameAr: "الشركات", description: "قضايا الشركات", docs: ["البطاقة الوطنية", "السجل التجاري", "عقد التأسيس", "وكالة", "القوائم المالية"] },
  ];

  const createdCaseTypes = [];
  for (const ct of caseTypesData) {
    const created = await prisma.caseType.create({
      data: {
        nameAr: ct.nameAr,
        description: ct.description,
        documents: { create: ct.docs.map((d, i) => ({ nameAr: d, isRequired: true, order: i + 1 })) },
      },
    });
    createdCaseTypes.push(created);
  }
  console.log(`  ${createdCaseTypes.length} case types created`);

  // 2. Templates
  console.log("Creating templates...");
  const templatesData = [
    { nom: "سرقة", slug: "vol", docs: ["البطاقة الوطنية", "وكالة", "محضر السرقة", "صور", "شهادة طبية", "تقارير الشرطة"] },
    { nom: "طلاق", slug: "divorce", docs: ["البطاقة الوطنية", "عقد الزواج", "وكالة", "شهادة الميلاد", "كشف الراتب", "صور"] },
    { nom: "إرث", slug: "succession", docs: ["البطاقة الوطنية", "شهادة الوفاة", "عقد الملكية", "وكالة", "شهادة الميلاد", "رسم الإرث"] },
    { nom: "قضية تجارية", slug: "commercial", docs: ["البطاقة الوطنية", "السجل التجاري", "العقود", "وكالة", "الفواتير", "المراسلات"] },
    { nom: "قضية شغل", slug: "travail", docs: ["البطاقة الوطنية", "عقد العمل", "وكالة", "كشف الراتب", "المقررات", "الإشعارات"] },
    { nom: "عقار", slug: "immobilier", docs: ["البطاقة الوطنية", "عقد الملكية", "الرسوم العقارية", "وكالة", "المخططات", "صور"] },
    { nom: "قضية إدارية", slug: "administratif", docs: ["البطاقة الوطنية", "القرار الإداري", "وكالة", "المذكرات", "المراسلات"] },
    { nom: "حوادث سير", slug: "accident-circulation", docs: ["البطاقة الوطنية", "محضر الشرطة", "شهادة طبية", "صور", "تقرير الخبرة"] },
    { nom: "نفقة", slug: "pension-alimentaire", docs: ["البطاقة الوطنية", "عقد الزواج", "شهادة الميلاد", "كشف الراتب", "شهادة السكنى"] },
    { nom: "حضانة", slug: "garde-enfants", docs: ["البطاقة الوطنية", "عقد الزواج", "شهادة الميلاد", "شهادة السكنى", "شهود"] },
  ];

  const createdTemplates = [];
  for (const t of templatesData) {
    const created = await prisma.caseTemplate.create({
      data: {
        nom: t.nom,
        slug: t.slug,
        description: `قالب قضية ${t.nom}`,
        documents: { create: t.docs.map((d, i) => ({ nom: d, obligatoire: true, ordre: i + 1 })) },
      },
    });
    createdTemplates.push(created);
  }
  console.log(`  ${createdTemplates.length} templates created`);

  // 3. Document Types
  console.log("Creating document types...");
  const docTypesData = [
    { nom: "البطاقة الوطنية", slug: "carte-nationale", icon: "id-card" },
    { nom: "وكالة", slug: "procuration", icon: "file-signature" },
    { nom: "عقد الزواج", slug: "contrat-mariage", icon: "file-contract" },
    { nom: "عقد الملكية", slug: "titre-propriete", icon: "file-contract" },
    { nom: "عقد الكراء", slug: "contrat-location", icon: "file-contract" },
    { nom: "عقد العمل", slug: "contrat-travail", icon: "file-contract" },
    { nom: "شهادة الميلاد", slug: "certificat-naissance", icon: "certificate" },
    { nom: "شهادة السكنى", slug: "certificat-residence", icon: "certificate" },
    { nom: "شهادة الوفاة", slug: "certificat-deces", icon: "certificate" },
    { nom: "شهادة طبية", slug: "certificat-medical", icon: "certificate" },
    { nom: "محضر الشرطة", slug: "proces-verbal", icon: "file-lines" },
    { nom: "صور", slug: "photos", icon: "image" },
    { nom: "شهود", slug: "temoins", icon: "users" },
    { nom: "السجل التجاري", slug: "registre-commerce", icon: "file" },
    { nom: "الفواتير", slug: "factures", icon: "file-invoice" },
    { nom: "المراسلات", slug: "correspondance", icon: "envelope" },
    { nom: "المذكرات", slug: "memoires", icon: "file-lines" },
    { nom: "المقررات", slug: "decisions", icon: "gavel" },
    { nom: "الإنذارات", slug: "avertissements-legaux", icon: "exclamation" },
    { nom: "المحاضر", slug: "proces-verbaux", icon: "file" },
    { nom: "الشيك", slug: "cheque", icon: "money-bill" },
    { nom: "كشف الحساب", slug: "releve-compte", icon: "file" },
    { nom: "القوائم المالية", slug: "etats-financiers", icon: "chart-bar" },
    { nom: "الحكم", slug: "jugement", icon: "gavel" },
    { nom: "رسم الإرث", slug: "acte-succession", icon: "file" },
    { nom: "تقرير الخبرة", slug: "rapport-expertise", icon: "file" },
    { nom: "شكاية", slug: "plainte", icon: "file" },
    { nom: "المقال الافتتاحي", slug: "article-introductif", icon: "file" },
    { nom: "القرار الإداري", slug: "decision-administrative", icon: "file" },
    { nom: "عقد التأسيس", slug: "acte-constitution", icon: "file-contract" },
    { nom: "محاضر الجمعيات", slug: "pv-assemblees", icon: "file" },
    { nom: "المخططات", slug: "plans", icon: "draw-polygon" },
    { nom: "كشف الراتب", slug: "bulletin-salaire", icon: "money-bill" },
    { nom: "الرسوم العقارية", slug: "frais-notariaux", icon: "file" },
  ];

  for (const dt of docTypesData) {
    await prisma.documentType.create({ data: dt });
  }
  console.log(`  ${docTypesData.length} document types created`);

  // 4. Users + Clients
  console.log("Creating admin users...");
  const adminPassword = await bcrypt.hash("admin123", 12);

  await prisma.user.create({
    data: { email: "admin@cabinet.ma", password: adminPassword, nom: "العلوي", prenom: "أحمد", telephone: "0612345678", role: "admin" },
  });
  await prisma.user.create({
    data: { email: "avocat@cabinet.ma", password: adminPassword, nom: "الشرقاوي", prenom: "محمد", telephone: "0698765432", role: "admin" },
  });
  await prisma.user.create({
    data: { email: "stagiaire@cabinet.ma", password: adminPassword, nom: "الفاسي", prenom: "سارة", telephone: "0654321098", role: "admin" },
  });

  console.log("  3 admin users created");

  console.log(`Creating ${CLIENT_COUNT} clients...`);
  const createdClients = [];

  for (let i = 0; i < CLIENT_COUNT; i++) {
    const nom = pick(noms);
    const prenom = pick(prenoms);
    const email = `client${i + 1}@example.com`;
    const statut = Math.random() > 0.15 ? "actif" : "inactif";
    const createdAt = randomDate(new Date("2023-01-01"), new Date("2026-06-01"));

    const client = await prisma.client.create({
      data: {
        nom,
        prenom,
        cin: randomCIN(),
        telephone: randomPhone(),
        adresse: `${pick(villes)}, Hay ${pick(quartiers)}, Nr ${Math.floor(Math.random() * 200 + 1)}`,
        ville: pick(villes),
        profession: pick(professions),
        email,
        statut,
        observations: Math.random() > 0.7
          ? pick(["Client fidele", "Necessite suivi special", "Reference par ami", "Procedure prealable", "Collaborateur actif"])
          : null,
        createdAt,
        updatedAt: createdAt,
      },
    });

    await prisma.user.create({
      data: {
        email,
        password: await bcrypt.hash("client123", 12),
        nom,
        prenom,
        telephone: randomPhone(),
        role: "client",
        clientId: client.id,
        createdAt,
        updatedAt: createdAt,
        lastLogin: Math.random() > 0.4 ? randomDate(new Date("2026-01-01"), new Date()) : null,
      },
    });

    createdClients.push(client);
  }
  console.log(`  ${CLIENT_COUNT} clients + user accounts created`);

  // 5. Cases
  console.log("Creating cases...");
  const allCases: { id: string; clientId: string; templateId: string | null }[] = [];

  for (const client of createdClients) {
    const caseCount = Math.floor(Math.random() * 4) + 1;

    for (let j = 0; j < caseCount; j++) {
      const template = pick(createdTemplates);
      const caseType = pick(createdCaseTypes);
      const etat = pick(caseStatuses);
      const progress = etat === "cloture" ? 100 : etat === "suspendu" ? Math.floor(Math.random() * 50) : Math.floor(Math.random() * 85) + 10;
      const createdAt = randomDate(new Date("2023-06-01"), new Date("2026-05-01"));

      const c = await prisma.case.create({
        data: {
          reference: generateRef(),
          mahakimRef: Math.random() > 0.3 ? generateMahakimRef() : null,
          tribunal: pick(tribunaux),
          type: caseType.nameAr,
          sousType: Math.random() > 0.5 ? caseType.nameAr : null,
          dateCreation: createdAt,
          etat,
          description: pick(caseDescriptions),
          notes: Math.random() > 0.6
            ? pick(["Follow up needed", "Deadline important", "Documents pending", "Expert assigned", "Case complicated"])
            : null,
          progress,
          createdAt,
          updatedAt: createdAt,
          clientId: client.id,
          templateId: template.id,
          caseTypeId: caseType.id,
        },
      });
      allCases.push({ id: c.id, clientId: client.id, templateId: template.id });
    }
  }
  console.log(`  ${allCases.length} cases created`);

  // 6. Checklist Items
  console.log("Creating checklist items...");
  let checklistCount = 0;
  for (const c of allCases) {
    if (!c.templateId) continue;
    await ensureConnection();
    const tmplDocs = await prisma.caseTemplateDocument.findMany({
      where: { templateId: c.templateId },
      orderBy: { ordre: "asc" },
    });

    for (const doc of tmplDocs) {
      await prisma.caseChecklistItem.create({
        data: {
          nom: doc.nom,
          obligatoire: doc.obligatoire,
          ordre: doc.ordre,
          coche: Math.random() > 0.4,
          casId: c.id,
        },
      });
      checklistCount++;
    }
  }
  console.log(`  ${checklistCount} checklist items created`);

  // 7. Documents
  console.log("Creating documents...");
  let docCount = 0;
  const docTypes = await prisma.documentType.findMany();
  const fileNames = [
    "scan_carte_nationale.pdf", "contrat_signe.pdf", "decision_tribunal.pdf",
    "pv_police.pdf", "certificat_medical.pdf", "photo_lieu.pdf",
    "temoignage.pdf", "facture.pdf", "correspondance.pdf", "memoire.pdf",
    "jugement.pdf", "ordonnance.pdf", "expertise.pdf", "cheque.pdf",
    "releve_bancaire.pdf", "acte_notarie.pdf", "plan_cadastral.pdf",
    "bulletin_salaire.pdf", "contrat_travail.pdf", "plainte.pdf",
  ];

  for (const c of allCases) {
    await ensureConnection();
    const docCountForCase = Math.floor(Math.random() * 8) + 1;
    const checklistItems = await prisma.caseChecklistItem.findMany({ where: { casId: c.id } });

    for (let k = 0; k < docCountForCase; k++) {
      const docType = pick(docTypes);
      const etat = pick(docStatuses);
      const uploadedAt = randomDate(new Date("2024-01-01"), new Date());
      const checkItem = checklistItems.length > 0 ? pick(checklistItems) : null;

      await prisma.document.create({
        data: {
          nom: docType.nom,
          description: `Document lie au dossier`,
          fileName: `${docType.slug}_${k}.pdf`,
          filePath: `/uploads/${docType.slug}_${k}.pdf`,
          fileSize: Math.floor(Math.random() * 5000000) + 50000,
          auteur: pick(["Client", "Avocat", "Tribunal"]),
          etat,
          commentaires: etat === "rejete"
            ? pick(["Document illisible", "Non conforme", "Remplissage incorrect", " expire"])
            : null,
          uploadedAt,
          isClientVisible: Math.random() > 0.2,
          casId: c.id,
          typeId: docType.id,
          checklistItemId: checkItem?.id || null,
        },
      });
      docCount++;
    }
  }
  console.log(`  ${docCount} documents created`);

  // 8. Hearings
  console.log("Creating hearings...");
  let hearingCount = 0;
  for (const c of allCases) {
    await ensureConnection();
    const hearingCountForCase = Math.floor(Math.random() * 6);

    for (let h = 0; h < hearingCountForCase; h++) {
      const date = randomDate(new Date("2024-06-01"), new Date("2027-06-01"));
      const statut = pick(hearingStatuses);

      await prisma.hearing.create({
        data: {
          date,
          heure: `${pick(["09", "10", "11", "14", "15"])}:${pick(["00", "30"])}`,
          type: pick(hearingTypes),
          tribunal: pick(tribunaux),
          salle: `Salle ${pick(["1", "2", "3", "4", "5", "A", "B", "C"])}`,
          juge: pick(juges),
          statut,
          notes: statut === "reportee"
            ? pick(["Adjournment by opposing party", "Judge unavailable", "Expert report pending"])
            : statut === "annulee"
            ? pick(["Strike cancellation", "Holiday cancellation"])
            : null,
          casId: c.id,
        },
      });
      hearingCount++;
    }
  }
  console.log(`  ${hearingCount} hearings created`);

  // 9. Payments
  console.log("Creating payments...");
  let paymentCount = 0;
  for (const c of allCases) {
    await ensureConnection();
    const paymentCountForCase = Math.floor(Math.random() * 5);

    for (let p = 0; p < paymentCountForCase; p++) {
      const montant = pick([500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 5000, 7500, 10000, 15000, 20000]);

      await prisma.payment.create({
        data: {
          montant,
          date: randomDate(new Date("2024-01-01"), new Date()),
          mode: pick(paymentModes as unknown as string[]),
          reference: Math.random() > 0.5 ? `PAY-${Math.floor(Math.random() * 90000 + 10000)}` : null,
          notes: pick(["Premier versement", "Deuxieme versement", "Paiement final", "Acompte", "Honoraires", "Frais de tribunal", "Indemnite"]),
          casId: c.id,
        },
      });
      paymentCount++;
    }
  }
  console.log(`  ${paymentCount} payments created`);

  // 10. Notifications
  console.log("Creating notifications...");
  let notifCount = 0;
  const allUsers = await prisma.user.findMany({ select: { id: true, role: true } });

  for (const user of allUsers) {
    await ensureConnection();
    for (let n = 0; n < 8; n++) {
      const type = pick(["audience", "document", "dossier", "paiement"]);
      const lu = Math.random() > 0.4;

      await prisma.notification.create({
        data: {
          titre: pick(["Audience a venir", "Document recu", "Mise a jour dossier", "Paiement recu", "Rappel audience", "Document manquant"]),
          message: pick(["Audience prevue la semaine prochaine", "Nouveau document telecharge", "Dossier mis a jour", "Paiement enregistre", "Rappel: audience dans 3 jours"]),
          type,
          lu,
          referenceType: pick(["Case", "Hearing", "Document", "Payment"]),
          referenceId: allCases.length > 0 ? pick(allCases).id : null,
          userId: user.id,
        },
      });
      notifCount++;
    }
  }
  console.log(`  ${notifCount} notifications created`);

  // 11. Activities
  console.log("Creating activities...");
  let activityCount = 0;

  for (const user of allUsers) {
    await ensureConnection();
    for (let a = 0; a < 15; a++) {
      const action = pick(["creation", "modification", "upload", "download", "export", "login"]);
      const entity = pick(["client", "case", "document", "hearing", "payment"]);
      const theCase = allCases.length > 0 ? pick(allCases) : null;

      await prisma.activity.create({
        data: {
          action,
          entity,
          entityId: theCase?.id || null,
          description: `Action ${action} sur ${entity}`,
          metadata: { source: "seed", automated: false },
          userId: user.id,
          casId: theCase?.id || null,
        },
      });
      activityCount++;
    }
  }
  console.log(`  ${activityCount} activities created`);

  // 12. Reminder Events + Reminders
  console.log("Creating reminder events...");
  let eventCount = 0;
  let reminderCount = 0;
  const adminUsers = allUsers.filter((u) => u.role === "admin");

  for (let e = 0; e < 80; e++) {
    const user = pick(adminUsers);
    const theCase = allCases.length > 0 ? pick(allCases) : null;
    const client = createdClients.length > 0 ? pick(createdClients) : null;
    const date = randomDate(new Date("2026-01-01"), new Date("2027-12-31"));
    const type = pick(["AUDIENCE", "RENDEZ_VOUS", "TACHE", "ECHEANCE"] as const);
    const priority = pick(["FAIBLE", "NORMALE", "IMPORTANTE", "URGENTE"] as const);

    const event = await prisma.reminderEvent.create({
      data: {
        userId: user.id,
        title: pick(["Audience Tribunal", "Rendez-vous client", "Depot dossier", "Echeance paiement", "Reunion cabinet", "Signature contrat"]),
        description: pick(["Preparer les documents", "Amener les pieces originales", "Confirmer la presence", "Preparer la plaidoirie"]),
        clientId: client?.id || null,
        caseId: theCase?.id || null,
        type,
        date,
        time: `${pick(["09", "10", "11", "14", "15", "16"])}:${pick(["00", "30"])}`,
        lieu: pick(["Tribunal", "Cabinet", "Client office", "Mediation center"]),
        priority,
      },
    });
    eventCount++;

    const offsets = [
      { days: -7, label: "J-7" },
      { days: -3, label: "J-3" },
      { days: -1, label: "J-1" },
      { hours: -2, label: "H-2" },
      { minutes: -30, label: "M-30" },
    ];

    for (const offset of offsets) {
      const remindAt = new Date(date);
      if ("days" in offset) remindAt.setDate(remindAt.getDate() + (offset as { days: number }).days);
      if ("hours" in offset) remindAt.setHours(remindAt.getHours() + (offset as { hours: number }).hours);
      if ("minutes" in offset) remindAt.setMinutes(remindAt.getMinutes() + (offset as { minutes: number }).minutes);

      await prisma.reminder.create({
        data: {
          eventId: event.id,
          userId: user.id,
          title: `${event.title} (${offset.label})`,
          description: event.description,
          remindAt,
          notified: remindAt < new Date(),
          dismissed: Math.random() > 0.7 && remindAt < new Date(),
        },
      });
      reminderCount++;
    }
  }
  console.log(`  ${eventCount} reminder events created`);
  console.log(`  ${reminderCount} reminders created`);

  // 13. Settings
  console.log("Creating settings...");
  const settings = [
    { key: "cabinet_nom", value: "Cabinet Maître Ahmed Alaoui" },
    { key: "cabinet_adresse", value: "Avenue Hassan II, Casablanca, 3e etage Nr 12" },
    { key: "cabinet_telephone", value: "0522123456" },
    { key: "cabinet_email", value: "contact@cabinet-alaoui.ma" },
    { key: "cabinet_ville", value: "Casablanca" },
    { key: "cabinet_siret", value: "12345678901234" },
    { key: "cabinet_barreau", value: "Barreau de Casablanca" },
    { key: "theme_color", value: "#1e3a5f" },
    { key: "language", value: "ar" },
    { key: "timezone", value: "Africa/Casablanca" },
  ];

  for (const s of settings) {
    await prisma.setting.create({ data: s });
  }
  console.log(`  ${settings.length} settings created`);

  // Summary
  console.log("\n========================================");
  console.log("Seed termine avec succes !");
  console.log("========================================");
  console.log(`  Case types:          ${createdCaseTypes.length}`);
  console.log(`  Templates:           ${createdTemplates.length}`);
  console.log(`  Document types:      ${docTypesData.length}`);
  console.log(`  Users (admins):      3`);
  console.log(`  Clients:             ${CLIENT_COUNT}`);
  console.log(`  Cases:               ${allCases.length}`);
  console.log(`  Checklist items:     ${checklistCount}`);
  console.log(`  Documents:           ${docCount}`);
  console.log(`  Hearings:            ${hearingCount}`);
  console.log(`  Payments:            ${paymentCount}`);
  console.log(`  Notifications:       ${notifCount}`);
  console.log(`  Activities:          ${activityCount}`);
  console.log(`  Reminder events:     ${eventCount}`);
  console.log(`  Reminders:           ${reminderCount}`);
  console.log(`  Settings:            ${settings.length}`);
  console.log("========================================");
  console.log("\n  Admin:  admin@cabinet.ma / admin123");
  console.log("  Avocat: avocat@cabinet.ma / admin123");
  console.log("  Client: client1@example.com / client123");
  console.log("========================================\n");
}

main()
  .catch((e) => {
    console.error("Erreur seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
