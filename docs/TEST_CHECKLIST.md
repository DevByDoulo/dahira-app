# ✅ Checklist de Tests - Dahira App

## 🎯 Objectif

Ce document permet de vérifier que toutes les fonctionnalités du backend sont opérationnelles.

---

## 📋 Tests de Configuration

### Installation

- [ ] ✅ Node.js installé (v14+)
- [ ] ✅ MySQL installé (v8+)
- [ ] ✅ npm install sans erreur
- [ ] ✅ Fichier .env configuré
- [ ] ✅ Base de données créée
- [ ] ✅ Migrations SQL exécutées

### Démarrage

- [ ] ✅ `npm run dev` démarre sans erreur
- [ ] ✅ Connexion MySQL réussie
- [ ] ✅ Serveur écoute sur port 3000
- [ ] ✅ Message "Serveur démarré sur le port 3000" affiché

---

## 🌐 Tests Swagger UI

### Accès

- [ ] ✅ http://localhost:3000/api-docs accessible
- [ ] ✅ Interface Swagger se charge correctement
- [ ] ✅ CSS personnalisé appliqué
- [ ] ✅ Message d'accueil visible
- [ ] ✅ 17 tags affichés

### Navigation

- [ ] ✅ Barre de recherche fonctionne
- [ ] ✅ Filtrage par tag fonctionne
- [ ] ✅ Expand/Collapse fonctionne
- [ ] ✅ Schemas visibles en bas
- [ ] ✅ Tous les endpoints sont documentés

---

## 🔐 Tests d'Authentification

### Login (POST /api/auth/login)

- [ ] ✅ Endpoint accessible
- [ ] ✅ Login avec identifiants valides réussit
- [ ] ✅ Retourne un token JWT
- [ ] ✅ Token a le bon format
- [ ] ✅ Login avec identifiants invalides échoue (401)

### Authentification Swagger

- [ ] ✅ Bouton "Authorize" visible
- [ ] ✅ Modal d'authentification s'ouvre
- [ ] ✅ Token accepté après "Authorize"
- [ ] ✅ Cadenas fermé après authentification
- [ ] ✅ Token persisté après rechargement

---

## 🏢 Tests Modules Principaux

### Dahiras (7 endpoints)

- [ ] ✅ POST /api/dahiras - Créer dahira
- [ ] ✅ GET /api/dahiras - Liste dahiras
- [ ] ✅ GET /api/dahiras/:id - Détails dahira
- [ ] ✅ PUT /api/dahiras/:id - Modifier dahira
- [ ] ✅ PATCH /api/dahiras/:id/activer - Activer
- [ ] ✅ PATCH /api/dahiras/:id/desactiver - Désactiver
- [ ] ✅ DELETE /api/dahiras/:id - Supprimer (si vide)

### Dashboard (4 endpoints)

- [ ] ✅ GET /api/dashboard/stats - Statistiques
- [ ] ✅ GET /api/dashboard/charts - Graphiques
- [ ] ✅ GET /api/dashboard/activity - Activité récente
- [ ] ✅ GET /api/dashboard/comparative - Comparaisons

**Données retournées :**
- [ ] ✅ Statistiques membres présentes
- [ ] ✅ Statistiques cotisations présentes
- [ ] ✅ Solde trésorerie présent
- [ ] ✅ Graphiques avec données valides

### Trésorerie (5 endpoints)

- [ ] ✅ GET /api/tresorerie/solde - Solde actuel
- [ ] ✅ GET /api/tresorerie/transactions - Historique
- [ ] ✅ GET /api/tresorerie/evolution - Évolution
- [ ] ✅ GET /api/tresorerie/previsions - Prévisions
- [ ] ✅ GET /api/tresorerie/alertes - Alertes

**Calculs :**
- [ ] ✅ Solde global correct (entrées - sorties)
- [ ] ✅ Solde par mode de paiement correct
- [ ] ✅ Prévisions basées sur moyennes

### Dépenses (8 endpoints)

- [ ] ✅ POST /api/depenses - Créer dépense
- [ ] ✅ GET /api/depenses - Liste dépenses
- [ ] ✅ GET /api/depenses/stats - Statistiques
- [ ] ✅ GET /api/depenses/:id - Détails
- [ ] ✅ PUT /api/depenses/:id - Modifier
- [ ] ✅ PATCH /api/depenses/:id/valider - Valider (Bureau)
- [ ] ✅ PATCH /api/depenses/:id/rejeter - Rejeter (Bureau)
- [ ] ✅ DELETE /api/depenses/:id - Supprimer

