# Analyse Fonctionnelle — ERP Juridique (PFE)

## 1. Contexte

Développement d'un prototype ERP destiné aux cabinets d'avocats marocains.
Le logiciel doit gérer l'intégralité des opérations quotidiennes :
clients, dossiers, documents, audiences, procédures, et consultations clients.

## 2. Objectifs métier

| Objectif | Description |
|----------|-------------|
| Gagner du temps | Automatiser la création des dossiers par modèle |
| Centraliser | Un seul outil pour tous les documents et données |
| Sécuriser | Accès par rôle, JWT, historique complet |
| Moderniser | Interface web responsive, accessible partout |
| Scalable | Architecture permettant l'ajout futur d'IA juridique |

## 3. Acteurs

### 3.1 Admin (Avocat)
- Tableau de bord complet
- Gestion des clients (CRUD)
- Gestion des dossiers (CRUD + modèles)
- Gestion documentaire
- Suivi des audiences
- Génération PDF
- Recherche intelligente
- Notifications

### 3.2 Client
- Connexion sécurisée
- Consultation des dossiers
- Consultation des audiences
- Téléchargement des PDF autorisés
- Modification des informations personnelles limitées
- Notifications

## 4. Modules fonctionnels

### Module 1 : Authentification
- Inscription (avocat uniquement)
- Connexion JWT + Refresh Token
- Rôles : Admin, Client
- Protection des routes

### Module 2 : Dashboard Avocat
- Statistiques : clients, dossiers, audiences, documents manquants
- Dernières activités
- Derniers dossiers créés
- Calendrier des audiences
- Notifications récentes

### Module 3 : Gestion des Clients
- CRUD complet
- Recherche multi-critères
- Photo, CIN, téléphone, adresse, ville, profession
- Statut (actif/inactif)
- Observations

### Module 4 : Gestion des Dossiers
- CRUD complet
- Référence interne + Référence Mahakim
- Association client + tribunal + type + sous-type
- Modèles de dossiers (Vol, Divorce, Succession, etc.)
- Checklist des documents obligatoires
- Calcul automatique du pourcentage d'avancement
- Historique des actions

### Module 5 : Modèles de Dossiers
- Templates prédéfinis avec documents obligatoires
- Étapes et délais automatiques
- Types : Vol, Divorce, Succession, Commercial, Travail, Immobilier, Administratif

### Module 6 : Gestion Documentaire
- Upload de PDF
- Visualisation et téléchargement
- Types de documents configurables (table DocumentTypes)
- Commentaires par document
- État du document (en attente, validé, rejeté)

### Module 7 : Recherche Intelligente
- Barre de recherche unique
- Recherche dans toutes les colonnes de toutes les tables
- Architecture extensible pour IA future

### Module 8 : Espace Client
- Connexion sécurisée
- Visualisation des dossiers (lecture seule)
- Visualisation des audiences
- Téléchargement des PDF
- Modification téléphone, adresse, photo, mot de passe

### Module 9 : Génération PDF
- Export complet d'un dossier
- Page de garde
- Informations cabinet, client, dossier
- Historique, documents, checklist, notes, audiences
- Table des matières, pagination

### Module 10 : Notifications
- Audiences à venir
- Documents manquants
- Nouveaux documents
- Modifications de dossier
- Paiements

### Module 11 : Historique
- Enregistrement de toutes les actions
- Type, date, utilisateur, description

## 5. Contraintes techniques

- Frontend : Next.js 15, React 19, App Router, TypeScript, Tailwind CSS
- Backend : Express.js, Node.js
- Base : PostgreSQL, Prisma ORM
- Auth : JWT + Refresh Token + bcrypt
- Upload : Multer
- PDF : pdf-lib ou PDFKit
- API : Fetch API exclusivement (pas Axios)
- Langue interface : Arabe uniquement
- Code sources : Anglais (variables, fonctions, fichiers)
- Commentaires : Français

## 6. Arborescence des pages

```
/                           → Page de connexion (root)
/dashboard                  → Dashboard avocat
/clients                    → Liste des clients
/clients/new                → Ajout client
/clients/[id]               → Détail client
/clients/[id]/edit          → Modifier client
/cases                      → Liste des dossiers
/cases/new                  → Nouveau dossier
/cases/[id]                 → Détail dossier
/cases/[id]/edit            → Modifier dossier
/documents                  → Gestion documentaire
/documents/types            → Types de documents (configuration)
/audiences                  → Calendrier des audiences
/settings                   → Paramètres
/client/dashboard           → Dashboard client
/client/cases               → Dossiers du client
/client/cases/[id]          → Détail dossier (client)
/client/profile             → Profil client
```

## 7. Règles de gestion

RG-001 : Un client peut avoir plusieurs dossiers.
RG-002 : Un dossier appartient à un seul client.
RG-003 : Un dossier peut avoir plusieurs documents.
RG-004 : Un document est lié à un seul dossier.
RG-005 : Un dossier peut avoir plusieurs audiences.
RG-006 : Un modèle de dossier définit les documents obligatoires.
RG-007 : Le pourcentage d'avancement = (documents cochés / total documents obligatoires) × 100.
RG-008 : Un utilisateur Admin peut tout voir, tout modifier.
RG-009 : Un utilisateur Client voit uniquement ses propres dossiers.
RG-010 : Le client ne peut pas modifier les dossiers.
RG-011 : Toutes les actions sont historisées.
RG-012 : Les types de documents sont configurables (pas codés en dur).
