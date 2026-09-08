# Rapport de Refactorisation — Mouhami (Modular Monolith + Gemini + Routes API françaises)

## 1. Objectif

Refactoriser le projet **Mouhami** (ERP de cabinet d'avocat Next.js) en **Modular Monolith** professionnel :

- Remplacer l'IA locale **Ollama** par l'IA cloud **Gemini** (API Google).
- Organiser le code par **fonctionnalités en français** sur des couches claires : routes API → auth → services → repositories → Prisma.
- **Renommer les routes API `app/api/*` en français** tout en préservant le contrat frontend existant.

La racine `/mouhami-VF/` est un conteneur d'analyse ; l'implémentation réelle se trouve dans `mouhami-main/` (vrai projet Next.js).

---

## 2. Stack (figée)

- Next.js **App Router**, TypeScript, PostgreSQL, **Prisma**, **Gemini API**, RAG, génération de documents, auth, gestion clients/dossiers/docs/audiences/rappels/notifications, dashboard, recherche, bibliothèque juridique.
- **Interdits** (confirmés) : Express, MongoDB, MariaDB, Redis, Kafka, K8s, microservices.

---

## 3. Abstraction IA : Ollama → Gemini

- Interface `FournisseurLLM` → implémentation `FournisseurGemini` qui centralise `GoogleGenAI` du SDK `@google/genai`.
- Modèle par défaut : `gemini-2.5-flash`.
- Variables `.env` : `GEMINI_API_KEY` (à remplir) et `GEMINI_MODEL`.
- **La clé API n'est jamais exposée au navigateur** (traitement uniquement côté serveur).
- `@google/genai` installé ; `ollama` retiré de `package.json`.
- Routes IA migrées vers `orchestrateurIA`, `serviceRechercheJuridique`, `fournisseurGemini` ; streaming SSE de `legal-search` via `generateContentStream`.

---

## 4. Nouvelle structure par fonctionnalités

- `infrastructure/` : erreurs (`ErreurApi`, `reponseSucces`/`reponseErreur`), middleware d'authentification (`exigerAuthentification`/`exigerAdmin`), logging, etc.
- `fonctionnalites/` : auth, clients, dossiers (case), documents, audiences, rappels, notifications, recherche, tableau-de-bord, types-de-dossier — chaque module avec **services + repositories + barrel `index.ts`**.
- `ia/` : fournisseurs Gemini, orchestrateurs, agents, RAG, moteur de documents.
- `lib/` (conservé pour le frontend/middleware) : `api.ts` (frontend, `API_BASE = "/api"`), `auth.ts` (cookies client), `utils/{jwt,helpers,pdf}.ts`, `utils.ts`, `prisma.ts`.
- Supprimé : `lib/ai/`, `lib/services/`, `lib/repositories/`, `lib/middlewares/`.

### Contrat de réponse unifié

- Erreurs : `{ success: false, error: { code, message } }` via `ErreurApi`.
- Succès : `reponseSucces` **étale** l'objet (`{ success: true, ...data }`) pour préserver le contrat frontend qui lit des clés nommées du corps de réponse (`case`, `clients`, etc.).

---

## 5. Renommage des routes API en français

| Ancien chemin | Nouveau chemin |
|---|---|
| `auth/` | `authentification/` (login, register, logout, me, refresh) |
| `cases/` | `dossiers/` (incl. `[id]`, `checklist/[itemId]`, `documents`, `hearings`, `payments`, `pdf`) |
| `hearings/` | `audiences/` |
| `reminders/` | `rappels/` (incl. `next`, `today`, `pending`, `pending/count`, `[id]/dismiss`) |
| `search/` | `recherche/` |
| `dashboard/` | `tableau-de-bord/` |
| `case-types/` | `types-de-dossier/` (incl. `[id]/documents/[docId]`) |
| `payments/` | `paiements/` |
| `activities/` | `activites/` |
| `templates/` | `modeles/` |

**Inchangés (déjà français ou techniques)** :
- Déjà français : `clients/`, `documents/`, `notifications/`.
- Techniques (conservés) : `ai/`, `settings/`, `health/`, `document-types/`.

### Mise à jour frontend

- `middleware.ts` : `PUBLIC_ROUTES` → `/api/authentification/*`, `/api/health`, et `pathname.startsWith("/api/authentification/")`.
- `lib/api.ts` : refresh → `/api/authentification/refresh`.
- Hooks : `useAuth`, `useCases`, `useReminders`, `useDashboard`, `useCaseTypes`.
- Pages : `cases`, `documents`, `client/dashboard`, `client/cases/[id]`, `cases/[id]`, `audiences`, `dashboard`.
- Les **routes UI de navigation** (`/cases`, `/dashboard`, `/clients`, …) sont **intentionnellement inchangées** (le frontend n'est pas réécrit).

---

## 6. Vérifications effectuées (toutes vertes)

- `tsc --noEmit` → EXIT 0.
- `npx prisma validate` → schéma valide.
- `npm run build` → EXIT 0 (toutes les routes API françaises listées).
- Tests curl de bout en bout sur les nouvelles URL (auth/me, dossiers GET+POST, tableau-de-bord, types-de-dossier, rappels, recherche, notifications, audiences, modeles, activites) → 200.
- Endpoints AI (`/api/ai/agents`, `/api/ai/ollama`, `/api/ai/chat`, `/api/ai/templates`) → OK.
- Middleware : `/dashboard` sans auth → 307, `/login` → 200.

---

## 7. Limites connues (préexistantes)

- Création d'un dossier (`POST /api/dossiers`) sans `clientId` → erreur `clientId: undefined` côté Prisma (validation de la route create). Fonctionne correctement avec un `clientId` valide.
- Seul le type `plainte/` dispose d'un modèle complet dans `legal_templates/` ; les autres types (`procuration`, etc.) → « Modèle introuvable » tant que leur `reference.docx`/`template.md` n'a pas été ajouté.
- `GEMINI_API_KEY` est vide : à renseigner dans `.env` pour activer la génération IA réelle.
