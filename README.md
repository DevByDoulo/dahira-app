# 🕌 Dahira App - API Backend

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](./CHANGELOG.md)
[![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/mysql-%3E%3D8.0-orange.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![API Docs](https://img.shields.io/badge/API-Swagger-85EA2D.svg)](http://localhost:3000/api-docs)

Application de gestion complète pour les dahiras (organisations religieuses).

**🎉 Version 2.0 - Backend Complet avec 100+ Endpoints**

---

## 📊 Statistiques du Projet

- ✅ **17 modules API** opérationnels
- ✅ **100+ endpoints** documentés
- ✅ **15 tables** de base de données
- ✅ **Documentation Swagger** interactive
- ✅ **Multi-tenant** avec isolation complète
- ✅ **Authentification JWT** sécurisée

---

## 📋 Table des Matières

- [Fonctionnalités](#fonctionnalités)
- [Installation](#installation)
- [Configuration](#configuration)
- [Modules API](#modules-api)
- [Base de Données](#base-de-données)
- [Documentation](#documentation)

## ✨ Fonctionnalités

### ✅ Modules Complets et Opérationnels

1. **Authentification & Sécurité**
   - Login/Register
   - Invitations par email avec token sécurisé
   - Réinitialisation de mot de passe par email
   - JWT authentication

2. **Gestion des Membres**
   - CRUD complet des membres
   - Photos de profil (upload avec Multer)
   - Statuts actifs/inactifs

3. **Gestion Financière**
   - **Cotisations** : enregistrement, validation, suivi par mois
   - **Dépenses** : création, validation bureau, catégories, justificatifs
   - **Trésorerie** : solde en temps réel, historique transactions, prévisions
   - **Reçus** : génération automatique (PDF - à implémenter avec PDFKit)

4. **Séances & Présences**
   - Gestion des séances (hebdomadaires, mensuelles, spéciales)
   - Enregistrement des présences (individuel et batch)
   - Statistiques de présence par membre
   - Feuilles de présence exportables

5. **Communication**
   - Annonces
   - Événements avec inscriptions
   - **Notifications** : email, in-app, rappels automatiques

6. **Dashboard & Rapports**
   - Statistiques globales (membres, cotisations, trésorerie)
   - Graphiques d'évolution
   - Activité récente
   - Comparaisons mois actuel vs précédent

7. **Multi-Dahira**
   - Gestion de plusieurs dahiras
   - Isolation complète des données par dahira

## 🚀 Installation

### Prérequis

- Node.js (v14+)
- MySQL (v8+)
- npm ou yarn

### Étapes

```bash
# 1. Cloner le repository
git clone <repository-url>
cd dahira-app

# 2. Installer les dépendances
npm install

# 3. Copier et configurer les variables d'environnement
cp .env.example .env

# 4. Créer la base de données
mysql -u root -p
CREATE DATABASE dahira_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# 5. Exécuter les migrations
mysql -u root -p dahira_app < database/migrations/create_all_tables.sql

# 6. Démarrer le serveur
npm run dev
```

## ⚙️ Configuration

Configurez votre fichier `.env` :

```env
# Serveur
PORT=3000
NODE_ENV=development

# Base de données
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=dahira_app

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

# SMTP (Email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre_email@gmail.com
SMTP_PASS=votre_mot_de_passe_application
SMTP_FROM_NAME=Dahira App
SMTP_FROM_EMAIL=noreply@dahira-app.com

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Configuration Gmail

Voir [GMAIL_SETUP.md](./GMAIL_SETUP.md) pour la configuration complète.

## 📦 Modules API

### 1. Authentification (`/api/auth`)
- `POST /login` - Connexion
- `POST /register` - Inscription (avec invitation)

### 2. Password Reset (`/api/password-reset`)
- `POST /request` - Demander réinitialisation
- `GET /verify/:token` - Vérifier token
- `POST /reset` - Réinitialiser mot de passe

### 3. Invitations (`/api/invitations`)
- `POST /` - Créer invitation
- `GET /` - Liste invitations
- `GET /verify/:token` - Vérifier invitation
- `POST /accept` - Accepter invitation
- `POST /:id/resend` - Renvoyer invitation
- `PATCH /:id/cancel` - Annuler invitation

### 4. Dahiras (`/api/dahiras`)
- `POST /` - Créer dahira
- `GET /` - Liste dahiras
- `GET /:id` - Détails dahira
- `PUT /:id` - Modifier dahira
- `PATCH /:id/activer` - Activer
- `PATCH /:id/desactiver` - Désactiver

### 5. Membres (`/api/membres`)
- CRUD complet des membres
- `POST /:id/photo` - Upload photo profil
- `DELETE /:id/photo` - Supprimer photo

### 6. Dashboard (`/api/dashboard`)
- `GET /stats` - Statistiques globales
- `GET /charts` - Données pour graphiques
- `GET /activity` - Activité récente
- `GET /comparative` - Comparaisons mensuelles

### 7. Trésorerie (`/api/tresorerie`)
- `GET /solde` - Solde actuel
- `GET /transactions` - Historique
- `GET /evolution` - Évolution par période
- `GET /previsions` - Prévisions futures
- `GET /alertes` - Alertes trésorerie

### 8. Dépenses (`/api/depenses`)
- `POST /` - Créer dépense
- `GET /` - Liste dépenses (avec filtres)
- `GET /stats` - Statistiques
- `GET /:id` - Détails dépense
- `PUT /:id` - Modifier dépense
- `PATCH /:id/valider` - Valider dépense (Bureau)
- `PATCH /:id/rejeter` - Rejeter dépense (Bureau)
- `DELETE /:id` - Supprimer dépense

### 9. Présences (`/api/presences`)
- `POST /` - Enregistrer présence
- `POST /batch` - Enregistrer plusieurs présences
- `GET /seance/:id` - Présences d'une séance
- `GET /membre/:id/stats` - Stats d'un membre
- `GET /stats` - Statistiques globales
- `GET /feuille/:id` - Feuille de présence
- `POST /absence` - Marquer absence
- `DELETE /:id` - Supprimer présence

### 10. Reçus (`/api/recus`)
- `POST /cotisation/:id/generer` - Générer reçu PDF
- `POST /cotisation/:id/envoyer` - Envoyer par email
- `GET /cotisation/:id` - Récupérer reçu
- `GET /membre/:id` - Tous les reçus d'un membre

### 11. Notifications (`/api/notifications`)
- `GET /` - Liste notifications utilisateur
- `PATCH /:id/read` - Marquer comme lue
- `PATCH /read-all` - Tout marquer lu
- `DELETE /:id` - Supprimer notification
- `POST /notify-all` - Notifier tous (Bureau)
- `POST /seance-reminders` - Rappels séances
- `POST /cotisation-retard` - Alertes retards

### 12. Séances (`/api/seances`)
- CRUD complet des séances
- Gestion des séances courantes
- Clôture de séances

### 13. Cotisations (`/api/cotisations`)
- Enregistrement des cotisations
- Validation (Bureau/Trésorier)
- Filtres par mois, membre, statut

### 14. Annonces (`/api/annonces`)
- CRUD des annonces
- Types : info, important, urgent

### 15. Événements (`/api/evenements`)
- CRUD des événements
- Gestion des participations

## 🗄️ Base de Données

### Tables Principales

```
dahiras              - Informations des dahiras
membres              - Membres du dahira
users                - Comptes utilisateurs
seances              - Séances (hebdomadaires, mensuelles, etc.)
cotisations          - Cotisations des membres
presences            - Présences aux séances
depenses             - Dépenses du dahira
recus                - Reçus de cotisation
notifications        - Notifications utilisateurs
password_resets      - Tokens de réinitialisation
invitations          - Invitations par email
annonces             - Annonces du dahira
evenements           - Événements
participations       - Inscriptions aux événements
photos               - Galerie photos
```

### Migration

Exécutez le fichier de migration complet :

```bash
mysql -u root -p dahira_app < database/migrations/create_all_tables.sql
```

## 📚 Documentation

### Documentation Interactive

La documentation complète et interactive de l'API est disponible via **Swagger UI** :

```
http://localhost:3000/api-docs
```

**Fonctionnalités Swagger UI :**
- 🎯 Interface interactive pour tester tous les endpoints
- 📖 Documentation complète avec exemples
- 🔐 Authentification intégrée (JWT)
- 📊 Schémas de données détaillés
- 🎨 Interface moderne et personnalisée
- 🔍 Filtrage et recherche d'endpoints

**Guides :**
- [SWAGGER_GUIDE.md](./SWAGGER_GUIDE.md) - Guide complet d'utilisation de Swagger
- [API_ENDPOINTS.md](./API_ENDPOINTS.md) - Liste complète des endpoints

### Documentation du Projet

- **README.md** (ce fichier) - Vue d'ensemble complète
- **QUICK_START.md** - Démarrage rapide en 5 minutes
- **COMPLETION_SUMMARY.md** - Récapitulatif des fonctionnalités
- **FEATURES_ROADMAP.md** - Feuille de route des fonctionnalités
- **CONTRIBUTING.md** - Guide de contribution
- **CHANGELOG.md** - Historique des versions

### Autres Ressources

- **postman_collection.json** - Collection Postman pour tester l'API
- **GMAIL_SETUP.md** - Configuration Gmail pour les emails
- **README_INVITATIONS.md** - Documentation du système d'invitations

### Rôles et Permissions

- **Bureau** : Accès complet à toutes les fonctionnalités
- **Trésorier** : Gestion financière (cotisations, dépenses, trésorerie)
- **Membre** : Consultation des données

### Multi-tenancy

L'application est **multi-tenant** avec isolation complète par `dahira_id` :
- Chaque requête est filtrée par le dahira de l'utilisateur
- Impossible d'accéder aux données d'un autre dahira
- Le `tenantMiddleware` assure l'isolation

## 🔧 Dépendances à Installer (Optionnel)

Pour activer certaines fonctionnalités avancées :

```bash
# Pour la génération de PDF (reçus)
npm install pdfkit

# Pour les QR codes
npm install qrcode

# Pour le resize d'images
npm install sharp
```

## 🚧 Fonctionnalités en Développement

Voir [FEATURES_ROADMAP.md](./FEATURES_ROADMAP.md) pour la feuille de route complète.

### Priorités Phase 1 (Complet ✅)
- ✅ Réinitialisation mot de passe
- ✅ Dashboard avancé
- ✅ Trésorerie complète
- ✅ Gestion des présences
- ✅ Système de notifications
- ✅ Gestion des dépenses

### Priorités Phase 2 (À venir)
- 🔄 Génération PDF avancée (reçus, rapports)
- 🔄 QR codes (émargement, paiements)
- 🔄 Messagerie interne
- 🔄 Sondages et votes
- 🔄 Application mobile

## 📝 Scripts NPM

```bash
# Développement avec auto-reload
npm run dev

# Production
npm start

# Tests (à implémenter)
npm test
```

## 🤝 Contribution

Pour contribuer au projet :

1. Fork le repository
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 👥 Support

Pour toute question ou problème :
- Créer une issue sur GitHub
- Consulter la documentation Swagger
- Lire [README_INVITATIONS.md](./README_INVITATIONS.md) pour le système d'invitations

---

**Dernière mise à jour :** Juin 2026  
**Version :** 2.0 - Modules complets
