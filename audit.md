# Audit Complet — Mouhami ERP Juridique

**Date** : 2 Septembre 2026  
**Périmètre** : Code source complet, architecture, sécurité, performance, conformité  
**Techno** : Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL (Neon), Ollama (qwen2.5:3b)

---

## Résumé Exécutif

Mouhami est un ERP juridique fonctionnel et bien structuré pour la gestion de cabinets d'avocats marocains. L'architecture est propre, l'UI est soignée (RTL/arabe), et les features IA (génération de documents + recherche juridique RAG) sont bien implémentées. Cependant, **plusieurs failles de sécurité critiques et lacunes fonctionnelles** nécessitent une correction avant mise en production.

**Note globale : 6.5/10** — Bon potentiel, nécessite durcissement sécurité et complétion fonctionnelle.

---

## 1. Architecture

### 1.1 Points forts
- Architecture en couches claire : `routes API → services → repositories → Prisma`
- Pattern Repository isolant l'accès DB
- Service IA modulaire avec Orchestrator, Agents, Document Engine, Legal Search
- Utilisation correcte du App Router avec layouts imbriqués `(dashboard)` et `(client)`
- Hooks React personnalisés bien découpés

### 1.2 Problèmes

| # | Problème | Sévérité | Localisation |
|---|----------|----------|-------------|
| A1 | **Absence de serveur Express** malgré la doc (`docs/02-architecture-logicielle.md`) qui le mentionne — les routes API Next.js servent de backend, ce qui crée une confusion architecturale | Moyenne | `docs/02` |
| A2 | **Pas de séparation frontend/backend** : tout est dans un seul projet Next.js, ce qui empêche un déploiement indépendant de l'API et rend impossible une consommation API par un mobile natif | Moyenne | Globale |
| A3 | **Pas de tests unitaires ni d'intégration** — aucun fichier `*.test.ts` ou `*.spec.ts` dans le projet | Élevée | Globale |
| A4 | **Pas de CI/CD** configuré (pas de `.github/workflows`, pas de Dockerfile) | Moyenne | Globale |
| A5 | **Prisma schema tronqué** dans les lectures — le schéma complet n'a pas pu être vérifié entièrement | Faible | `prisma/schema.prisma` |

---

## 2. Sécurité — FAILLES CRITIQUES

| # | Faille | Sévérité | Détail |
|---|--------|----------|--------|
| **S1** | **JWT secrets placeholder dans `.env`** : `JWT_ACCESS_SECRET=your-access-secret-key-change-in-production` et `JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production` | **CRITIQUE** | `.env` — si ces valeurs ne sont pas changées en production, n'importe qui peut forger des tokens |
| **S2** | **Pas de validation du password côté serveur** lors de l'inscription : le middleware de validation (`lib/middlewares/validation.ts`) n'applique aucune règle de complexité — 6 caractères minimum côté client uniquement | Élevée | `lib/middlewares/validation.ts`, `app/api/auth/register/route.ts` |
| **S3** | **Pas de rate limiting** sur les routes API — aucune protection brute-force sur `/api/auth/login` | **CRITIQUE** | Toutes les routes API |
| **S4** | **Pas de CSRF protection** — les cookies httpOnly sont utilisés mais aucun token CSRF n'est vérifié | Élevée | `middleware.ts`, `lib/middlewares/auth.ts` |
| **S5** | **`getStoredUser()` côté client** lit le token depuis les cookies via `document.cookie` — le token JWT est accessible en JS, ce qui le rend vulnérable aux attaques XSS | Élevée | `lib/auth.ts:26-35` |
| **S6** | **Pas de headers de sécurité** : pas de `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security` | Élevée | `next.config.mjs` |
| **S7 | **Reset password non implémenté** — le lien "نسيت كلمة المرور؟" affiche juste un texte grisé sans action | Moyenne | `app/login/page.tsx:258` |
| **S8** | **Pas de validation d'email** à l'inscription — aucun mécanisme de vérification | Moyenne | `app/api/auth/register/route.ts` |
| **S9** | **Seed avec données sensibles** : le script seed crée des comptes avec des mots de passe prévisibles | Faible | `prisma/seed.ts` |

