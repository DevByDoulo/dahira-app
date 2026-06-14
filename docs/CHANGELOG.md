# 📝 Changelog - Dahira App

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [2.0.0] - 2026-06-14

### 🎉 Version Majeure - Backend Complet

Cette version marque la complétion complète du backend avec tous les modules exposés via API.

### ✨ Ajouté

#### Nouveaux Modules API
- **Dashboard** - Statistiques globales et graphiques
  - GET /api/dashboard/stats
  - GET /api/dashboard/charts
  - GET /api/dashboard/activity
  - GET /api/dashboard/comparative

- **Trésorerie** - Gestion financière complète
  - GET /api/tresorerie/solde
  - GET /api/tresorerie/transactions
  - GET /api/tresorerie/evolution
  - GET /api/tresorerie/previsions
  - GET /api/tresorerie/alertes

- **Présences** - Gestion des présences aux séances
  - POST /api/presences (individuel)
  - POST /api/presences/batch (masse)
  - GET /api/presences/seance/:id
  - GET /api/presences/membre/:id/stats
  - GET /api/presences/stats
  - GET /api/presences/feuille/:id
  - POST /api/presences/absence
  - DELETE /api/presences/:id

- **Reçus** - Génération et envoi de reçus
  - POST /api/recus/cotisation/:id/generer
  - POST /api/recus/cotisation/:id/envoyer
  - GET /api/recus/cotisation/:id
  - GET /api/recus/membre/:id

- **Notifications** - Système de notifications
  - GET /api/notifications
  - PATCH /api/notifications/:id/read
  - PATCH /api/notifications/read-all
  - DELETE /api/notifications/:id
  - POST /api/notifications/notify-all
  - POST /api/notifications/seance-reminders
  - POST /api/notifications/cotisation-retard

- **Dépenses** - Gestion des dépenses (NOUVEAU MODULE)
  - POST /api/depenses
  - GET /api/depenses
  - GET /api/depenses/stats
  - GET /api/depenses/:id
  - PUT /api/depenses/:id
  - PATCH /api/depenses/:id/valider
  - PATCH /api/depenses/:id/rejeter
  - DELETE /api/depenses/:id

- **Dahiras** - Gestion multi-dahira (NOUVEAU MODULE)
  - POST /api/dahiras
  - GET /api/dahiras
  - GET /api/dahiras/:id
  - PUT /api/dahiras/:id
  - PATCH /api/dahiras/:id/activer
  - PATCH /api/dahiras/:id/desactiver
  - DELETE /api/dahiras/:id

#### Base de Données
- Migration complète avec 15 tables
- Index de performance sur toutes les clés étrangères
- Support UTF-8 complet (émojis, caractères spéciaux)
- Contraintes d'intégrité référentielle

#### Documentation
- README.md complet avec tous les modules
- QUICK_START.md pour démarrage rapide
- COMPLETION_SUMMARY.md - Récapitulatif détaillé
- CONTRIBUTING.md - Guide de contribution
- postman_collection.json - Collection Postman
- setup.sh - Script d'installation automatique

#### Fonctionnalités
- Système de notifications email et in-app
- Rappels automatiques 24h avant séances
- Alertes cotisations en retard
- Prévisions de trésorerie
- Statistiques comparatives (mois actuel vs précédent)
- Feuilles de présence exportables
- Génération de reçus PDF (structure prête)
- Workflow de validation des dépenses

### 🔄 Modifié

#### Routes
- Activation de toutes les routes dans app.js
- Routes password-reset maintenant actives
- Routes dahiras sans tenant middleware (multi-dahira)

#### Services
- Optimisation des requêtes SQL
- Ajout de pagination sur toutes les listes
- Meilleure gestion des erreurs

### 🐛 Corrigé
- Service recus : Dépendances PDFKit optionnelles
- Service notifications : Emails envoyés en arrière-plan
- Multi-tenancy : Isolation stricte par dahira_id

### 📊 Statistiques

- **17 modules API** opérationnels
- **100+ endpoints** disponibles
- **15 tables** de base de données
- **Couverture fonctionnelle** : ~90%

---

## [1.0.0] - 2026-06-01

### 🎉 Version Initiale

#### ✨ Modules Disponibles

- **Authentification**
  - Login / Register
  - JWT authentication

- **Invitations**
  - Système d'invitation par email
  - Tokens sécurisés
  - Workflow complet

- **Password Reset**
  - Réinitialisation par email
  - Tokens avec expiration

- **Membres**
  - CRUD complet
  - Upload photos de profil

- **Users**
  - Gestion des utilisateurs
  - Rôles (bureau, tresorier, membre)

- **Séances**
  - CRUD des séances
  - Types : hebdomadaire, mensuelle, spéciale

- **Cotisations**
  - Enregistrement
  - Validation bureau/trésorier
  - Suivi par mois

- **Annonces**
  - CRUD des annonces
  - Types : info, important, urgent

- **Événements**
  - CRUD des événements
  - Gestion des participations

- **Photos**
  - Upload avec Multer
  - Gestion des photos de profil

#### 🗄️ Base de Données

- Tables principales créées
- Migration invitations disponible

#### 📚 Documentation

- README_INVITATIONS.md
- GMAIL_SETUP.md
- FEATURES_ROADMAP.md

#### 🔐 Sécurité

- Hashage bcrypt
- JWT tokens
- Validation express-validator
- Multi-tenancy par dahira_id

---

## [Unreleased]

### 🚧 En Développement

#### Fonctionnalités Prioritaires
- [ ] Génération PDF avancée (nécessite PDFKit)
- [ ] QR Codes pour émargement
- [ ] Messagerie interne
- [ ] Sondages et votes
- [ ] Calendrier intégré UI

#### Améliorations Techniques
- [ ] Tests unitaires et d'intégration
- [ ] CI/CD Pipeline
- [ ] Docker containerization
- [ ] Logs structurés
- [ ] Monitoring et alertes

#### Application Mobile
- [ ] React Native / Flutter
- [ ] Notifications push
- [ ] Mode hors ligne
- [ ] Scan QR codes

---

## Types de Changements

- **✨ Ajouté** : Nouvelles fonctionnalités
- **🔄 Modifié** : Changements dans les fonctionnalités existantes
- **❌ Déprécié** : Fonctionnalités bientôt supprimées
- **🗑️ Supprimé** : Fonctionnalités supprimées
- **🐛 Corrigé** : Corrections de bugs
- **🔒 Sécurité** : Correctifs de vulnérabilités

---

## Comment Utiliser ce Changelog

### Pour les Développeurs
Consultez ce fichier pour connaître les changements entre versions et les breaking changes.

### Pour les Utilisateurs
Les sections "Ajouté" et "Modifié" vous indiquent les nouvelles fonctionnalités disponibles.

### Pour les Contributeurs
Mettez à jour ce fichier lors de chaque PR majeure.

---

**Format :** [Major.Minor.Patch]
- **Major** : Changements incompatibles avec l'API
- **Minor** : Ajout de fonctionnalités rétrocompatibles
- **Patch** : Corrections de bugs rétrocompatibles

**Liens :**
- [Documentation](./README.md)
- [Roadmap](./FEATURES_ROADMAP.md)
- [Contribution](./CONTRIBUTING.md)
