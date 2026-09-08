"use client";

import {
  lottieJustice,
  lottieSearch,
  lottieFolder,
  lottieDocument,
  lottieNotification,
  lottieClients,
  lottiePlus,
  lottieClubhouse,
  lottieCalendar,
  lottieClock,
  lottieBook,
} from "./index";

// Correspondance CENTRALISÉE et STRICTE entre chaque fonctionnalité et son icône.
// Tous les composants doivent importer les icônes DEPUIS CE FICHIER, et jamais
// directement depuis d'autres fichiers, afin d'éviter tout mélange d'icônes.
export const icones = {
  justice: lottieJustice, // ⚖️ identité juridique du dashboard
  recherche: lottieSearch, // 🔍 barre de recherche globale
  dossiers: lottieFolder, // 📁 "الملفات" / gestion des dossiers
  documents: lottieDocument, // 📄 "المستندات"
  clients: lottieClients, // 👥 "العملاء"
  notifications: lottieNotification, // 🔔 notifications
  ajouter: lottiePlus, // ➕ ajouter / créer
  bibliotheque: lottieBook, // 📚 "المكتبة القانونية"
  calendrier: lottieCalendar, // 📅 "الجلسات" / rendez-vous
  horloge: lottieClock, // 🕐 "تذكيرات" / rappels
} as const;

// Tailles recommandées (px), adaptées au responsive. Agrandies d'environ 50%
// par rapport aux tailles d'origine, tout en restant proportionnées aux cartes.
export const tailles = {
  navigation: 40,
  recherche: 40,
  carte: 52,
  hero: 64,
  bouton: 48,
  petit: 38,
} as const;