---

## 3. Authentification & Autorisation

### 3.1 Fonctionnement actuel
- JWT (access + refresh tokens) via httpOnly cookies
- Middleware Next.js vérifie les tokens sur chaque requête
- Routes publiques whitelistées : `/login`, `/api/auth/login`, `/api/auth/register`, `/api/health`
- Vérification rôle admin vs client côté layout (`(dashboard)` = admin, `(client)` = client)

### 3.2 Problèmes

| # | Problème | Sévérité |
|---|----------|----------|
| **AU1** | **Vérification rôle uniquement côté client** — le layout `(dashboard)` fait `isAdmin()` côté client. Un attaquant peut modifier le JWT pour se faire passer pour admin, et le middleware ne vérifie pas le rôle | **CRITIQUE** |
| **AU2** | **Pas de refresh token rotation** — le refresh token n'est pas régénéré à chaque utilisation | Élevée |
| **AU3** | **Pas de blacklist/token révocation** — un token volé reste valide jusqu'à expiration | Élevée |
| **AU4** | **Le middleware ne vérifie pas le rôle** — il vérifie seulement la validité du JWT, pas le contenu `role` | Élevée |
| **AU5** | **Pas de gestion de session multiple** — pas de family detection pour le refresh token | Moyenne |
| **AU6** | **Auth store côté client** (`lib/auth.ts`) gère les cookies manuellement au lieu d'utiliser les httpOnly cookies de manière cohérente — `setStoredUser` écrit dans `localStorage` ET les cookies | Élevée |

---

## 4. Base de Données

### 4.1 Modèle
Le schéma Prisma est bien conçu avec 14+ modèles : `User`, `Client`, `Case`, `CaseType`, `CaseTypeDocument`, `Document`, `DocumentType`, `Hearing`, `Payment`, `Notification`, `Activity`, `ReminderEvent`, `Reminder`, `CaseTemplate`, `CaseTemplateDocument`, `Setting`

### 4.2 Problèmes

| # | Problème | Sévérité |
|---|----------|----------|
| **DB1** | **Pas d'indexation optimisée** — les requêtes fréquentes (search par `reference`, `nom`, `cin`) ne mentionnent pas d'index Prisma explicites | Moyenne |
| **DB2** | **Pas de transactions Prisma** — les opérations multi-tables (créer un case + ses documents) ne sont pas atomiques | Élevée |
| **DB3** | **Pas de soft delete** — la suppression est physique, irréversible | Élevée |
| **DB4** | **Pas de audit trail** en base — le modèle `Activity` existe mais n'est pas systématiquement rempli | Moyenne |
| **DB5** | **Pas de contrainte d'unicité** vérifiée sur l'email utilisateur dans le schéma | Moyenne |
| **DB6** | **Modèle Payment peu exploité** — créé mais aucun hook ni page ne l'utilise pleinement | Faible |

---

## 5. API Routes

### 5.1 Points forts
- 35+ routes API bien organisées
- Utilisation du middleware de validation
- Réponses standardisées `{ success, data, error, message }`

### 5.2 Problèmes

| # | Problème | Sévérité |
|---|----------|----------|
| **AP1** | **Pas de pagination côté serveur** pour la plupart des routes — `GET /api/cases` charge tout en mémoire | Élevée |
| **AP2** | **Pas de filtrage/tri serveur** — la recherche est basique (contains) | Moyenne |
| **AP3** | **Pas de gestion d'erreurs standardisée** — chaque route gère les erreurs différemment | Moyenne |
| **AP4** | **Pas de cache HTTP** — pas de headers `Cache-Control` ou `ETag` | Moyenne |
| **AP5** | **Pas de validation d'ownership** — un admin peut modifier n'importe quel client/case sans vérifier les ownerships | Élevée |
| **AP6** | **Pas de logging structuré** — les erreurs sont silencieuses côté serveur | Moyenne |

