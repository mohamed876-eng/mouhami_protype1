// Types TypeScript partagés pour tout le frontend

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  telephone?: string;
  role: "admin" | "client";
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface Client {
  id: string;
  nom: string;
  prenom: string;
  cin: string;
  telephone: string;
  adresse?: string;
  ville?: string;
  profession?: string;
  photo?: string;
  email?: string;
  statut: string;
  observations?: string;
  createdAt: string;
  _count?: {
    cases: number;
  };
  cases?: Case[];
}

export interface Case {
  id: string;
  reference: string;
  mahakimRef?: string;
  tribunal?: string;
  type: string;
  sousType?: string;
  dateCreation: string;
  etat: string;
  description?: string;
  notes?: string;
  progress: number;
  createdAt: string;
  client: Client;
  template?: CaseTemplate;
  caseType?: CaseType;
  documents: Document[];
  checklist: CaseChecklistItem[];
  hearings: Hearing[];
  payments: Payment[];
  activities: Activity[];
  _count?: {
    documents: number;
    hearings: number;
  };
}

export interface CaseTemplate {
  id: string;
  nom: string;
  slug: string;
  description?: string;
  documents: CaseTemplateDocument[];
  _count?: { cases: number };
}

export interface CaseTemplateDocument {
  id: string;
  nom: string;
  obligatoire: boolean;
  ordre: number;
}

export interface CaseChecklistItem {
  id: string;
  nom: string;
  obligatoire: boolean;
  ordre: number;
  coche: boolean;
}

export interface DocumentType {
  id: string;
  nom: string;
  slug: string;
  icon?: string;
}

export interface CaseType {
  id: string;
  nameAr: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  documents: CaseTypeDocument[];
  _count?: { cases: number };
}

export interface CaseTypeDocument {
  id: string;
  nameAr: string;
  description?: string;
  isRequired: boolean;
  order: number;
  createdAt: string;
}

export interface Document {
  id: string;
  nom: string;
  description?: string;
  fileName: string;
  filePath: string;
  fileSize?: number;
  auteur?: string;
  etat: string;
  commentaires?: string;
  uploadedAt: string;
  isClientVisible: boolean;
  type?: DocumentType;
  checklistItemId?: string;
  cas?: { reference: string; client: Client };
}

export interface Hearing {
  id: string;
  date: string;
  heure?: string;
  type?: string;
  tribunal?: string;
  salle?: string;
  juge?: string;
  statut: string;
  notes?: string;
  cas?: { reference: string; client: { nom: string; prenom: string } };
}

export interface Notification {
  id: string;
  titre: string;
  message: string;
  type: string;
  lu: boolean;
  referenceType?: string;
  referenceId?: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  description?: string;
  metadata?: any;
  createdAt: string;
  user: { nom: string; prenom: string };
}

export interface Payment {
  id: string;
  montant: number;
  date: string;
  mode: string;
  reference?: string;
  notes?: string;
}

export type EventType = "RENDEZ_VOUS" | "AUDIENCE" | "TACHE" | "ECHEANCE";
export type Priority = "FAIBLE" | "NORMALE" | "IMPORTANTE" | "URGENTE";

export interface ReminderEvent {
  id: string;
  userId: string;
  title: string;
  description?: string;
  clientId?: string;
  caseId?: string;
  type: EventType;
  date: string;
  time?: string;
  lieu?: string;
  priority: Priority;
  createdAt: string;
  client?: Client;
  cas?: Case;
  reminders?: Reminder[];
}

export interface Reminder {
  id: string;
  eventId: string;
  userId: string;
  title: string;
  description?: string;
  remindAt: string;
  notified: boolean;
  dismissed: boolean;
  event: ReminderEvent;
}

export interface SearchResult {
  query: string;
  totalResults: number;
  clients: Client[];
  cases: Case[];
  documents: Document[];
  caseTypes: CaseType[];
  casesWithMissingDocs: Case[];
}

export interface DashboardData {
  stats: {
    clients: number;
    cases: number;
    audiences: number;
    documentsEnAttente: number;
  };
  casesByEtat: Record<string, number>;
  recentActivities: Activity[];
  recentCases: Case[];
  upcomingHearings: Hearing[];
  notifications: {
    unread: number;
  };
}
