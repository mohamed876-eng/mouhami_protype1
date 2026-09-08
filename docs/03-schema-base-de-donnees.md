# Schéma PostgreSQL — ERP Juridique

## 1. Diagramme Entité-Relation (Texte)

```
┌─────────────────┐       ┌──────────────────┐       ┌──────────────────────┐
│      Users       │       │     Clients       │       │        Cases         │
├─────────────────┤       ├──────────────────┤       ├──────────────────────┤
│ id (PK)         │       │ id (PK)          │       │ id (PK)              │
│ email (UQ)      │◄──────│ userId (FK)      │◄──────│ clientId (FK)        │
│ password        │  1:1  │ nom              │  1:n  │ reference            │
│ nom             │       │ prenom           │       │ mahakimRef           │
│ prenom          │       │ cin (UQ)         │       │ tribunal             │
│ telephone       │       │ telephone        │       │ type                 │
│ role            │       │ adresse          │       │ sousType             │
│ isActive        │       │ ville            │       │ dateCreation         │
│ createdAt       │       │ profession       │       │ etat                 │
│ updatedAt       │       │ photo            │       │ description          │
│ lastLogin       │       │ email            │       │ notes                │
└────────┬────────┘       │ statut           │       │ templateId (FK)      │
         │                │ observations     │       │ progress             │
         │                │ createdAt        │       │ createdAt            │
         │                │ updatedAt        │       │ updatedAt            │
         │                └──────────────────┘       └──────────┬───────────┘
         │                                                      │
         │                                                      │
         │  ┌─────────────────────┐         ┌──────────────────┐│
         │  │   CaseTemplates     │         │ CaseTemplateDocs ││
         │  ├─────────────────────┤         ├──────────────────┤│
         │  │ id (PK)             │         │ id (PK)          ││
         │  │ nom                 │──1:n───││ templateId (FK)  ││
         │  │ slug                │         │ nom              ││
         │  │ description         │         │ obligatoire      ││
         │  │ createdAt           │         │ ordre            ││
         │  └─────────────────────┘         │ createdAt        ││
         │                                  └──────────────────┘│
         │                                                      │
         │  ┌─────────────────────┐         ┌──────────────────┐│
         │  │   DocumentTypes     │         │    Documents     ││
         │  ├─────────────────────┤         ├──────────────────┤│
         │  │ id (PK)             │         │ id (PK)          ││
         │  │ nom                 │──1:n───││ casId (FK)       ││
         │  │ slug                │         │ typeId (FK)      ││
         │  │ icon                │         │ nom              ││
         │  │ createdAt           │         │ description      ││
         │  │ updatedAt           │         │ fileName         ││
         │  └─────────────────────┘         │ filePath         ││
         │                                  │ fileSize         ││
         │  ┌─────────────────────┐         │ auteur           ││
         │  │     Hearings        │         │ etat             ││
         │  ├─────────────────────┤         │ commentaires     ││
         │  │ id (PK)             │         │ uploadedAt       ││
         │  │ casId (FK)          │         │ isClientVisible  ││
         │  │ date                │         │ createdAt        ││
         │  │ heure               │         │ updatedAt        ││
         │  │ type                │         └──────────────────┘
         │  │ tribunal            │
         │  │ salle               │
         │  │ juge                │
         │  │ statut              │
         │  │ notes               │
         │  │ createdAt           │
         │  │ updatedAt           │
         │  └─────────────────────┘
         │
         │  ┌──────────────────────┐      ┌──────────────────────┐
         │  │    Notifications      │      │     Activities        │
         │  ├──────────────────────┤      ├──────────────────────┤
         │  │ id (PK)              │      │ id (PK)              │
         │  │ userId (FK)          │      │ userId (FK)          │
         │  │ titre                │      │ action               │
         │  │ message              │      │ entity               │
         │  │ type                 │      │ entityId             │
         │  │ lu                   │      │ description          │
         │  │ referenceType        │      │ metadata (JSON)      │
         │  │ referenceId          │      │ createdAt            │
         │  │ createdAt            │      └──────────────────────┘
         │  └──────────────────────┘
         │
         │  ┌──────────────────────┐
         │  │      Payments        │
         │  ├──────────────────────┤
         │  │ id (PK)              │
         │  │ casId (FK)           │
         │  │ montant              │
         │  │ date                 │
         │  │ mode                 │
         │  │ reference            │
         │  │ notes                │
         │  │ createdAt            │
         │  └──────────────────────┘
         │
         │  ┌──────────────────────┐
         │  │      Settings        │
         │  ├──────────────────────┤
         │  │ id (PK)              │
         │  │ key (UQ)             │
         │  │ value                │
         │  │ createdAt            │
         │  │ updatedAt            │
         │  └──────────────────────┘
```

## 2. Tables PostgreSQL

