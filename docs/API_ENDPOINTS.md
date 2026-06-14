# 📡 Liste Complète des Endpoints - Dahira App API

## Vue d'Ensemble

- **Version API :** 2.0.0
- **Base URL :** `http://localhost:3000/api`
- **Documentation Interactive :** `http://localhost:3000/api-docs`
- **Format :** JSON
- **Authentification :** JWT Bearer Token

**Total : 100+ endpoints disponibles**

---

## 🔐 Authentification (Public)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/auth/login` | Connexion | ❌ |
| POST | `/auth/register` | Inscription (avec invitation) | ❌ |

---

## 🔑 Password Reset (Public)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/password-reset/request` | Demander réinitialisation | ❌ |
| GET | `/password-reset/verify/:token` | Vérifier token | ❌ |
| POST | `/password-reset/reset` | Réinitialiser mot de passe | ❌ |

---

## ✉️ Invitations

| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| POST | `/invitations` | Créer invitation | ✅ | Bureau/Trésorier |
| GET | `/invitations` | Liste invitations | ✅ | Bureau/Trésorier |
| GET | `/invitations/verify/:token` | Vérifier invitation | ❌ | - |
| POST | `/invitations/accept` | Accepter invitation | ❌ | - |
| POST | `/invitations/:id/resend` | Renvoyer invitation | ✅ | Bureau/Trésorier |
| PATCH | `/invitations/:id/cancel` | Annuler invitation | ✅ | Bureau/Trésorier |

---

## 🏢 Dahiras

| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| POST | `/dahiras` | Créer dahira | ✅ | - |
| GET | `/dahiras` | Liste dahiras | ❌ | - |
| GET | `/dahiras/:id` | Détails dahira | ❌ | - |
| PUT | `/dahiras/:id` | Modifier dahira | ✅ | Bureau |
| PATCH | `/dahiras/:id/activer` | Activer dahira | ✅ | Bureau |
| PATCH | `/dahiras/:id/desactiver` | Désactiver dahira | ✅ | Bureau |
| DELETE | `/dahiras/:id` | Supprimer dahira | ✅ | Bureau |

---

## 👥 Membres

| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| POST | `/membres` | Créer membre | ✅ | Bureau/Trésorier |
| GET | `/membres` | Liste membres | ✅ | Tous |
| GET | `/membres/:id` | Détails membre | ✅ | Tous |
| PUT | `/membres/:id` | Modifier membre | ✅ | Bureau/Trésorier |
| DELETE | `/membres/:id` | Supprimer membre | ✅ | Bureau |
| POST | `/membres/:id/photo` | Upload photo | ✅ | Bureau/Trésorier |
| DELETE | `/membres/:id/photo` | Supprimer photo | ✅ | Bureau/Trésorier |
| PATCH | `/membres/:id/toggle-status` | Activer/Désactiver | ✅ | Bureau |

---

## 👤 Users

| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| POST | `/users` | Créer utilisateur | ✅ | Bureau |
| GET | `/users` | Liste utilisateurs | ✅ | Bureau/Trésorier |
| GET | `/users/:id` | Détails utilisateur | ✅ | Bureau/Trésorier |
| PUT | `/users/:id` | Modifier utilisateur | ✅ | Bureau |
| PATCH | `/users/:id/toggle-status` | Activer/Désactiver | ✅ | Bureau |
| DELETE | `/users/:id` | Supprimer utilisateur | ✅ | Bureau |

---

## 📊 Dashboard

| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| GET | `/dashboard/stats` | Statistiques globales | ✅ | Tous |
| GET | `/dashboard/charts` | Données graphiques | ✅ | Tous |
| GET | `/dashboard/activity` | Activité récente | ✅ | Tous |
| GET | `/dashboard/comparative` | Stats comparatives | ✅ | Tous |

**Données retournées :**
- Statistiques membres (total, actifs, nouveaux)
- Cotisations du mois (montants, taux)
- Solde trésorerie
- Prochaines séances
- Top contributeurs
- Évolution sur 6 mois

---

## 🏦 Trésorerie

| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| GET | `/tresorerie/solde` | Solde actuel | ✅ | Bureau/Trésorier |
| GET | `/tresorerie/transactions` | Historique transactions | ✅ | Bureau/Trésorier |
| GET | `/tresorerie/evolution` | Évolution par période | ✅ | Bureau/Trésorier |
| GET | `/tresorerie/previsions` | Prévisions futures | ✅ | Bureau/Trésorier |
| GET | `/tresorerie/alertes` | Alertes trésorerie | ✅ | Bureau/Trésorier |

**Query params :**
- `transactions` : type, mode_paiement, date_debut, date_fin, limit, offset
- `evolution` : periode (jour/semaine/mois)
- `previsions` : mois (nombre de mois à prévoir)

---

## 💰 Cotisations

| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| POST | `/cotisations` | Créer cotisation | ✅ | Tous |
| GET | `/cotisations` | Liste cotisations | ✅ | Tous |
| GET | `/cotisations/:id` | Détails cotisation | ✅ | Tous |
| PUT | `/cotisations/:id` | Modifier cotisation | ✅ | Bureau/Trésorier |
| DELETE | `/cotisations/:id` | Supprimer cotisation | ✅ | Bureau/Trésorier |
| PATCH | `/cotisations/:id/approve` | Approuver | ✅ | Bureau/Trésorier |
| PATCH | `/cotisations/:id/reject` | Rejeter | ✅ | Bureau/Trésorier |
| GET | `/cotisations/stats` | Statistiques | ✅ | Bureau/Trésorier |

**Query params :**
- statut : pending, approved, rejected
- membre_id : filtrer par membre
- mois_concerne : filtrer par mois (2026-06)
- limit, offset : pagination

---

## 💸 Dépenses

| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| POST | `/depenses` | Créer dépense | ✅ | Bureau/Trésorier |
| GET | `/depenses` | Liste dépenses | ✅ | Bureau/Trésorier |
| GET | `/depenses/stats` | Statistiques dépenses | ✅ | Bureau/Trésorier |
| GET | `/depenses/:id` | Détails dépense | ✅ | Bureau/Trésorier |
| PUT | `/depenses/:id` | Modifier dépense | ✅ | Bureau/Trésorier |
| PATCH | `/depenses/:id/valider` | Valider dépense | ✅ | Bureau |
| PATCH | `/depenses/:id/rejeter` | Rejeter dépense | ✅ | Bureau |
| DELETE | `/depenses/:id` | Supprimer dépense | ✅ | Bureau |

**Catégories :** evenements, location, nourriture, donations, maintenance, autres

**Statuts :** en_attente, validee, rejetee

---

## 📅 Séances

| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| POST | `/seances` | Créer séance | ✅ | Bureau/Trésorier |
| GET | `/seances` | Liste séances | ✅ | Tous |
| GET | `/seances/courante` | Séance courante | ✅ | Tous |
| GET | `/seances/:id` | Détails séance | ✅ | Tous |
| PUT | `/seances/:id` | Modifier séance | ✅ | Bureau/Trésorier |
| DELETE | `/seances/:id` | Supprimer séance | ✅ | Bureau |

**Types :** hebdomadaire, mensuelle, speciale, assemblee_generale

---

## ✅ Présences

| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| POST | `/presences` | Enregistrer présence | ✅ | Bureau/Trésorier |
| POST | `/presences/batch` | Présences en masse | ✅ | Bureau/Trésorier |
| GET | `/presences/seance/:id` | Présences d'une séance | ✅ | Tous |
| GET | `/presences/membre/:id/stats` | Stats membre | ✅ | Tous |
| GET | `/presences/stats` | Stats globales | ✅ | Tous |
| GET | `/presences/feuille/:id` | Feuille de présence | ✅ | Bureau/Trésorier |
| POST | `/presences/absence` | Marquer absence | ✅ | Bureau/Trésorier |
| DELETE | `/presences/:id` | Supprimer présence | ✅ | Bureau/Trésorier |

---

## 🧾 Reçus

| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| POST | `/recus/cotisation/:id/generer` | Générer reçu PDF | ✅ | Bureau/Trésorier |
| POST | `/recus/cotisation/:id/envoyer` | Envoyer par email | ✅ | Bureau/Trésorier |
| GET | `/recus/cotisation/:id` | Récupérer reçu | ✅ | Tous |
| GET | `/recus/membre/:id` | Reçus d'un membre | ✅ | Tous |

