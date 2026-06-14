# 🚀 Guide de Démarrage Rapide - Dahira App

## Installation en 5 minutes

### 1. Installation des dépendances

```bash
npm install
```

### 2. Configuration de la base de données

```bash
# Se connecter à MySQL
mysql -u root -p

# Créer la base de données
CREATE DATABASE dahira_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Exécuter les migrations
mysql -u root -p dahira_app < database/migrations/create_all_tables.sql
```

### 3. Configuration de l'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer le fichier .env avec vos paramètres
nano .env
```

Configuration minimale requise dans `.env` :

```env
# Base de données
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=dahira_app

# JWT
JWT_SECRET=changez_cette_cle_secrete_en_production

# Email (optionnel pour commencer)
SMTP_USER=votre_email@gmail.com
SMTP_PASS=votre_mot_de_passe_application
```

### 4. Démarrer le serveur

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

### 5. Tester l'API

Ouvrez votre navigateur : `http://localhost:3000/api-docs`

## 🧪 Test Rapide avec cURL

### 1. Créer un dahira

```bash
curl -X POST http://localhost:3000/api/dahiras \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Dahira Test",
    "adresse": "Dakar, Sénégal",
    "telephone": "221771234567",
    "email": "test@dahira.sn"
  }'
```

### 2. Voir la liste des dahiras

```bash
curl http://localhost:3000/api/dahiras
```

### 3. S'inscrire (nécessite d'abord une invitation)

Pour tester le système complet, consultez [README_INVITATIONS.md](./README_INVITATIONS.md)

## 📊 Structure du Projet

```
dahira-app/
├── src/
│   ├── app.js                    # Configuration Express
│   ├── server.js                 # Point d'entrée
│   ├── config/
│   │   ├── db.js                 # Configuration MySQL
│   │   └── swagger.js            # Documentation API
│   ├── middlewares/
│   │   ├── auth.middleware.js    # Authentification JWT
│   │   ├── tenant.middleware.js  # Multi-tenancy
│   │   ├── role.middleware.js    # Gestion des rôles
│   │   └── error.middleware.js   # Gestion des erreurs
│   ├── modules/
│   │   ├── auth/                 # Authentification
│   │   ├── dahiras/              # Gestion dahiras
│   │   ├── membres/              # Gestion membres
│   │   ├── users/                # Gestion utilisateurs
│   │   ├── seances/              # Séances
│   │   ├── cotisations/          # Cotisations
│   │   ├── depenses/             # Dépenses
│   │   ├── tresorerie/           # Trésorerie
│   │   ├── presences/            # Présences
│   │   ├── recus/                # Reçus
│   │   ├── notifications/        # Notifications
│   │   ├── dashboard/            # Dashboard
│   │   ├── annonces/             # Annonces
│   │   ├── evenements/           # Événements
│   │   ├── photos/               # Photos
│   │   ├── invitations/          # Invitations
│   │   └── password-reset/       # Réinitialisation MDP
│   └── utils/
│       ├── bcrypt.js             # Hashage mots de passe
│       ├── jwt.js                # Gestion JWT
│       ├── email.js              # Envoi emails
│       └── response.js           # Réponses standardisées
├── database/
│   └── migrations/
│       └── create_all_tables.sql # Migrations complètes
├── uploads/                      # Fichiers uploadés
├── .env                          # Configuration (à créer)
├── .env.example                  # Exemple de configuration
├── package.json                  # Dépendances
└── README.md                     # Documentation complète
```

## 🎯 Endpoints Principaux

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription

### Dashboard
- `GET /api/dashboard/stats` - Statistiques globales
- `GET /api/dashboard/charts` - Graphiques

### Membres
- `GET /api/membres` - Liste des membres
- `POST /api/membres` - Créer un membre
- `GET /api/membres/:id` - Détails d'un membre
- `PUT /api/membres/:id` - Modifier un membre

### Finances
- `GET /api/tresorerie/solde` - Solde actuel
- `GET /api/cotisations` - Liste des cotisations
- `GET /api/depenses` - Liste des dépenses
- `GET /api/depenses/stats` - Statistiques dépenses

### Séances & Présences
- `GET /api/seances` - Liste des séances
- `POST /api/presences` - Enregistrer une présence
- `GET /api/presences/feuille/:id` - Feuille de présence

## 🔐 Authentification

Toutes les routes protégées nécessitent un header `Authorization` :

```bash
Authorization: Bearer <votre_token_jwt>
```

### Obtenir un token

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "telephone": "221771234567",
    "password": "votre_mot_de_passe"
  }'
```

Le token est retourné dans la réponse :

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... }
  }
}
```

## 🎭 Rôles Utilisateur

| Rôle | Permissions |
|------|-------------|
| **bureau** | Accès complet à toutes les fonctionnalités |
| **tresorier** | Gestion financière (cotisations, dépenses, trésorerie) |
| **membre** | Consultation des données uniquement |

## 🔧 Dépendances Installées

```json
{
  "express": "Serveur HTTP",
  "mysql2": "Driver MySQL",
  "bcrypt": "Hashage mots de passe",
  "jsonwebtoken": "Authentification JWT",
  "dotenv": "Variables d'environnement",
  "cors": "Cross-Origin Resource Sharing",
  "multer": "Upload de fichiers",
  "nodemailer": "Envoi d'emails",
  "express-validator": "Validation des données",
  "swagger-jsdoc": "Documentation API",
  "swagger-ui-express": "Interface Swagger"
}
```

## 🐛 Dépannage

### Erreur de connexion MySQL

```bash
# Vérifier que MySQL est en cours d'exécution
sudo systemctl status mysql

# Redémarrer MySQL
sudo systemctl restart mysql
```

### Port 3000 déjà utilisé

Changez le port dans `.env` :

```env
PORT=3001
```

### Erreur "Cannot find module"

```bash
# Réinstaller les dépendances
rm -rf node_modules
npm install
```

### Erreur d'envoi d'email

Vérifiez votre configuration SMTP dans `.env` et consultez [GMAIL_SETUP.md](./GMAIL_SETUP.md)

## 📚 Prochaines Étapes

1. ✅ **Tester l'API** avec Swagger UI ou Postman
2. ✅ **Créer des données de test** (dahiras, membres, etc.)
3. ✅ **Configurer l'email** pour les invitations
4. 📖 **Lire la documentation complète** dans [README.md](./README.md)
5. 🗺️ **Consulter la roadmap** dans [FEATURES_ROADMAP.md](./FEATURES_ROADMAP.md)

## 💡 Conseils de Développement

### Variables d'environnement par environnement

```bash
# Développement
NODE_ENV=development npm run dev

# Production
NODE_ENV=production npm start
```

### Logs de debugging

Ajoutez des `console.log()` dans les services pour déboguer :

```javascript
console.log('Debug:', variable);
```

### Tester les emails en local

Utilisez un service comme [Mailtrap](https://mailtrap.io/) pour tester les emails sans les envoyer réellement.

## 🚀 Déploiement

### Production

1. Configurer les variables d'environnement de production
2. Utiliser un process manager comme PM2
3. Configurer un reverse proxy (Nginx)
4. Activer HTTPS

```bash
# Installer PM2
npm install -g pm2

# Démarrer l'application
pm2 start src/server.js --name dahira-app

# Surveiller l'application
pm2 monit
```

## 🆘 Support

- 📖 Documentation : [README.md](./README.md)
- 🐛 Bugs : Créer une issue sur GitHub
- 💬 Questions : Consulter la documentation Swagger

---

**Bon développement ! 🎉**