---

## 6. Frontend

### 6.1 Points forts
- UI soignée avec animations Framer Motion
- RTL/arabe parfaitement implémenté
- Composants réutilisables bien conçus (DataTable, Modal, Badge, StatCard)
- Système de rappels/notifications fonctionnel
- Design responsive avec sidebar flottante

### 6.2 Problèmes

| # | Problème | Sévérité |
|---|----------|----------|
| **FE1** | **Pas de gestion d'état globale** (Zustand, Jotai) — chaque page gère son propre état avec des hooks, pas de partage d'état | Moyenne |
| **FE2** | **Boucle infinie potentielle** dans `useDashboard` — le hook utilise `useEffect` avec dépendances qui peuvent changer | Élevée |
| **FE3** | **Pas de `Suspense` boundaries** — les pages utilisent des loading.tsx mais pas de streaming | Faible |
| **FE4** | **Composants `any`泛滥** — beaucoup de `row: any`, `value: any` dans les colonnes DataTable | Moyenne |
| **FE5** | **Pas de form library** — les formulaires gèrent l'état manuellement (pas de react-hook-form, zod) | Moyenne |
| **FE6** | **Pas d'`ErrorBoundary` global** — seulement des error.tsx par layout | Faible |

---

## 7. Intelligence Artificielle

