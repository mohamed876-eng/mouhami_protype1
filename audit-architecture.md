# Audit Architectural et Explication Détaillée des Fichiers du Projet "Mouhami"

Ce document fournit un inventaire exhaustif et une explication détaillée de l'ensemble des fichiers composants le projet **Mouhami** (Système de Gestion de Cabinet d'Avocat avec IA). La description est structurée de manière progressive, dossier par dossier et fichier par fichier.

---

## 1. Dossier `mouhami-main/ai_data/`
Ce dossier contient la base de données locale des index de recherche juridique et les métadonnées utilisées par le moteur RAG (Retrieval-Augmented Generation).

* **`ai_data/legal_search/index.json`** : Stocke l'index vectoriel des textes de loi marocains découpés en segments (chunks), permettant des recherches de pertinence sémantique rapides via l'IA.
* **`ai_data/legal_search/library.json`** : Bibliothèque de contenus juridiques structurés issus des codes de loi (Code de procédure civile, procédure pénale, Moudawana, etc.), contenant les textes intégraux indexés.
* **`ai_data/legal_search/meta.json`** : Métadonnées sur la base vectorielle (horodatages de la dernière indexation, nombre de documents indexés, modèle d'embedding utilisé).

---

## 2. Dossier `mouhami-main/app/` (Next.js App Router)
Le cœur de l'application Web Next.js (Architecture basée sur le routing App Router).

### 2.1 API Routes (`app/api/`)
Endpoints API REST qui gèrent la communication entre le client/interface et la couche de services métier.

* **`app/api/activites/route.ts`** : Route API permettant de récupérer le journal d'activités récentes (historique des actions dans l'application).
* **`app/api/authentification/`** : Route API (login, register, logout, me, refresh) pour l'authentification des utilisateurs.
* **`app/api/dossiers/route.ts`** : Route API pour la gestion CRUD des affaires juridiques (création, consultation, mise à jour, suppression) — anciennement `cases/`.
* **`app/api/types-de-dossier/route.ts`** : Route API fournissant les types/catégories d'affaires (civil, pénal, commercial, famille, etc.) — anciennement `case-types/`.
* **`app/api/clients/route.ts`** : Route API pour la gestion des dossiers clients du cabinet.
* **`app/api/tableau-de-bord/route.ts`** : Route API agrégeant les statistiques globales du tableau de bord (nombre de dossiers, audiences à venir, paiements, etc.) — anciennement `dashboard/`.
* **`app/api/document-types/route.ts`** : Route API renvoyant la liste des catégories et types de documents gérés par le système.
* **`app/api/health/route.ts`** : Endpoint de vérification de l'état de santé du système (Healthcheck).
* **`app/api/audiences/route.ts`** : Route API pour le suivi et l'enregistrement des audiences de justice — anciennement `hearings/`.
* **`app/api/notifications/route.ts`** : Route API gérant les notifications système et les marquages de lecture.
* **`app/api/rappels/route.ts`** : Route API pour la création et la gestion des rappels/échéances (délais légaux, RDV) — anciennement `reminders/`.
* **`app/api/recherche/route.ts`** : Route API de recherche globale trans-modules (recherche simultanée dans les clients, affaires et documents) — anciennement `search/`.
* **`app/api/settings/route.ts`** : Route API pour la lecture et mise à jour des paramètres du cabinet.
* **`app/api/modeles/route.ts`** : Route API renvoyant les modèles de documents juridiques pré-configurés — anciennement `templates/`.
* **`app/api/paiements/route.ts`** : Route API pour la gestion des paiements/honoraires — anciennement `payments/`.
* **`app/api/ai/`** : Routes API dédiées à l'IA (chat, agents, legal-search, templates) — inchangées.

### 2.2 Espace Client (`app/(client)/`)
Module de layout et gestion des vues pour les accès clients.

* **`app/(client)/error.tsx`** : Composant de capture des erreurs pour l'interface client (Error Boundary).
* **`app/(client)/layout.tsx`** : Layout principal englobant les vues de l'espace client.
* **`app/(client)/loading.tsx`** : Composant visuel d'attente (skeleton loader) lors du chargement des pages clients.

