# Architecture Logicielle — ERP Juridique

## 1. Architecture Globale

```
┌─────────────────────────────────────────────────────┐
│                   Client (Navigateur)                │
│  ┌───────────────────────────────────────────────┐   │
│  │           Next.js 15 (App Router)              │   │
│  │  React 19 · TypeScript · Tailwind CSS          │   │
│  │  Fetch API (pas Axios)                         │   │
│  └──────────────────────┬────────────────────────┘   │
└─────────────────────────┼───────────────────────────┘
                          │ HTTP (JSON)
                          ▼
┌─────────────────────────────────────────────────────┐
│               Backend (Express.js)                   │
│  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌──────────┐  │
│  │ Routes  │→│Controllers│→│Services│→│Repositori│  │
│  └─────────┘ └──────────┘ └────────┘ └─────┬────┘  │
│  ┌──────────────────────────────────────────┴────┐  │
│  │              Prisma ORM                       │  │
│  └──────────────────────────────────────────┬────┘  │
└─────────────────────────────────────────────┼───────┘
                                               │
                                        ┌──────▼──────┐
                                        │  PostgreSQL  │
                                        └─────────────┘
```

## 2. Architecture Frontend (Next.js 15)

```
frontend/
├── app/                        # App Router
│   ├── (auth)/                 # Routes publiques (login)
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/            # Routes protégées avocat
│   │   ├── dashboard/
│   │   ├── clients/
│   │   ├── cases/
│   │   ├── documents/
│   │   ├── audiences/
│   │   └── settings/
│   ├── (client)/               # Routes protégées client
│   │   ├── client/
│   │   │   ├── dashboard/
│   │   │   ├── cases/
│   │   │   └── profile/
│   ├── layout.tsx              # Layout racine
│   └── page.tsx                # Redirection vers login
├── components/                 # Composants réutilisables
│   ├── ui/                     # Composants atomiques
│   ├── forms/                  # Formulaires
│   ├── layout/                 # Sidebar, Header, etc.
│   └── shared/                 # Composants partagés
├── hooks/                      # Hooks personnalisés
├── lib/                        # Fonctions utilitaires
│   ├── api.ts                  # Fetch API wrapper
│   ├── auth.ts                 # Gestion JWT
│   └── utils.ts               # Utilitaires généraux
├── types/                      # Types TypeScript
└── public/images/              # Images statiques
```

### Justification
- **App Router** : Routage basé fichiers, SSR/SSG natif, layouts imbriqués
- **React 19** : Dernière version stable, hooks améliorés
- **Tailwind CSS** : Utilitaire, responsive, personnalisable
- **Fetch API** : Imposé par le cahier des charges, natif JavaScript

## 3. Architecture Backend (Express.js)

```
backend/
├── src/
│   ├── routes/                 # Définition des routes REST
│   │   ├── auth.routes.ts
│   │   ├── clients.routes.ts
│   │   ├── cases.routes.ts
│   │   ├── documents.routes.ts
│   │   ├── hearings.routes.ts
│   │   ├── notifications.routes.ts
│   │   ├── search.routes.ts
│   │   └── activities.routes.ts
│   ├── controllers/            # Traitement des requêtes
│   │   ├── auth.controller.ts
│   │   ├── clients.controller.ts
│   │   ├── cases.controller.ts
│   │   ├── documents.controller.ts
│   │   ├── hearings.controller.ts
│   │   ├── notifications.controller.ts
│   │   ├── search.controller.ts
│   │   └── activities.controller.ts
│   ├── services/               # Logique métier
│   │   ├── auth.service.ts
│   │   ├── clients.service.ts
│   │   ├── cases.service.ts
│   │   ├── documents.service.ts
│   │   ├── hearings.service.ts
│   │   ├── notifications.service.ts
│   │   ├── search.service.ts
│   │   └── activities.service.ts
│   ├── repositories/           # Accès base de données
│   │   ├── user.repository.ts
│   │   ├── client.repository.ts
│   │   ├── case.repository.ts
│   │   ├── document.repository.ts
│   │   ├── hearing.repository.ts
│   │   ├── notification.repository.ts
│   │   └── activity.repository.ts
│   ├── middlewares/             # Middlewares
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── upload.middleware.ts
│   ├── prisma/                  # Prisma ORM
│   │   └── schema.prisma
│   ├── utils/                   # Utilitaires
│   │   ├── jwt.ts
│   │   ├── pdf.ts
│   │   └── helpers.ts
│   └── app.ts                  # Configuration Express
├── uploads/                    # Dossier uploads
├── package.json
└── tsconfig.json
```

### Justification
- **Architecture en couches** : Routes → Controllers → Services → Repositories → Prisma
- **Séparation des responsabilités** : Chaque couche a un rôle unique
- **Testabilité** : Chaque couche est testable indépendamment
- **Middleware pattern** : Auth, validation, erreurs, upload

## 4. Flux de données

```
Requête HTTP
    │
    ▼
Routes (validation URL + méthode)
    │
    ▼
Middleware Auth (vérification JWT)
    │
    ▼
Middleware Validation (données entrantes)
    │
    ▼
Controller (récupère req, appelle service, envoie res)
    │
    ▼
Service (logique métier, règles de gestion)
    │
    ▼
Repository (requêtes Prisma)
    │
    ▼
Prisma ORM (requêtes SQL paramétrées)
    │
    ▼
PostgreSQL
```

## 5. Sécurité

- **JWT** : Token court (15 min) + Refresh Token (7 jours)
- **bcrypt** : Hash des mots de passe (salt rounds = 12)
- **CORS** : Restreint aux origines autorisées
- **Helmet** : Headers de sécurité HTTP
- **Rate limiting** : Protection brute force
- **Validation** : Données validées à chaque couche
- **Rôles** : Middleware de vérification des permissions