**Workflow :**
- [ ] ✅ Création → Statut "en_attente"
- [ ] ✅ Validation → Statut "validee"
- [ ] ✅ Rejet → Statut "rejetee"
- [ ] ✅ Modification possible seulement si "en_attente"

### Présences (8 endpoints)

- [ ] ✅ POST /api/presences - Enregistrer présence
- [ ] ✅ POST /api/presences/batch - Présences en masse
- [ ] ✅ GET /api/presences/seance/:id - Présences séance
- [ ] ✅ GET /api/presences/membre/:id/stats - Stats membre
- [ ] ✅ GET /api/presences/stats - Stats globales
- [ ] ✅ GET /api/presences/feuille/:id - Feuille présence
- [ ] ✅ POST /api/presences/absence - Marquer absence
- [ ] ✅ DELETE /api/presences/:id - Supprimer

**Calculs :**
- [ ] ✅ Taux de présence par membre correct
- [ ] ✅ Statistiques globales correctes
- [ ] ✅ Feuille de présence complète

### Notifications (7 endpoints)

- [ ] ✅ GET /api/notifications - Mes notifications
- [ ] ✅ PATCH /api/notifications/:id/read - Marquer lue
- [ ] ✅ PATCH /api/notifications/read-all - Tout marquer
- [ ] ✅ DELETE /api/notifications/:id - Supprimer
- [ ] ✅ POST /api/notifications/notify-all - Notifier tous
- [ ] ✅ POST /api/notifications/seance-reminders - Rappels
- [ ] ✅ POST /api/notifications/cotisation-retard - Alertes

**Fonctionnalités :**
- [ ] ✅ Compteur de non lues fonctionnel
- [ ] ✅ Notifications créées correctement
- [ ] ✅ Emails envoyés (si configuré)

### Reçus (4 endpoints)

- [ ] ✅ POST /api/recus/cotisation/:id/generer - Générer
- [ ] ✅ POST /api/recus/cotisation/:id/envoyer - Envoyer
- [ ] ✅ GET /api/recus/cotisation/:id - Récupérer
- [ ] ✅ GET /api/recus/membre/:id - Tous les reçus

**Note :** PDF nécessite PDFKit

---

## 🔒 Tests de Sécurité

### Multi-Tenancy

- [ ] ✅ Utilisateur ne voit que son dahira
- [ ] ✅ Impossible d'accéder aux données autre dahira
- [ ] ✅ dahira_id filtré sur toutes les requêtes
- [ ] ✅ tenantMiddleware fonctionne

### Permissions

#### Bureau (Accès Complet)
- [ ] ✅ Peut créer/modifier/supprimer membres
- [ ] ✅ Peut valider/rejeter dépenses
- [ ] ✅ Peut gérer les rôles
- [ ] ✅ Peut notifier tous les membres

#### Trésorier
- [ ] ✅ Peut gérer cotisations
- [ ] ✅ Peut créer dépenses
- [ ] ✅ Peut voir trésorerie
- [ ] ✅ Ne peut PAS valider dépenses

#### Membre
- [ ] ✅ Peut voir les données
- [ ] ✅ Peut voir ses cotisations
- [ ] ✅ Ne peut PAS modifier les données
- [ ] ✅ Ne peut PAS voir finances détaillées

### JWT

- [ ] ✅ Token expire après 7 jours (configurable)
- [ ] ✅ Token invalide retourne 401
- [ ] ✅ Token manquant retourne 401
- [ ] ✅ Token contient dahira_id et role

---

## 📊 Tests de Performance

### Requêtes Simples

- [ ] ✅ GET /api/dashboard/stats < 500ms
- [ ] ✅ GET /api/membres < 200ms
- [ ] ✅ POST /api/cotisations < 300ms

### Requêtes Complexes

- [ ] ✅ GET /api/tresorerie/evolution < 1s
- [ ] ✅ GET /api/dashboard/charts < 1s
- [ ] ✅ GET /api/presences/feuille/:id < 1s

### Charge

- [ ] ✅ 10 requêtes simultanées OK
- [ ] ✅ Pas de memory leaks
- [ ] ✅ Connexions DB fermées correctement

---

## 🐛 Tests d'Erreurs

### Validation

- [ ] ✅ Champs requis manquants → 400
- [ ] ✅ Formats invalides → 400
- [ ] ✅ Valeurs hors limites → 400