### 2.3 Tableau de Bord Avocat / Administrateur (`app/(dashboard)/`)
Interface principale de travail pour l'avocat et ses collaborateurs.

* **`app/(dashboard)/ai/page.tsx`** : Page de l'assistant juridique IA (chat interactif, recherche dans la loi marocaine, génération automatique d'actes).
* **`app/(dashboard)/audiences/page.tsx`** : Interface du calendrier et suivi des audiences du tribunal.
* **`app/(dashboard)/cases/page.tsx`** : Page de gestion et de suivi complet de toutes les affaires juridiques du cabinet.
* **`app/(dashboard)/case-types/page.tsx`** : Page de configuration des types et natures d'affaires.
* **`app/(dashboard)/clients/page.tsx`** : Annuaire des clients avec fiches détaillées et historiques d'affaires.
* **`app/(dashboard)/dashboard/page.tsx`** : Page d'accueil du tableau de bord avec indicateurs clés (KPIs), graphiques et rappels du jour.
* **`app/(dashboard)/documents/page.tsx`** : Gestionnaire de documents (stockage, prévisualisation, téléchargement et génération automatique d'actes).
* **`app/(dashboard)/error.tsx`** : Gestionnaire d'erreurs pour l'espace tableau de bord.
* **`app/(dashboard)/layout.tsx`** : Disposition principale du tableau de bord intégrant la barre latérale, le header et les composants de notifications.
* **`app/(dashboard)/loading.tsx`** : Indicateur de chargement pour les vues du tableau de bord.
* **`app/(dashboard)/settings/page.tsx`** : Page de configuration du cabinet (profil, préférences de rappels, thèmes).

### 2.4 Fichiers Racine de l'application (`app/`)
* **`app/globals.css`** : Feuilles de styles globales contenant Tailwind CSS, les variables de couleurs personnalisées, et le style "glassmorphism".
* **`app/layout.tsx`** : Structure HTML de base (`<html>`, `<body>`) englobant toute l'application Next.js.
* **`app/login/loading.tsx`** : Écran d'attente lors du chargement de la page de connexion.
* **`app/login/page.tsx`** : Page de connexion / authentification des utilisateurs.
* **`app/page.tsx`** : Page d'accueil racine gérant la redirection selon l'état de connexion de l'utilisateur.

---

## 3. Dossier `mouhami-main/components/`
Bibliothèque de composants React réutilisables dans toute l'application.

### 3.1 Composants de Layout (`components/layout/`)
* **`components/layout/FloatingSidebar.tsx`** : Barre de navigation latérale flottante avec effets visuels, liens vers les modules et support du responsive.
* **`components/layout/Header.tsx`** : Barre supérieure de l'application avec champ de recherche globale, cloche de notifications et informations de profil.

### 3.2 Composants de Rappels et Notifications (`components/reminders/`)
* **`components/reminders/CountdownTimer.tsx`** : Compte à rebours dynamique indiquant le temps restant avant une audience ou une échéance critique.
* **`components/reminders/CreateReminderModal.tsx`** : Fenêtre modale permettant d'ajouter un nouveau rappel avec date et priorité.
* **`components/reminders/NotificationPopup.tsx`** : Pop-up / Toast d'alerte en temps réel pour notifier l'avocat des rappels imminents.
* **`components/reminders/ReminderBell.tsx`** : Icône de cloche interactive avec badge de décompte et menu déroulant des notifications non lues.
* **`components/reminders/TodayEvents.tsx`** : Widget affichant les événements et audiences prévus pour la journée en cours.

### 3.3 Composants d'Interface Utilisateur Génériques (`components/ui/`)
* **`components/ui/Badge.tsx`** : Composant de badge stylisé pour afficher les statuts (ex: En cours, Urgent, Clôturé).
* **`components/ui/DataTable.tsx`** : Tableau de données interactif complet avec tri, filtrage et pagination.
* **`components/ui/Modal.tsx`** : Composant générique de boîte de dialogue modale.
* **`components/ui/Pagination.tsx`** : Contrôle de pagination pour naviguer dans les listes volumineuses.
* **`components/ui/StatCard.tsx`** : Carte d'affichage des statistiques (icône, valeur, libellé, variation).

---

## 4. Dossier `mouhami-main/docs/`
Documentation technique et conceptuelle du projet.

* **`docs/01-analyse-fonctionnelle.md`** : Analyse des besoins fonctionnels du cabinet d'avocats et cas d'utilisation (User Stories).
* **`docs/02-architecture-logicielle.md`** : Description de l'architecture en couches, choix technologiques et flux de données.
* **`docs/03-schema-base-de-donnees.md`** : Spécification du modèle de données (entités, relations et contraintes).
* **`docs/04-diagrammes-uml.md`** : Spécification et descriptions des diagrammes UML (Classes, Séquence, Composants).
* **`docs/05-maquettes-ui.md`** : Directives de design UI/UX et description des interfaces utilisateur.

---

## 5. Dossier `mouhami-main/document_templates/`
Modèles JSON structurés définissant la forme et les champs variables des documents juridiques à générer.

* **`document_templates/appeal.json`** : Structure et variables requises pour un acte d'appel (استئناف).
* **`document_templates/contract.json`** : Modèle de structure pour les contrats et conventions (عقد).
* **`document_templates/memorandum_introductif.json`** : Modèle pour les mémoires introductifs d'instance (مذكرة افتتاحية).
* **`document_templates/plainte.json`** : Modèle de données pour la rédaction d'une plainte (شكاية).
* **`document_templates/procuration.json`** : Modèle pour les actes de procuration (وكالة).
* **`document_templates/summons.json`** : Modèle pour la création d'assignations et notifications (استدعاء).

---

## 6. Dossier `mouhami-main/hooks/`
Hooks React personnalisés pour la gestion des états globaux et l'appel aux APIs.

* **`hooks/useAuth.ts`** : Hook gérant l'état d'authentification de l'utilisateur, la connexion et la déconnexion.
* **`hooks/useCases.ts`** : Hook facilitant l'accès aux données des affaires juridiques (chargement, ajout, modification).
* **`hooks/useCaseTypes.ts`** : Hook pour récupérer et filtrer la liste des types d'affaires.
* **`hooks/useClients.ts`** : Hook pour manipuler la liste et l'état des clients.
* **`hooks/useDashboard.ts`** : Hook chargeant l'ensemble des données synthétiques du tableau de bord.
* **`hooks/useReminders.ts`** : Hook assurant la synchronisation des rappels et le rafraîchissement des notifications.

---

## 7. Dossier `mouhami-main/legal_library/`
Bibliothèque documentaire des textes de loi marocains sous format PDF (utilisée pour l'indexation RAG).

* **`legal_library/4_ONC_Law_ar-MA.pdf`** : Textes réglementaires régissant la profession d'avocat au Maroc (قانون المنظمة الوطنية للمحامين).
* **`legal_library/CriminalProccedureLaw_Mor_2005_AR.pdf`** : Code de Procédure Pénale marocaine (قانون المسطرة الجنائية).
* **`legal_library/قانون المسطرة المدنية.pdf`** : Code de Procédure Civile marocaine.
* **`legal_library/مدونة الأسرة.pdf`** : Code de la Famille marocaine (Moudawana).

---

## 8. Dossier `mouhami-main/legal_templates/`
Fichiers sources et modèles pour l'exportateur de documents Word / Markdown.

* **`legal_templates/plainte/reference.docs`** : Fichier binaire de référence pour le formatage.
* **`legal_templates/plainte/reference.docx`** : Modèle Microsoft Word de référence définissant la mise en page et les styles de plaintes.
* **`legal_templates/plainte/template.md`** : Gabarit au format Markdown spécifiant le squelette textuel d'une plainte.

---

## 9. Dossier `mouhami-main/lib/`
Le cœur métier backend et les moteurs d'intelligence artificielle de l'application.

### 9.1 Module d'Intelligence Artificielle (`lib/ai/`)
* **`lib/ai/agents/documentGenerator.agent.ts`** : Agent IA spécialisé dans la rédaction automatique d'actes juridiques à partir des variables fournies.
* **`lib/ai/document-engine/DocumentGenerator.ts`** : Moteur principal orchestrant la création de documents.
* **`lib/ai/document-engine/DocumentPromptBuilder.ts`** : Constructeur de prompts d'instructions destinées au modèle LLM pour la rédaction.
* **`lib/ai/document-engine/DocxBuilder.ts`** : Module technique transformant la structure générée en un vrai fichier binaire Microsoft Word (`.docx`).
* **`lib/ai/document-engine/DocxTemplateEngine.ts`** : Moteur d'injection de variables dans les modèles Word.
* **`lib/ai/document-engine/OllamaDocumentService.ts`** : Connecteur au service local Ollama dédié à la rédaction documentaire.
* **`lib/ai/document-engine/TemplateLoader.ts`** : Chargeur des fichiers JSON contenus dans `document_templates/`.
* **`lib/ai/legal-search/documentIndexer.ts`** : Script d'extraction et découpage (chunking) des fichiers PDF de la `legal_library`.
* **`lib/ai/legal-search/legalSearch.agent.ts`** : Agent de recherche juridique combinant vectorisation et filtrage sémantique.
* **`lib/ai/legal-search/legalSearch.service.ts`** : Service exécutant la recherche de pertinence dans la base vectorielle.
* **`lib/ai/legal-search/pdfLoaderService.ts`** : Extraction du texte brut à partir des fichiers PDF juridiques.
* **`lib/ai/legal-search/promptBuilder.ts`** : Assemblage des prompts de contexte RAG pour l'assistant juridique.
* **`lib/ai/legal-search/vectorStoreService.ts`** : Gestionnaire de l'index vectoriel en mémoire / fichier JSON.
* **`lib/ai/models/agent.interface.ts`** : Interfaces TypeScript définissant le contrat d'exécution d'un agent IA.
* **`lib/ai/models/types.ts`** : Types de données partagés au sein des modules IA.
* **`lib/ai/prompts/prompts.ts`** : Collection des prompts système (instructions fondamentales pour l'IA).
* **`lib/ai/services/orchestrator.service.ts`** : Orchestrateur central analysant l'intention de l'utilisateur et distribuant la tâche au bon agent (Recherche ou Génération).
* **`lib/ai/utils/declarations.d.ts`** : Déclarations de types additionnelles pour les modules externes IA.
* **`lib/ai/utils/ollamaClient.ts`** : Client HTTP de bas niveau pour interroger l'API du modèle LLM Ollama.

### 9.2 Middlewares et Configuration racine (`lib/`)
* **`lib/api.ts`** : Utilitaire d'exécution de requêtes HTTP `fetch` côté client avec gestion des headers.
* **`lib/auth.ts`** : Fonctions utilitaires d'authentification et de validation de session côté serveur.
* **`lib/prisma.ts`** : Singleton d'instanciation de la connexion ORM Prisma vers la base de données PostgreSQL / SQLite.
* **`lib/utils.ts`** : Utilitaire d'assemblage des classes Tailwind (`cn` avec `clsx` et `tailwind-merge`).

### 9.3 Middlewares API (`lib/middlewares/`)
* **`lib/middlewares/auth.ts`** : Middleware de vérification des permissions et du token JWT sur les routes API.
* **`lib/middlewares/validation.ts`** : Middleware de validation du format des données d'entrée des requêtes API.

### 9.4 Couche Repository (`lib/repositories/`)
Pattern d'accès direct à la base de données via Prisma ORM.

* **`lib/repositories/activity.repository.ts`** : Méthodes d'accès aux enregistrements du journal d'activités.
* **`lib/repositories/case.repository.ts`** : Requêtes DB pour la table des affaires juridiques.
* **`lib/repositories/caseType.repository.ts`** : Requêtes DB pour la table des types d'affaires.
* **`lib/repositories/client.repository.ts`** : Requêtes DB pour la table des clients.
* **`lib/repositories/document.repository.ts`** : Requêtes DB pour la métadonnée des documents stockés.
* **`lib/repositories/hearing.repository.ts`** : Requêtes DB pour les audiences et dates de tribunal.
* **`lib/repositories/notification.repository.ts`** : Requêtes DB pour l'historique et l'état des notifications.
* **`lib/repositories/reminder.repository.ts`** : Requêtes DB pour la gestion des rappels.
* **`lib/repositories/user.repository.ts`** : Requêtes DB pour la gestion des comptes utilisateurs / avocats.

### 9.5 Couche Services Métier (`lib/services/`)
Contient la logique d'affaires de l'application orchestrant la couche repository.

* **`lib/services/auth.service.ts`** : Traitement de la connexion, vérification des mots de passe hachés et émission des JWT.
* **`lib/services/cases.service.ts`** : Règles de gestion relatives aux affaires (cycle de vie, attribution, statuts).
* **`lib/services/caseType.service.ts`** : Service de gestion des catégories d'affaires.
* **`lib/services/clients.service.ts`** : Gestion des profils clients et contrôle d'intégrité.
* **`lib/services/dashboard.service.ts`** : Calculs des métriques et agrégations statistiques du tableau de bord.
* **`lib/services/documents.service.ts`** : Logique de gestion du stockage et rattachement des documents.
* **`lib/services/reminder.service.ts`** : Planification des échéances et logique de génération des alertes.
* **`lib/services/search.service.ts`** : Moteur de recherche multicritères combinant plusieurs entités.

### 9.6 Utilitaires Métier (`lib/utils/`)
* **`lib/utils/helpers.ts`** : Fonctions d'aide (formatage de dates, nettoyage de chaînes de caractères, devises).
* **`lib/utils/jwt.ts`** : Fonctions de génération, encodage et découpage des jetons JWT.
* **`lib/utils/pdf.ts`** : Utilitaire de génération ou manipulation de flux PDF.

---

## 10. Fichiers de la Racine du Projet (`mouhami-main/`)
Configuration globale de l'environnement de développement et de déploiement.

* **`mouhami-main/middleware.ts`** : Middleware global Next.js exécuté à chaque requête HTTP pour filtrer les accès non autorisés.
* **`mouhami-main/next.config.mjs`** : Fichier de configuration du framework Next.js.
* **`mouhami-main/next-env.d.ts`** : Fichier de typage TypeScript généré automatiquement par Next.js.
* **`mouhami-main/package.json`** : Liste des dépendances npm, scripts de build, de démarrage et d'exécution du projet.
* **`mouhami-main/package-lock.json`** : Verrouillage des versions exactes des paquets npm installés.
* **`mouhami-main/postcss.config.js`** : Configuration du compilateur PostCSS (TailwindCSS et Autoprefixer).
* **`mouhami-main/tailwind.config.ts`** : Paramétrage du thème Tailwind (couleurs, polices, responsive breakpoints).
* **`mouhami-main/tsconfig.json`** : Options de compilation TypeScript.
* **`mouhami-main/tsconfig.tsbuildinfo`** : Cache de compilation incrémentale de TypeScript.

---

## 11. Dossier `mouhami-main/prisma/`
Gestion de la base de données et des migrations ORM.

* **`prisma/schema.prisma`** : Schéma complet de la base de données décrivant l'ensemble des modèles (User, Case, Client, Document, Hearing, Reminder, Activity, etc.) et leurs relations.
* **`prisma/seed.ts`** : Script d'initialisation (seeding) de la base de données avec des données de démonstration.
* **`prisma/migrations/20260706093132_init/migration.sql`** : Script de migration SQL initial créant la structure de base des tables.
* **`prisma/migrations/20260706101823_add_case_types/migration.sql`** : Script de migration SQL ajoutant la table des types d'affaires.
* **`prisma/migrations/20260706101900_add_reminder_models/migration.sql`** : Script de migration SQL ajoutant la gestion avancée des rappels et alertes.
* **`prisma/migrations/migration_lock.toml`** : Fichier de verrouillage d'état des migrations Prisma.

---

## 12. Dossier `mouhami-main/public/`
Fichiers statiques distribués directement par le serveur web.

* **`public/images/background.jpg`** : Image d'arrière-plan de l'application.
* **`public/images/logo.png`** : Logo officiel du système Mouhami.

---

## 13. Dossier `mouhami-main/types/`
Déclarations globales des types TypeScript.

* **`types/index.ts`** : Exportation des interfaces de données métier partagées (modèles Case, Client, User, Document, etc.).