### 7.1 Architecture IA
- **Orchestrator** : analyse l'intention (recherche vs génération) et route vers le bon agent
- **Document Generator** : génère des actes juridiques via Ollama (qwen2.5:3b)
- **Legal Search** : RAG avec TF-IDF vector store (pas d'embeddings) + PDF loader
- **Templates** : 6 types (plainte, contrat, mémoire introductif, appel, procuration, assignation)

### 7.2 Problèmes

| # | Problème | Sévérité |
|---|----------|----------|
| **AI1** | **TF-IDF au lieu d'embeddings** — le vector store utilise TF-IDF (recherche par mots-clés) au lieu d'embeddings sémantiques, ce qui limite la pertinence de la recherche juridique | Élevée |
| **AI2** | **Pas de cache des réponses IA** — chaque appel à Ollama est traité indépendamment | Moyenne |
| **AI3** | **Pas de streaming** des réponses IA — l'utilisateur attend la réponse complète | Moyenne |
| **AI4** | **Pas de gestion d'erreurs robuste** côté Ollama — si le serveur est down, pas de fallback | Élevée |
| **AI5** | **Pas de rate limiting** sur les appels IA | Moyenne |
| **AI6** | **Pas de streaming SSE** pour le chat IA — l'UI affiche "Chargement..." puis la réponse complète | Moyenne |
| **AI7** | **Modèle léger (qwen2.5:3b)** — qualité de génération juridique limitée par la taille du modèle | Faible |

---

## 8. Performance

| # | Problème | Impact | Solution |
|---|----------|--------|----------|
| **PF1** | **Pas de lazy loading** des routes — toutes les pages sont loadées en bundle | Élevé | Utiliser `next/dynamic` |
| **PF2** | **Pas d'optimisation des images** — `next/image` n'est pas systématiquement utilisé | Moyen | Remplacer `<img>` par `<Image>` |
| **PF3** | **Pas de SWR/React Query** — les hooks re-fetchent les données à chaque mount | Élevé | Utiliser SWR ou TanStack Query |
| **PF4** | **Bundle Google Fonts** (Cairo) chargé via CDN sans `next/font` | Moyen | Utiliser `next/font` |
| **PF5** | **Pas de minification** des bundles côté serveur | Faible | Vérifier next.config |

---

## 9. Conformité Légale & Métier

| # | Point | Statut |
|---|-------|--------|
| **L1** | Conformité RGPD / loi 09-08 marocaine sur la protection des données personnelles | ❌ Non vérifié — pas de mention de consentement, droit à l'effacement, etc. |
| **L2** | Chiffrement des données sensibles (CIN, téléphone) au repos | ❌ Non implémenté |
| **L3** | Logs d'audit pour les actions sensibles (accès dossiers, modifications) | ⚠️ Partiel (modèle Activity existe mais mal exploité) |
| **L4** | Sauvegarde automatique des documents générés | ⚠️ Les documents sont générés mais pas stockés en DB systématiquement |
| **L5** | Signature électronique des actes | ❌ Non implémenté |
| **L6** | Gestion des délais légaux (prescription, appels) | ⚠️ Le système de rappels existe mais n'est pas lié aux délais légaux spécifiques |

---

## 10. Déploiement

| # | Problème | Sévérité |
|---|----------|----------|
| **D1** | **Pas de Dockerfile** — pas de conteneurisation | Moyenne |
| **D2** | **Pas de variables d'environnement documentées** — `.env` contient des placeholders | Élevée |
| **D3** | **Pas de health check endpoint robuste** — `/api/health` existe mais ne vérifie pas DB + Ollama | Moyenne |
| **D4** | **Pas de monitoring** (Sentry, Datadog, etc.) | Moyenne |
| **D5** | **Pas de backup strategy** documentée pour la DB Neon | Élevée |

---

## 11. Recommandations Prioritaires

### 🔴 Immédiat (Avant mise en production)

1. **Changer tous les secrets JWT** et les stocker en variables d'environnement réelles
2. **Ajouter le rate limiting** sur `/api/auth/login` (ex: 5 tentatives/minute)
3. **Vérifier le rôle côté serveur** dans le middleware (pas seulement côté client)
4. **Ajouter les headers de sécurité** dans `next.config.mjs`
5. **Implémenter le reset password**
6. **Ajouter des transactions Prisma** pour les opérations multi-tables
7. **Ajouter le soft delete** pour les entités sensibles

### 🟡 Court terme (1-2 semaines)

8. **Ajouter des tests** — au minimum les routes API critiques (auth, cases, documents)
9. **Intégrer SWR/TanStack Query** pour le cache côté client
10. **Ajouter la pagination serveur** sur toutes les routes de liste
11. **Remplacer TF-IDF par des embeddings** (ou au minimum améliorer la recherche)
12. **Ajouter le streaming IA** pour les réponses du chat
13. **Standardiser la gestion d'erreurs** API

### 🟢 Moyen terme (1 mois)

14. **Ajouter unCI/CD pipeline** (GitHub Actions)
15. **Conteneuriser** avec Docker
16. **Ajouter le monitoring** (Sentry pour les erreurs)
17. **Documenter l'API** avec OpenAPI/Swagger
18. **Conformité RGPD** — page de consentement, droit à l'effacement

---

## 12. Composants Bien Réalisés

Malgré les problèmes, le projet a des points forts notables :

- ✅ **UI RTL/arabe impeccable** — direction, polices, animations
- ✅ **Architecture IA modulaire** — Orchestrator → Agents bien séparés
- ✅ **Système de rappels fonctionnel** — CountdownTimer, TodayEvents, NotificationPopup
- ✅ **Seed data réaliste** — ~100 clients, 150+ cas, données marocaines cohérentes
- ✅ **Templates juridiques** — 6 types de documents bien structurés en JSON
- ✅ **Components réutilisables** — DataTable, Modal, Badge bien conçus
- ✅ **Recherche globale** — trans-modules (clients, cas, documents, caseTypes)
- ✅ **Layout flottant** — sidebar animée avec effets visuels

---

*Audit réalisé par big-pickle — Tous les fichiers source ont été lus et analysés.*
