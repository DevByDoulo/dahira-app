# 📧 Système d'Invitation par Email

## Vue d'ensemble

Le système d'invitation permet aux responsables d'un Dahira (bureau/trésorier) d'inviter des membres à créer leur compte utilisateur via un lien sécurisé envoyé par email.

## 🔄 Workflow

```
1. Responsable crée une invitation pour un membre
   ↓
2. Email automatique envoyé au membre avec lien d'invitation
   ↓
3. Membre clique sur le lien (valide 7 jours)
   ↓
4. Membre définit son mot de passe et crée son compte
   ↓
5. Compte activé automatiquement + connexion immédiate
   ↓
6. Email de bienvenue envoyé
```

## 📦 Installation

### 1. Installer les dépendances

```bash
npm install nodemailer
```

### 2. Créer la table en base de données

Exécutez le script SQL :

```bash
mysql -u root -p dahira_app < database/migrations/create_invitations_table.sql
```

Ou copiez le contenu de `database/migrations/create_invitations_table.sql` dans votre client MySQL.

### 3. Configuration des variables d'environnement

Ajoutez ces variables dans votre fichier `.env` :

```env
# Configuration SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre_email@gmail.com
SMTP_PASS=votre_mot_de_passe_application
SMTP_FROM_NAME=Dahira App
SMTP_FROM_EMAIL=noreply@dahira-app.com

# URL du frontend
FRONTEND_URL=http://localhost:3000
```

### Configuration Gmail (recommandé pour le développement)

1. Activer la validation en 2 étapes sur votre compte Gmail
2. Générer un mot de passe d'application :
   - Aller dans [Paramètres Google](https://myaccount.google.com/security)
   - Rechercher "Mots de passe des applications"
   - Créer un nouveau mot de passe pour "Autre (nom personnalisé)"
   - Utiliser ce mot de passe dans `SMTP_PASS`

### Autres fournisseurs SMTP

**SendGrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=votre_api_key_sendgrid
```

**Mailgun:**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=votre_username@sandbox.mailgun.org
SMTP_PASS=votre_password_mailgun
```

**Office 365:**
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=votre_email@outlook.com
SMTP_PASS=votre_mot_de_passe
```

## 🔌 API Endpoints

### 1. Créer une invitation

**POST** `/api/invitations`

**Authentification:** Requise (Bureau/Trésorier)

**Body:**
```json
{
  "membre_id": 1,
  "email": "membre@example.com",
  "role": "membre"
}
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "dahira_id": 1,
    "membre_id": 1,
    "email": "membre@example.com",
    "role": "membre",
    "token": "abc123def456...",
    "expires_at": "2026-06-21T12:00:00.000Z",
    "statut": "pending",
    "invitation_link": "http://localhost:3000/invitation/accept?token=abc123..."
  }
}
```

### 2. Vérifier une invitation

**GET** `/api/invitations/verify/:token`

**Authentification:** Non requise (endpoint public)

**Réponse:**
```json
{
  "success": true,
  "data": {
    "membre_nom": "Diallo",
    "membre_prenom": "Amadou",
    "dahira_nom": "Dahira Touba",
    "email": "membre@example.com",
    "role": "membre",
    "expires_at": "2026-06-21T12:00:00.000Z"
  }
}
```

### 3. Accepter une invitation (Inscription)

**POST** `/api/invitations/accept`

**Authentification:** Non requise (endpoint public)

**Body:**
```json
{
  "token": "abc123def456...",
  "password": "motdepasse123",
  "telephone": "221771234567"
}
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 5,
      "dahira_id": 1,
      "membre_id": 1,
      "nom": "Amadou Diallo",
      "telephone": "221771234567",
      "email": "membre@example.com",
      "role": "membre",
      "actif": true
    }
  }
}
```

### 4. Lister les invitations

**GET** `/api/invitations?statut=pending`

**Authentification:** Requise (Bureau/Trésorier)

**Query params:**
- `statut` (optionnel): `pending`, `accepted`, `expired`, `cancelled`

### 5. Annuler une invitation

**PATCH** `/api/invitations/:id/cancel`

**Authentification:** Requise (Bureau/Trésorier)

### 6. Renvoyer une invitation

**POST** `/api/invitations/:id/resend`

**Authentification:** Requise (Bureau/Trésorier)

Génère un nouveau token et renvoie l'email.

## 🔐 Sécurité

### Token d'invitation
- Généré avec `crypto.randomBytes(32)` (256 bits)
- Unique et non prédictible
- Expire après 7 jours
- Usage unique (désactivé après acceptation)

### Validations
- Vérification que le membre existe et appartient au dahira
- Vérification qu'aucun compte n'existe déjà pour ce membre
- Vérification qu'aucune invitation active n'existe
- Vérification de l'expiration du token
- Validation du format email
- Mot de passe minimum 6 caractères

### Multi-tenancy
- Isolation complète par `dahira_id`
- Impossible d'inviter un membre d'un autre dahira
- Impossible d'accepter une invitation pour un autre dahira

## 📧 Templates d'emails

### Email d'invitation
- Design responsive HTML
- Bouton CTA clair
- Lien de secours (copier-coller)
- Avertissement sur l'expiration (7 jours)
- Contexte : nom du dahira et inviteur

### Email de bienvenue
- Confirmation de création de compte
- Instructions de connexion
- Message personnalisé

## 🧪 Tests manuels

### 1. Tester l'envoi d'email (optionnel)

Créez un fichier `test-email.js` :

```javascript
require('dotenv').config();
const { sendInvitationEmail } = require('./src/utils/email');

