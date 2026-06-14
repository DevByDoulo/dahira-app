# 📚 Index de la Documentation - Dahira App

Bienvenue ! Cette page centralise toute la documentation du projet pour vous aider à naviguer facilement.

---

## 🚀 Premiers Pas

### Pour Commencer

| Document | Description | Priorité |
|----------|-------------|----------|
| [QUICK_START.md](./QUICK_START.md) | **Démarrage rapide en 5 minutes** | ⭐⭐⭐ |
| [README.md](./README.md) | Vue d'ensemble complète du projet | ⭐⭐⭐ |
| [setup.sh](./setup.sh) | Script d'installation automatique | ⭐⭐ |

### Configuration

| Document | Description | Priorité |
|----------|-------------|----------|
| [.env.example](./.env.example) | Variables d'environnement | ⭐⭐⭐ |
| [GMAIL_SETUP.md](./GMAIL_SETUP.md) | Configuration Gmail pour emails | ⭐⭐ |
| [database/migrations/create_all_tables.sql](./database/migrations/create_all_tables.sql) | Migration complète BDD | ⭐⭐⭐ |

---

## 📖 Documentation Technique

### API & Endpoints

| Document | Description | Format |
|----------|-------------|--------|
| **[Swagger UI](http://localhost:3000/api-docs)** | **Documentation interactive** | 🌐 Web |
| [SWAGGER_GUIDE.md](./SWAGGER_GUIDE.md) | Guide d'utilisation de Swagger | 📄 MD |
| [API_ENDPOINTS.md](./API_ENDPOINTS.md) | Liste complète des endpoints | 📄 MD |
| [postman_collection.json](./postman_collection.json) | Collection Postman | 📦 JSON |

### Architecture & Code

| Document | Description | Pour qui ? |
|----------|-------------|-----------|
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Guide de contribution | Développeurs |
| [COMPLETION_SUMMARY.md](./COMPLETION_SUMMARY.md) | Récapitulatif détaillé | Tous |
| Structure du code (voir ci-dessous) | Organisation du projet | Développeurs |

---

## 🎯 Documentation par Fonctionnalité

### Authentification & Sécurité

| Module | Documentation | Endpoints |
|--------|--------------|-----------|
| **Auth** | Login, Register | 2 |
| **Password Reset** | [README_INVITATIONS.md](./README_INVITATIONS.md) (section) | 3 |
| **Invitations** | [README_INVITATIONS.md](./README_INVITATIONS.md) | 6 |

### Gestion des Données

| Module | Routes | Swagger Tag |
|--------|--------|-------------|
| **Dahiras** | `/api/dahiras/*` | 🏢 Dahiras |
| **Membres** | `/api/membres/*` | 👥 Membres |
| **Users** | `/api/users/*` | 👤 Users |

### Finances

| Module | Routes | Swagger Tag |
|--------|--------|-------------|
| **Cotisations** | `/api/cotisations/*` | 💰 Cotisations |
| **Dépenses** | `/api/depenses/*` | 💸 Dépenses |
| **Trésorerie** | `/api/tresorerie/*` | 🏦 Trésorerie |
| **Reçus** | `/api/recus/*` | 🧾 Reçus |

### Séances & Présences

| Module | Routes | Swagger Tag |
|--------|--------|-------------|
| **Séances** | `/api/seances/*` | 📅 Séances |
| **Présences** | `/api/presences/*` | ✅ Présences |

### Communication

| Module | Routes | Swagger Tag |
|--------|--------|-------------|
| **Notifications** | `/api/notifications/*` | 🔔 Notifications |
| **Annonces** | `/api/annonces/*` | 📢 Annonces |
| **Événements** | `/api/evenements/*` | 🎉 Événements |

### Statistiques

| Module | Routes | Swagger Tag |
|--------|--------|-------------|
| **Dashboard** | `/api/dashboard/*` | 📊 Dashboard |

---

## 📋 Planification & Roadmap

| Document | Description | Statut |
|----------|-------------|--------|
| [FEATURES_ROADMAP.md](./FEATURES_ROADMAP.md) | Feuille de route complète | 📅 Actif |
| [CHANGELOG.md](./CHANGELOG.md) | Historique des versions | ✅ À jour |

**Priorités actuelles :**
- ✅ Phase 1 : Fondamentaux (COMPLET)
- ✅ Phase 2 : Finance & Transparence (COMPLET)
- 🔄 Phase 3 : Engagement (En cours)

---

## 🛠️ Outils & Utilitaires

### Scripts

| Fichier | Description | Usage |
|---------|-------------|-------|
| [setup.sh](./setup.sh) | Installation automatique | `bash setup.sh` |
| `npm run dev` | Serveur développement | - |
| `npm start` | Serveur production | - |

### Fichiers de Configuration

| Fichier | Description | À modifier |
|---------|-------------|-----------|
| `.env` | Variables d'environnement | ✅ Oui |
| `package.json` | Dépendances npm | ⚠️ Rarement |
| `src/config/db.js` | Configuration BDD | ⚠️ Si nécessaire |
| `src/config/swagger.js` | Configuration Swagger | ❌ Non |

---

## 🏗️ Structure du Projet

```
dahira-app/
│
├── 📁 src/                          # Code source
│   ├── 📁 modules/                  # Modules fonctionnels
│   │   ├── auth/                    # Authentification
│   │   ├── dahiras/                 # Gestion dahiras
│   │   ├── membres/                 # Gestion membres
│   │   ├── dashboard/               # Statistiques
│   │   ├── tresorerie/              # Trésorerie
│   │   ├── depenses/                # Dépenses
│   │   ├── cotisations/             # Cotisations
│   │   ├── presences/               # Présences
│   │   ├── notifications/           # Notifications
│   │   └── ...                      # Autres modules
│   │
│   ├── 📁 middlewares/              # Middlewares Express
│   ├── 📁 utils/                    # Utilitaires
│   ├── 📁 config/                   # Configuration
│   ├── app.js                       # Application Express
│   └── server.js                    # Point d'entrée
│
├── 📁 database/                     # Base de données
│   └── migrations/                  # Scripts SQL
│
├── 📁 uploads/                      # Fichiers uploadés
│
├── 📁 Documentation/                # Tous les fichiers .md
│   ├── README.md                    # Vue d'ensemble
│   ├── QUICK_START.md               # Démarrage rapide
│   ├── SWAGGER_GUIDE.md             # Guide Swagger
│   ├── API_ENDPOINTS.md             # Liste endpoints
│   ├── COMPLETION_SUMMARY.md        # Récapitulatif
│   ├── FEATURES_ROADMAP.md          # Roadmap
│   ├── CONTRIBUTING.md              # Guide contribution
│   ├── CHANGELOG.md                 # Versions
│   └── ...
│
├── .env.example                     # Template config
├── package.json                     # Dépendances
├── postman_collection.json          # Tests Postman
└── setup.sh                         # Installation auto
```

---

## 📖 Guide de Lecture par Profil

### 👨‍💼 Chef de Projet / Product Owner

**À lire en priorité :**
1. [README.md](./README.md) - Vue d'ensemble
2. [COMPLETION_SUMMARY.md](./COMPLETION_SUMMARY.md) - État actuel
3. [FEATURES_ROADMAP.md](./FEATURES_ROADMAP.md) - Prochaines étapes
4. [Swagger UI](http://localhost:3000/api-docs) - Fonctionnalités disponibles

### 👨‍💻 Développeur Backend

**À lire en priorité :**
1. [QUICK_START.md](./QUICK_START.md) - Installation
2. [CONTRIBUTING.md](./CONTRIBUTING.md) - Standards de code
3. [API_ENDPOINTS.md](./API_ENDPOINTS.md) - Tous les endpoints
4. Structure du code (ci-dessus)

### 👨‍🎨 Développeur Frontend

**À lire en priorité :**
1. [Swagger UI](http://localhost:3000/api-docs) - API interactive
2. [SWAGGER_GUIDE.md](./SWAGGER_GUIDE.md) - Comment utiliser
3. [API_ENDPOINTS.md](./API_ENDPOINTS.md) - Référence rapide
4. [postman_collection.json](./postman_collection.json) - Tests

### 🧪 Testeur / QA

**À lire en priorité :**
1. [SWAGGER_GUIDE.md](./SWAGGER_GUIDE.md) - Tests avec Swagger
2. [API_ENDPOINTS.md](./API_ENDPOINTS.md) - Liste complète
3. [Swagger UI](http://localhost:3000/api-docs) - Tests interactifs
4. [postman_collection.json](./postman_collection.json) - Collection

### 📝 Rédacteur / Documentation

**À lire en priorité :**
1. Tous les fichiers .md
2. [CHANGELOG.md](./CHANGELOG.md) - Historique
3. [FEATURES_ROADMAP.md](./FEATURES_ROADMAP.md) - À documenter

---

## 🎓 Parcours d'Apprentissage

### Niveau 1 : Débutant (1-2h)

1. ✅ Lire [QUICK_START.md](./QUICK_START.md)
2. ✅ Installer le projet avec [setup.sh](./setup.sh)
3. ✅ Explorer [Swagger UI](http://localhost:3000/api-docs)
4. ✅ Tester l'authentification

### Niveau 2 : Intermédiaire (3-5h)

1. ✅ Lire [README.md](./README.md) complet
2. ✅ Étudier [API_ENDPOINTS.md](./API_ENDPOINTS.md)
3. ✅ Tester les workflows complets dans Swagger
4. ✅ Comprendre la structure du projet

### Niveau 3 : Avancé (1-2 jours)

1. ✅ Lire [CONTRIBUTING.md](./CONTRIBUTING.md)
2. ✅ Étudier le code source des modules
3. ✅ Comprendre le multi-tenancy
4. ✅ Contribuer à une nouvelle fonctionnalité

---

## 🔍 Recherche Rapide

### Par Type de Documentation

- **📘 Guides** : README, QUICK_START, SWAGGER_GUIDE
- **📋 Référence** : API_ENDPOINTS, Swagger UI
- **📊 État** : COMPLETION_SUMMARY, CHANGELOG
- **📅 Planning** : FEATURES_ROADMAP
- **🛠️ Technique** : CONTRIBUTING, Structure du code

### Par Sujet

- **Installation** : QUICK_START, setup.sh, .env.example
- **API** : Swagger UI, API_ENDPOINTS, SWAGGER_GUIDE
- **Base de données** : create_all_tables.sql
- **Email** : GMAIL_SETUP, README_INVITATIONS
- **Développement** : CONTRIBUTING, Structure du projet
- **Versions** : CHANGELOG, FEATURES_ROADMAP

---

## 💡 Conseils

### Pour Naviguer Efficacement

1. **Utilisez Ctrl+F** dans les fichiers .md pour rechercher
2. **Bookmarkez** cette page comme point de départ
3. **Swagger UI** est votre meilleur ami pour l'API
4. **Les liens relatifs** fonctionnent dans tous les .md

### Pour Rester à Jour

1. Consultez [CHANGELOG.md](./CHANGELOG.md) pour les nouveautés
2. Vérifiez [FEATURES_ROADMAP.md](./FEATURES_ROADMAP.md) pour le futur
3. Les sections [Unreleased] indiquent le travail en cours

---

## 📞 Support & Contact

### Questions sur la Documentation

Si vous ne trouvez pas ce que vous cherchez :
1. Vérifiez cette page d'index
2. Utilisez la fonction recherche (Ctrl+F)
3. Consultez [Swagger UI](http://localhost:3000/api-docs)
4. Ouvrez une issue sur GitHub

### Contribuer à la Documentation

Voir [CONTRIBUTING.md](./CONTRIBUTING.md) pour :
- Standards de documentation
- Comment proposer des améliorations
- Format des commits

---

## ✅ Checklist de Lecture

Pour les nouveaux développeurs :

- [ ] ✅ QUICK_START.md
- [ ] ✅ README.md (sections principales)
- [ ] ✅ Swagger UI (explorer)
- [ ] ✅ API_ENDPOINTS.md (référence)
- [ ] ✅ CONTRIBUTING.md (si contribution)
- [ ] ✅ Structure du projet (comprendre)

Pour les chefs de projet :

- [ ] ✅ README.md
- [ ] ✅ COMPLETION_SUMMARY.md
- [ ] ✅ FEATURES_ROADMAP.md
- [ ] ✅ CHANGELOG.md

---

**Dernière mise à jour :** Juin 2026  
**Version :** 2.0.0

**Bonne lecture ! 📚✨**
