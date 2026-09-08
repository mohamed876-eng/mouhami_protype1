// Fonctions utilitaires génériques pour le frontend

// Formate une date courte
export function formatDateShort(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("ar-MA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Formate le statut d'un dossier
export function formatCaseStatus(etat: string): string {
  const statusMap: Record<string, string> = {
    en_cours: "قيد المعالجة",
    cloture: "مغلق",
    suspendu: "موقوف",
  };
  return statusMap[etat] || etat;
}

// Formate le statut d'un document
export function formatDocStatus(etat: string): string {
  const statusMap: Record<string, string> = {
    en_attente: "قيد الانتظار",
    valide: "مقبول",
    rejete: "مرفوض",
  };
  return statusMap[etat] || etat;
}

// Couleurs pour les statuts
export function getStatusColor(etat: string): string {
  const colorMap: Record<string, string> = {
    en_cours: "bg-blue-100 text-blue-800",
    cloture: "bg-green-100 text-green-800",
    suspendu: "bg-yellow-100 text-yellow-800",
    valide: "bg-green-100 text-green-800",
    rejete: "bg-red-100 text-red-800",
    en_attente: "bg-yellow-100 text-yellow-800",
    planifiee: "bg-blue-100 text-blue-800",
    tenue: "bg-green-100 text-green-800",
    reportee: "bg-yellow-100 text-yellow-800",
    annulee: "bg-red-100 text-red-800",
    actif: "bg-green-100 text-green-800",
    inactif: "bg-gray-100 text-gray-800",
  };
  return colorMap[etat] || "bg-gray-100 text-gray-800";
}