sendInvitationEmail(
  'test@example.com',
  'Test User',
  'http://localhost:3000/invitation/accept?token=test123',
  'Mon Dahira',
  'Admin'
).then(() => {
  console.log('Email envoyé avec succès');
  process.exit(0);
}).catch(err => {
  console.error('Erreur:', err);
  process.exit(1);
});
```

Puis exécutez :
```bash
node test-email.js
```

### 2. Workflow complet avec cURL

**Étape 1 : Login en tant que responsable**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"telephone": "221771234567", "password": "password123"}'
```

**Étape 2 : Créer une invitation**
```bash
curl -X POST http://localhost:3000/api/invitations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "membre_id": 1,
    "email": "nouveau@example.com",
    "role": "membre"
  }'
```

**Étape 3 : Vérifier l'invitation (sans auth)**
```bash
curl http://localhost:3000/api/invitations/verify/TOKEN_FROM_STEP_2
```

**Étape 4 : Accepter l'invitation**
```bash
curl -X POST http://localhost:3000/api/invitations/accept \
  -H "Content-Type: application/json" \
  -d '{
    "token": "TOKEN_FROM_STEP_2",
    "password": "nouveauMotDePasse123",
    "telephone": "221771234567"
  }'
```

## 📊 Statuts d'invitation

| Statut | Description |
|--------|-------------|
| `pending` | En attente d'acceptation |
| `accepted` | Acceptée, compte créé |
| `expired` | Expirée (> 7 jours) |
| `cancelled` | Annulée manuellement |

## 🐛 Dépannage

### Erreur : "Impossible d'envoyer l'email"

1. Vérifiez vos identifiants SMTP dans `.env`
2. Vérifiez que le port est correct (587 pour TLS, 465 pour SSL)
3. Vérifiez les logs console pour plus de détails
4. Testez avec Gmail + mot de passe d'application

### Erreur : "Ce membre possède déjà un compte"

Le membre a déjà été invité et a créé son compte. Utilisez la fonctionnalité de réinitialisation de mot de passe à la place.

### Erreur : "Une invitation active existe déjà"

Une invitation non expirée existe. Options :
- Renvoyer l'invitation existante avec `/api/invitations/:id/resend`
- Annuler l'invitation et en créer une nouvelle

## 🚀 Améliorations futures

- [ ] Personnalisation des templates d'emails par dahira
- [ ] Support de l'internationalisation (i18n) dans les emails
- [ ] Notifications push en plus des emails
- [ ] Historique des invitations envoyées
- [ ] Statistiques d'acceptation des invitations
- [ ] Rappel automatique avant expiration
- [ ] Support des invitations en masse (CSV)

## 📝 Notes

- Les invitations expirées sont automatiquement marquées lors de la vérification
- Un membre peut recevoir plusieurs invitations (mais une seule active à la fois)
- L'email de bienvenue est envoyé de manière asynchrone (non bloquant)
- Le token JWT est retourné après acceptation pour connexion immédiate