### Table : Users
Stocke les comptes utilisateurs (avocats et clients).

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identifiant unique |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email de connexion |
| password | VARCHAR(255) | NOT NULL | Hash bcrypt du mot de passe |
| nom | VARCHAR(100) | NOT NULL | Nom de famille |
| prenom | VARCHAR(100) | NOT NULL | Prénom |
| telephone | VARCHAR(20) | NULL | Numéro de téléphone |
| role | VARCHAR(20) | NOT NULL, DEFAULT 'admin' | admin ou client |
| isActive | BOOLEAN | DEFAULT true | Compte actif ou non |
| createdAt | TIMESTAMP | DEFAULT NOW() | Date de création |
| updatedAt | TIMESTAMP | DEFAULT NOW() | Date de modification |
| lastLogin | TIMESTAMP | NULL | Dernière connexion |

### Table : Clients
Stocke les informations des clients du cabinet.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | UUID | PK | Identifiant unique |
| userId | UUID | FK → Users.id, UNIQUE | Lien vers le compte |
| nom | VARCHAR(100) | NOT NULL | Nom de famille |
| prenom | VARCHAR(100) | NOT NULL | Prénom |
| cin | VARCHAR(20) | UNIQUE, NOT NULL | Carte Nationale |
| telephone | VARCHAR(20) | NOT NULL | Téléphone |
| adresse | TEXT | NULL | Adresse complète |
| ville | VARCHAR(100) | NULL | Ville |
| profession | VARCHAR(100) | NULL | Profession |
| photo | VARCHAR(255) | NULL | URL photo |
| email | VARCHAR(255) | NULL | Email personnel |
| statut | VARCHAR(20) | DEFAULT 'actif' | actif / inactif |
| observations | TEXT | NULL | Notes diverses |
| createdAt | TIMESTAMP | DEFAULT NOW() | Date création |
| updatedAt | TIMESTAMP | DEFAULT NOW() | Date modification |

### Table : Cases
Stocke les dossiers juridiques.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | UUID | PK | Identifiant unique |
| clientId | UUID | FK → Clients.id, NOT NULL | Client associé |
| reference | VARCHAR(50) | UNIQUE, NOT NULL | Référence interne |
| mahakimRef | VARCHAR(50) | NULL | Référence Mahakim |
| tribunal | VARCHAR(200) | NULL | Tribunal compétent |
| type | VARCHAR(100) | NOT NULL | Type d'affaire |
| sousType | VARCHAR(100) | NULL | Sous-type |
| dateCreation | DATE | NOT NULL | Date d'ouverture |
| etat | VARCHAR(50) | DEFAULT 'en_cours' | en_cours, cloture, etc. |
| description | TEXT | NULL | Description |
| notes | TEXT | NULL | Notes internes |
| templateId | UUID | FK → CaseTemplates.id | Modèle utilisé |
| progress | INTEGER | DEFAULT 0 | Pourcentage avancement (0-100) |
| createdAt | TIMESTAMP | DEFAULT NOW() | Date création |
| updatedAt | TIMESTAMP | DEFAULT NOW() | Date modification |

### Table : CaseTemplates
Stocke les modèles de dossiers.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | UUID | PK | Identifiant unique |
| nom | VARCHAR(100) | NOT NULL | Nom du modèle (arabe) |
| slug | VARCHAR(100) | UNIQUE, NOT NULL | Identifiant technique |
| description | TEXT | NULL | Description |
| createdAt | TIMESTAMP | DEFAULT NOW() | Date création |

### Table : CaseTemplateDocuments
Stocke les documents obligatoires pour chaque modèle.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | UUID | PK | Identifiant unique |
| templateId | UUID | FK → CaseTemplates.id | Modèle associé |
| nom | VARCHAR(200) | NOT NULL | Nom du document |
| obligatoire | BOOLEAN | DEFAULT true | Obligatoire ou optionnel |
| ordre | INTEGER | DEFAULT 0 | Ordre d'affichage |
| createdAt | TIMESTAMP | DEFAULT NOW() | Date création |

### Table : DocumentTypes
Stocke les types de documents configurables.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | UUID | PK | Identifiant unique |
| nom | VARCHAR(100) | NOT NULL | Nom du type |
| slug | VARCHAR(100) | UNIQUE, NOT NULL | Identifiant technique |
| icon | VARCHAR(50) | NULL | Icône |
| createdAt | TIMESTAMP | DEFAULT NOW() | Date création |
| updatedAt | TIMESTAMP | DEFAULT NOW() | Date modification |

### Table : Documents
Stocke les documents uploadés.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | UUID | PK | Identifiant unique |
| casId | UUID | FK → Cases.id, NOT NULL | Dossier associé |
| typeId | UUID | FK → DocumentTypes.id | Type de document |
| nom | VARCHAR(200) | NOT NULL | Nom du document |
| description | TEXT | NULL | Description |
| fileName | VARCHAR(255) | NOT NULL | Nom du fichier |
| filePath | VARCHAR(500) | NOT NULL | Chemin du fichier |
| fileSize | INTEGER | NULL | Taille en octets |
| auteur | VARCHAR(100) | NULL | Qui a uploadé |
| etat | VARCHAR(20) | DEFAULT 'en_attente' | en_attente, valide, rejete |
| commentaires | TEXT | NULL | Commentaires |
| uploadedAt | TIMESTAMP | DEFAULT NOW() | Date upload |
| isClientVisible | BOOLEAN | DEFAULT false | Visible par le client |
| createdAt | TIMESTAMP | DEFAULT NOW() | Date création |
| updatedAt | TIMESTAMP | DEFAULT NOW() | Date modification |