**Note :** Génération PDF nécessite `npm install pdfkit`

---

## 🔔 Notifications

| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| GET | `/notifications` | Mes notifications | ✅ | Tous |
| PATCH | `/notifications/:id/read` | Marquer comme lue | ✅ | Tous |
| PATCH | `/notifications/read-all` | Tout marquer lu | ✅ | Tous |
| DELETE | `/notifications/:id` | Supprimer notification | ✅ | Tous |
| POST | `/notifications/notify-all` | Notifier tous | ✅ | Bureau |
| POST | `/notifications/seance-reminders` | Rappels séances | ✅ | Bureau |
| POST | `/notifications/cotisation-retard` | Alertes retards | ✅ | Bureau/Trésorier |

---

## 📢 Annonces

| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| POST | `/annonces` | Créer annonce | ✅ | Bureau |
| GET | `/annonces` | Liste annonces | ✅ | Tous |
| GET | `/annonces/:id` | Détails annonce | ✅ | Tous |
| PUT | `/annonces/:id` | Modifier annonce | ✅ | Bureau |
| DELETE | `/annonces/:id` | Supprimer annonce | ✅ | Bureau |

**Types :** info, important, urgent

---

## 🎉 Événements

| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| POST | `/evenements` | Créer événement | ✅ | Bureau/Trésorier |
| GET | `/evenements` | Liste événements | ✅ | Tous |
| GET | `/evenements/:id` | Détails événement | ✅ | Tous |
| PUT | `/evenements/:id` | Modifier événement | ✅ | Bureau/Trésorier |
| DELETE | `/evenements/:id` | Supprimer événement | ✅ | Bureau |
| POST | `/evenements/:id/participer` | S'inscrire | ✅ | Tous |
| DELETE | `/evenements/:id/participer` | Se désinscrire | ✅ | Tous |

---

## 📸 Photos

| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| POST | `/photos` | Upload photo | ✅ | Bureau/Trésorier |
| GET | `/photos` | Liste photos | ✅ | Tous |
| GET | `/photos/:id` | Détails photo | ✅ | Tous |
| PUT | `/photos/:id` | Modifier photo | ✅ | Bureau/Trésorier |
| DELETE | `/photos/:id` | Supprimer photo | ✅ | Bureau/Trésorier |

---

## 📊 Résumé par Rôle

### 🔑 Bureau (Accès Complet)
- ✅ Toutes les fonctionnalités
- ✅ Validation des dépenses
- ✅ Gestion des membres et users
- ✅ Notifications groupées

### 💰 Trésorier
- ✅ Gestion financière complète
- ✅ Cotisations et dépenses
- ✅ Trésorerie et statistiques
- ✅ Présences et séances
- ❌ Pas de validation dépenses

### 👤 Membre
- ✅ Consultation des données
- ✅ Ses propres cotisations
- ✅ Ses notifications
- ❌ Pas de création/modification

---

## 🔐 Format d'Authentification

**Header requis :**
```
Authorization: Bearer <votre_token_jwt>
```

**Obtenir un token :**
```bash
POST /api/auth/login
{
  "telephone": "221771234567",
  "password": "votre_mot_de_passe"
}
```

---

## 📝 Format de Réponse Standard

### Succès
```json
{
  "success": true,
  "data": {
    // Données de la réponse
  }
}
```

### Erreur
```json
{
  "success": false,
  "message": "Message d'erreur"
}
```

---

## 🎯 Codes HTTP

- `200` - Succès
- `201` - Créé
- `400` - Erreur de validation
- `401` - Non authentifié
- `403` - Accès refusé
- `404` - Non trouvé
- `500` - Erreur serveur

---

## 📚 Ressources

- **Swagger UI :** http://localhost:3000/api-docs
- **Collection Postman :** postman_collection.json
- **Guide Swagger :** SWAGGER_GUIDE.md
- **README :** README.md

---

**Dernière mise à jour :** Juin 2026  
**Version API :** 2.0.0
