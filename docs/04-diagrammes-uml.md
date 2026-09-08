# Diagrammes UML — ERP Juridique

## 1. Diagramme de Cas d'Utilisation

```
┌─────────────────────────────────────────────────────────────┐
│                    ERP Juridique                             │
│                                                              │
│  ┌─────────────────────────────────────┐                     │
│  │          Avocat (Admin)             │                     │
│  │                                     │                     │
│  │  ┌───────────────────────────────┐  │                     │
│  │  │ ● S'authentifier              │  │                     │
│  │  │ ● Gérer les clients           │  │                     │
│  │  │ ● Gérer les dossiers          │  │                     │
│  │  │ ● Gérer les documents         │  │                     │
│  │  │ ● Configurer types documents  │  │                     │
│  │  │ ● Gérer les audiences         │  │                     │
│  │  │ ● Générer PDF                 │  │                     │
│  │  │ ● Rechercher (intelligent)    │  │                     │
│  │  │ ● Voir tableau de bord        │  │                     │
│  │  │ ● Gérer les notifications     │  │                     │
│  │  │ ● Gérer les paiements         │  │                     │
│  │  └───────────────────────────────┘  │                     │
│  └─────────────────────────────────────┘                     │
│                                                              │
│  ┌─────────────────────────────────────┐                     │
│  │          Client                     │                     │
│  │                                     │                     │
│  │  ┌───────────────────────────────┐  │                     │
│  │  │ ● S'authentifier              │  │                     │
│  │  │ ● Voir ses dossiers           │  │                     │
│  │  │ ● Voir ses audiences          │  │                     │
│  │  │ ● Télécharger documents PDF   │  │                     │
│  │  │ ● Modifier son profil         │  │                     │
│  │  │ ● Voir ses notifications      │  │                     │
│  │  └───────────────────────────────┘  │                     │
│  └─────────────────────────────────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

## 2. Diagramme de Classes

```
┌─────────────────────────────────────────────────────────────────┐
│                        User                                     │
├─────────────────────────────────────────────────────────────────┤
│ - id: UUID                                                      │
│ - email: String                                                 │
│ - password: String (hash)                                       │
│ - nom: String                                                   │
│ - prenom: String                                                │
│ - telephone: String?                                            │
│ - role: Role (admin | client)                                   │
│ - isActive: Boolean                                             │
│ - createdAt: DateTime                                           │
│ - updatedAt: DateTime                                           │
│ - lastLogin: DateTime?                                          │
├─────────────────────────────────────────────────────────────────┤
│ + login(email, password): Token                                 │
│ + refreshToken(token): Token                                    │
│ + changePassword(old, new): void                                │
└───────────────────────┬─────────────────────────────────────────┘
                        │ 1
                        │
                        │ 0..1 (si rôle = client)
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Client                                    │
├─────────────────────────────────────────────────────────────────┤
│ - id: UUID                                                      │
│ - nom: String                                                   │
│ - prenom: String                                                │
│ - cin: String                                                   │
│ - telephone: String                                             │
│ - adresse: String?                                              │
│ - ville: String?                                                │
│ - profession: String?                                           │
│ - photo: String?                                                │
│ - email: String?                                                │
│ - statut: ClientStatus                                          │
│ - observations: String?                                         │
│ - createdAt: DateTime                                           │
│ - updatedAt: DateTime                                           │
├─────────────────────────────────────────────────────────────────┤
│ + getFullName(): String                                         │
│ + getCases(): Case[]                                            │
└───────────────────────┬─────────────────────────────────────────┘
                        │ 1
                        │
                        │ 0..*
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Case                                      │
├─────────────────────────────────────────────────────────────────┤
│ - id: UUID                                                      │
│ - reference: String                                             │
│ - mahakimRef: String?                                           │
│ - tribunal: String?                                             │
│ - type: String                                                  │
│ - sousType: String?                                             │
│ - dateCreation: Date                                            │
│ - etat: CaseStatus                                              │
│ - description: String?                                          │
│ - notes: String?                                                │
│ - progress: Int                                                 │
│ - createdAt: DateTime                                           │
│ - updatedAt: DateTime                                           │
├─────────────────────────────────────────────────────────────────┤
│ + addDocument(doc): void                                        │
│ + addHearing(hearing): void                                     │
│ + calculateProgress(): void                                     │
│ + exportPDF(): File                                             │
└───────┬─────────────────────────────────────────────────────────┘
        │ 1                          │ 1
        │                            │
        │ 0..*                       │ 1
        ▼                            ▼
┌───────────────────┐   ┌─────────────────────────────────────────┐
│    Document        │   │        CaseTemplate                     │
├───────────────────┤   ├─────────────────────────────────────────┤
│ - id: UUID        │   │ - id: UUID                              │
│ - nom: String     │   │ - nom: String                           │
│ - fileName: String│   │ - slug: String                          │
│ - filePath: String│   │ - description: String?                  │
│ - etat: DocStatus │   │ - createdAt: DateTime                   │
│ - ...             │   └───────────────┬─────────────────────────┘
└───────────────────┘                   │ 1
                                        │
                                        │ 0..*
                                        ▼
                     ┌─────────────────────────────────────────────┐
                     │      CaseTemplateDocument                    │
                     ├─────────────────────────────────────────────┤
                     │ - id: UUID                                  │
                     │ - nom: String                               │
                     │ - obligatoire: Boolean                      │
                     │ - ordre: Int                                │
                     └─────────────────────────────────────────────┘

┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
│     Hearing        │  │   Notification    │  │     Activity      │
├───────────────────┤   ├───────────────────┤   ├───────────────────┤
│ - id: UUID        │   │ - id: UUID        │   │ - id: UUID        │
│ - date: Date      │   │ - titre: String   │   │ - action: String  │
│ - heure: Time?    │   │ - message: String │   │ - entity: String  │
│ - type: String?   │   │ - type: NotifType │   │ - description     │
│ - statut: HearSt  │   │ - lu: Boolean     │   │ - metadata: JSON  │
│ - notes: String?  │   │ - createdAt       │   │ - createdAt       │
└───────────────────┘   └───────────────────┘   └───────────────────┘

┌───────────────────┐   ┌───────────────────┐
│     Payment       │   │   DocumentType    │
├───────────────────┤   ├───────────────────┤
│ - id: UUID        │   │ - id: UUID        │
│ - montant: Decimal│   │ - nom: String     │
│ - date: Date      │   │ - slug: String    │
│ - mode: String    │   │ - icon: String?   │
│ - reference: Str? │   │ - createdAt       │
│ - notes: String?  │   │ - updatedAt       │
└───────────────────┘   └───────────────────┘
```

## 3. Diagramme de Séquence — Authentification

```
┌─────────┐    ┌──────────────┐    ┌────────────┐    ┌──────────┐
│ Client  │    │  Next.js     │    │  Express   │    │PostgreSQL│
│ (Browser)│    │  Frontend    │    │  Backend   │    │          │
└────┬────┘    └──────┬───────┘    └─────┬──────┘    └────┬─────┘
     │                 │                  │                │
     │ POST /auth/login│                  │                │
     │ {email, password}                  │                │
     │────────────────►│                  │                │
     │                 │ POST /api/authentification/login             │
     │                 │ {email, password}                │
     │                 │─────────────────►│               │
     │                 │                  │ FIND USER     │
     │                 │                  │──────────────►│
     │                 │                  │◄──────────────│
     │                 │                  │               │
     │                 │                  │ bcrypt.compare│
     │                 │                  │               │
     │                 │                  │ GENERATE JWT  │
     │                 │                  │ + Refresh     │
     │                 │                  │               │
     │                 │◄─────────────────┤               │
     │                 │ {token, refresh} │               │
     │◄────────────────┤                  │               │
     │ {token, refresh}│                  │               │
     │                 │                  │               │
     │ STORE token     │                  │               │
     │ in httpOnly     │                  │               │
     │ cookie +        │                  │               │
     │ localStorage    │                  │               │
     │                 │                  │               │
     │ REDIRECT to     │                  │               │
     │ /dashboard      │                  │               │
     │                 │                  │               │
```

## 4. Diagramme de Séquence — Création de Dossier avec Modèle

```
┌─────────┐    ┌──────────────┐    ┌────────────┐    ┌──────────┐
│  User   │    │  Frontend    │    │  Backend   │    │PostgreSQL│
└────┬────┘    └──────┬───────┘    └─────┬──────┘    └────┬─────┘
     │                 │                  │                │
     │ CRÉER DOSSIER   │                  │                │
     │ POST /cases     │                  │                │
     │ {clientId, type, ...}             │                │
     │────────────────►│                  │                │
     │                 │ POST /api/dossiers  │                │
     │                 │─────────────────►│                │
     │                 │                  │ RÉCUPÉRER      │
     │                 │                  │ TEMPLATE       │
     │                 │                  │──────────────►│
     │                 │                  │◄──────────────│
     │                 │                  │                │
     │                 │                  │ CRÉER DOSSIER  │
     │                 │                  │──────────────►│
     │                 │                  │◄──────────────│
     │                 │                  │                │
     │                 │                  │ CRÉER CHECKLIST│
     │                 │                  │ items          │
     │                 │                  │──────────────►│
     │                 │                  │◄──────────────│
     │                 │                  │                │
     │                 │                  │ ACTIVITY       │
     │                 │                  │ log            │
     │                 │                  │                │
     │                 │◄─────────────────┤                │
     │                 │ 201 {case}       │                │
     │◄────────────────┤                  │                │
     │ {case, checklist}│                 │                │
     │                 │                  │                │
```

## 5. Diagramme de Déploiement

```
┌─────────────────────────────────────────────────────────────────┐
│                      Serveur Production                         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Node.js Runtime                              │   │
│  │                                                           │   │
│  │  ┌────────────────────┐    ┌─────────────────────────┐   │   │
│  │  │   Frontend         │    │    Backend              │   │   │
│  │  │   Next.js 15       │◄──►│    Express.js           │   │   │
│  │  │   Port 3000        │    │    Port 4000             │   │   │
│  │  └────────────────────┘    └──────────┬──────────────┘   │   │
│  │                                       │                   │   │
│  └───────────────────────────────────────┼───────────────────┘   │
│                                          │                       │
│  ┌───────────────────────────────────────┼───────────────────┐   │
│  │                                       ▼                   │   │
│  │                              ┌──────────────────┐         │   │
│  │                              │   PostgreSQL     │         │   │
│  │                              │   Port 5432      │         │   │
│  │                              └──────────────────┘         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │               Stockage Fichiers                          │   │
│  │                                                          │   │
│  │  ┌────────────────────┐   ┌──────────────────────────┐  │   │
│  │  │  uploads/          │   │  public/images/          │  │   │
│  │  │  PDFs clients      │   │  logo, icons, bg         │  │   │
│  │  └────────────────────┘   └──────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```