### Table : Hearings
Stocke les audiences.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | UUID | PK | Identifiant unique |
| casId | UUID | FK → Cases.id, NOT NULL | Dossier associé |
| date | DATE | NOT NULL | Date de l'audience |
| heure | TIME | NULL | Heure |
| type | VARCHAR(100) | NULL | Type d'audience |
| tribunal | VARCHAR(200) | NULL | Tribunal |
| salle | VARCHAR(100) | NULL | Salle |
| juge | VARCHAR(100) | NULL | Juge |
| statut | VARCHAR(20) | DEFAULT 'planifiee' | planifiee, tenue, reportee, annulee |
| notes | TEXT | NULL | Notes |
| createdAt | TIMESTAMP | DEFAULT NOW() | Date création |
| updatedAt | TIMESTAMP | DEFAULT NOW() | Date modification |

### Table : Notifications
Stocke les notifications.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | UUID | PK | Identifiant unique |
| userId | UUID | FK → Users.id | Destinataire |
| titre | VARCHAR(200) | NOT NULL | Titre |
| message | TEXT | NOT NULL | Message |
| type | VARCHAR(50) | NOT NULL | audience, document, dossier, paiement |
| lu | BOOLEAN | DEFAULT false | Lecture |
| referenceType | VARCHAR(50) | NULL | Type d'entité référencée |
| referenceId | UUID | NULL | ID de l'entité |
| createdAt | TIMESTAMP | DEFAULT NOW() | Date création |

### Table : Activities
Stocke l'historique des actions.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | UUID | PK | Identifiant unique |
| userId | UUID | FK → Users.id | Utilisateur |
| action | VARCHAR(50) | NOT NULL | Type d'action |
| entity | VARCHAR(50) | NOT NULL | Entité concernée |
| entityId | UUID | NULL | ID de l'entité |
| description | TEXT | NULL | Description |
| metadata | JSONB | NULL | Données supplémentaires |
| createdAt | TIMESTAMP | DEFAULT NOW() | Date création |

### Table : Payments
Stocke les paiements.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | UUID | PK | Identifiant unique |
| casId | UUID | FK → Cases.id | Dossier associé |
| montant | DECIMAL(10,2) | NOT NULL | Montant |
| date | DATE | NOT NULL | Date |
| mode | VARCHAR(50) | NOT NULL | especes, cheques, virement |
| reference | VARCHAR(100) | NULL | Référence |
| notes | TEXT | NULL | Notes |
| createdAt | TIMESTAMP | DEFAULT NOW() | Date création |

### Table : Settings
Stocke les paramètres.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | UUID | PK | Identifiant unique |
| key | VARCHAR(100) | UNIQUE, NOT NULL | Clé |
| value | TEXT | NOT NULL | Valeur |
| createdAt | TIMESTAMP | DEFAULT NOW() | Date création |
| updatedAt | TIMESTAMP | DEFAULT NOW() | Date modification |

## 3. Indexes

```sql
CREATE INDEX idx_clients_userId ON Clients(userId);
CREATE INDEX idx_clients_cin ON Clients(cin);
CREATE INDEX idx_clients_nom ON Clients(nom);
CREATE INDEX idx_cases_clientId ON Cases(clientId);
CREATE INDEX idx_cases_reference ON Cases(reference);
CREATE INDEX idx_cases_type ON Cases(type);
CREATE INDEX idx_cases_etat ON Cases(etat);
CREATE INDEX idx_documents_casId ON Documents(casId);
CREATE INDEX idx_documents_typeId ON Documents(typeId);
CREATE INDEX idx_hearings_casId ON Hearings(casId);
CREATE INDEX idx_hearings_date ON Hearings(date);
CREATE INDEX idx_notifications_userId ON Notifications(userId);
CREATE INDEX idx_notifications_lu ON Notifications(lu);
CREATE INDEX idx_activities_userId ON Activities(userId);
CREATE INDEX idx_activities_entity ON Activities(entity, entityId);
CREATE INDEX idx_payments_casId ON Payments(casId);
```

## 4. Relations Prisma

Les relations sont définies dans le schéma Prisma comme suit :

- User 1:1 Client (un utilisateur client correspond à un client)
- Client 1:n Cases (un client a plusieurs dossiers)
- Case n:1 CaseTemplate (un dossier utilise un modèle)
- CaseTemplate 1:n CaseTemplateDocuments
- Case 1:n Documents
- Document n:1 DocumentTypes
- Case 1:n Hearings
- User 1:n Notifications
- User 1:n Activities
- Case 1:n Payments