### Authentification

- [ ] ✅ Token manquant → 401
- [ ] ✅ Token expiré → 401
- [ ] ✅ Token invalide → 401

### Permissions

- [ ] ✅ Rôle insuffisant → 403
- [ ] ✅ Membre essaie de modifier → 403
- [ ] ✅ Trésorier essaie de valider → 403

### Ressources

- [ ] ✅ ID inexistant → 404
- [ ] ✅ Ressource autre dahira → 404

---

## 📧 Tests Email (si configuré)

### SMTP

- [ ] ✅ Configuration SMTP valide
- [ ] ✅ Connexion SMTP réussie

### Invitations

- [ ] ✅ Email d'invitation envoyé
- [ ] ✅ Lien valide dans email
- [ ] ✅ Token fonctionne

### Password Reset

- [ ] ✅ Email de réinitialisation envoyé
- [ ] ✅ Lien valide dans email
- [ ] ✅ Token expire après 1h

### Notifications

- [ ] ✅ Notifications envoyées par email
- [ ] ✅ Format email correct

---

## 📱 Tests API Complète

### Workflow 1 : Invitation → Inscription

1. [ ] ✅ Bureau crée invitation
2. [ ] ✅ Email envoyé avec token
3. [ ] ✅ Token vérifié
4. [ ] ✅ Invitation acceptée
5. [ ] ✅ Compte créé
6. [ ] ✅ Login réussi

### Workflow 2 : Séance Complète

1. [ ] ✅ Créer séance
2. [ ] ✅ Enregistrer présences
3. [ ] ✅ Consulter feuille présence
4. [ ] ✅ Voir statistiques
5. [ ] ✅ Clôturer séance

### Workflow 3 : Gestion Financière

1. [ ] ✅ Consulter solde
2. [ ] ✅ Créer cotisation
3. [ ] ✅ Valider cotisation
4. [ ] ✅ Créer dépense
5. [ ] ✅ Valider dépense
6. [ ] ✅ Voir évolution trésorerie
7. [ ] ✅ Générer reçu

---

## 📚 Tests Documentation

### README

- [ ] ✅ Toutes les sections présentes
- [ ] ✅ Liens fonctionnent
- [ ] ✅ Badges affichés

### Swagger

- [ ] ✅ Documentation complète
- [ ] ✅ Exemples de requête/réponse
- [ ] ✅ Schémas visibles
- [ ] ✅ Try it out fonctionne

### Guides

- [ ] ✅ QUICK_START.md clair
- [ ] ✅ SWAGGER_GUIDE.md utile
- [ ] ✅ API_ENDPOINTS.md complet
- [ ] ✅ DOCUMENTATION_INDEX.md navigable

---

## ✅ Résumé des Tests

### Configuration & Installation
- Total : 12 points
- Critiques : [ ] / 12

### Swagger UI
- Total : 15 points
- Critiques : [ ] / 15

### Modules API
- Total : 60+ points
- Critiques : [ ] / 60

### Sécurité
- Total : 20 points
- Critiques : [ ] / 20

### Performance
- Total : 9 points
- Critiques : [ ] / 9

### Erreurs & Edge Cases
- Total : 12 points
- Critiques : [ ] / 12

### Workflows Complets
- Total : 18 points
- Critiques : [ ] / 18

**TOTAL : 150+ points de tests**

---

## 🎯 Critères de Validation

### ✅ Prêt pour Production

- [ ] Tous les tests critiques passent (100%)
- [ ] Documentation complète
- [ ] Sécurité validée
- [ ] Performance acceptable
- [ ] Pas d'erreurs bloquantes

### ⚠️ Prêt pour Staging

- [ ] 90%+ des tests passent
- [ ] Tests critiques OK
- [ ] Bugs mineurs acceptables

### ❌ Non Prêt

- [ ] < 90% des tests passent
- [ ] Tests critiques échouent
- [ ] Problèmes de sécurité

---

## 📞 Support

En cas de problème :
1. Consulter [QUICK_START.md](./QUICK_START.md)
2. Vérifier les logs console
3. Tester avec Swagger UI
4. Consulter [SWAGGER_GUIDE.md](./SWAGGER_GUIDE.md)

---

**Date de test :** __________  
**Testeur :** __________  
**Version :** 2.0.0  
**Résultat :** ☐ Réussi  ☐ Échec partiel  ☐ Échec

**Notes :**
_______________________
_______________________
_______________________
