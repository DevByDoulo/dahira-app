# 🔐 Rôles et Permissions - Dahira App

## 📋 Vue d'ensemble

Le backend Dahira App utilise un système de **contrôle d'accès basé sur les rôles (RBAC - Role-Based Access Control)** avec 3 rôles principaux.

---

## 👥 Les 3 Rôles

### 1. 🏛️ Bureau (Administrateur)

**Rôle :** Membres du bureau exécutif du dahira  
**Niveau d'accès :** ⭐⭐⭐⭐⭐ (Accès complet)

**Permissions :**
- ✅ **Toutes les fonctionnalités** de Trésorier et Membre
- ✅ **Gestion des membres** (création, modification, suppression)
- ✅ **Gestion des utilisateurs** (création, rôles, activation/désactivation)
- ✅ **Validation des dépenses** (approuver/rejeter)
- ✅ **Gestion des invitations** (envoyer, annuler)
- ✅ **Configuration du dahira** (modifier infos, logo, etc.)
- ✅ **Notifications groupées** (envoyer à tous les membres)
- ✅ **Gestion des annonces** (créer, modifier, supprimer)
- ✅ **Suppression de données** (membres, séances, etc.)
- ✅ **Accès aux statistiques complètes**

**Cas d'usage :**
- Président du dahira
- Secrétaire général
- Responsable administratif

---

### 2. 💰 Trésorier

**Rôle :** Responsable financier du dahira  
**Niveau d'accès :** ⭐⭐⭐⭐ (Accès financier complet)

**Permissions :**
- ✅ **Toutes les fonctionnalités** de Membre
- ✅ **Gestion des cotisations** (créer, modifier, valider, rejeter)
- ✅ **Gestion des dépenses** (créer, modifier - mais pas valider)
- ✅ **Accès trésorerie** (solde, transactions, évolution, prévisions, alertes)
- ✅ **Génération de reçus** (PDF, envoi par email)
- ✅ **Statistiques financières** (rapports, graphiques)
- ✅ **Gestion des séances** (créer, modifier)
- ✅ **Gestion des présences** (enregistrer, consulter)
- ✅ **Alertes cotisations** (envoyer rappels aux membres en retard)
- ✅ **Création de membres** (pour enregistrer nouveaux cotisants)

**Limitations :**
- ❌ Ne peut PAS valider les dépenses (seul le Bureau peut)
- ❌ Ne peut PAS gérer les rôles des utilisateurs
- ❌ Ne peut PAS supprimer des membres
- ❌ Ne peut PAS modifier la configuration du dahira

**Cas d'usage :**
- Trésorier du dahira
- Comptable
- Assistant financier

---

### 3. 👤 Membre

**Rôle :** Membre ordinaire du dahira  
**Niveau d'accès :** ⭐⭐ (Consultation uniquement)

**Permissions :**
- ✅ **Consultation** des informations du dahira
- ✅ **Voir** la liste des membres (nom, contacts)
- ✅ **Voir** les annonces du dahira
- ✅ **Voir** les événements
- ✅ **S'inscrire** aux événements
- ✅ **Voir** ses propres cotisations
- ✅ **Voir** ses propres reçus
- ✅ **Voir** ses statistiques de présence
- ✅ **Voir** les séances programmées
- ✅ **Recevoir** des notifications
- ✅ **Voir** son profil

**Limitations :**
- ❌ Ne peut PAS créer/modifier de données
- ❌ Ne peut PAS voir les détails financiers (trésorerie, dépenses)
- ❌ Ne peut PAS voir les cotisations des autres membres
- ❌ Ne peut PAS gérer les présences
- ❌ Ne peut PAS valider les cotisations
- ❌ Ne peut PAS créer d'annonces
- ❌ Ne peut PAS créer de séances

**Cas d'usage :**
- Membres ordinaires du dahira
- Sympathisants
- Nouveaux inscrits

---

## 📊 Tableau Comparatif des Permissions

| Fonctionnalité | Bureau | Trésorier | Membre |
|----------------|--------|-----------|--------|
| **Dahiras** | | | |
| Voir dahiras | ✅ | ✅ | ✅ |
| Modifier dahira | ✅ | ❌ | ❌ |
| **Membres** | | | |
| Voir membres | ✅ | ✅ | ✅ |
| Créer membre | ✅ | ✅ | ❌ |
| Modifier membre | ✅ | ✅ | ❌ |
| Supprimer membre | ✅ | ❌ | ❌ |
| Upload photo membre | ✅ | ✅ | ❌ |
| **Utilisateurs** | | | |
| Voir users | ✅ | ✅ | ❌ |
| Créer user | ✅ | ❌ | ❌ |
| Modifier user | ✅ | ❌ | ❌ |
| Changer rôle | ✅ | ❌ | ❌ |
| **Cotisations** | | | |
| Voir cotisations | ✅ | ✅ | ✅ (ses propres) |
| Créer cotisation | ✅ | ✅ | ✅ |
| Valider cotisation | ✅ | ✅ | ❌ |
| Rejeter cotisation | ✅ | ✅ | ❌ |
| Statistiques | ✅ | ✅ | ❌ |
| **Dépenses** | | | |
| Voir dépenses | ✅ | ✅ | ❌ |
| Créer dépense | ✅ | ✅ | ❌ |
| Modifier dépense | ✅ | ✅ | ❌ |
| Valider dépense | ✅ | ❌ | ❌ |
| Rejeter dépense | ✅ | ❌ | ❌ |
| Supprimer dépense | ✅ | ❌ | ❌ |
| Statistiques | ✅ | ✅ | ❌ |
| **Trésorerie** | | | |
| Voir solde | ✅ | ✅ | ❌ |
| Voir transactions | ✅ | ✅ | ❌ |
| Voir évolution | ✅ | ✅ | ❌ |
| Voir prévisions | ✅ | ✅ | ❌ |
| Voir alertes | ✅ | ✅ | ❌ |
| **Séances** | | | |
| Voir séances | ✅ | ✅ | ✅ |
| Créer séance | ✅ | ✅ | ❌ |
| Modifier séance | ✅ | ✅ | ❌ |
| Supprimer séance | ✅ | ❌ | ❌ |
| **Présences** | | | |
| Voir présences | ✅ | ✅ | ✅ |
| Enregistrer présence | ✅ | ✅ | ❌ |
| Marquer absence | ✅ | ✅ | ❌ |
| Supprimer présence | ✅ | ✅ | ❌ |
| Feuille de présence | ✅ | ✅ | ❌ |
| Statistiques | ✅ | ✅ | ✅ |
| **Reçus** | | | |
| Générer reçu | ✅ | ✅ | ❌ |
| Envoyer reçu | ✅ | ✅ | ❌ |
| Voir ses reçus | ✅ | ✅ | ✅ |
| **Notifications** | | | |
| Voir ses notifications | ✅ | ✅ | ✅ |
| Notifier tous | ✅ | ❌ | ❌ |
| Rappels séances | ✅ | ❌ | ❌ |
| Alertes retards | ✅ | ✅ | ❌ |
| **Annonces** | | | |
| Voir annonces | ✅ | ✅ | ✅ |
| Créer annonce | ✅ | ❌ | ❌ |
| Modifier annonce | ✅ | ❌ | ❌ |
| Supprimer annonce | ✅ | ❌ | ❌ |
| **Événements** | | | |
| Voir événements | ✅ | ✅ | ✅ |
| Créer événement | ✅ | ✅ | ❌ |
| Modifier événement | ✅ | ✅ | ❌ |
| Supprimer événement | ✅ | ❌ | ❌ |
| S'inscrire | ✅ | ✅ | ✅ |
| **Dashboard** | | | |
| Voir statistiques | ✅ | ✅ | ✅ |
| Graphiques | ✅ | ✅ | ✅ |
| Activité récente | ✅ | ✅ | ✅ |
| **Invitations** | | | |
| Créer invitation | ✅ | ✅ | ❌ |
| Annuler invitation | ✅ | ✅ | ❌ |
| Renvoyer invitation | ✅ | ✅ | ❌ |

**Légende :**
- ✅ Autorisé
- ❌ Interdit

---

## 🔒 Implémentation Technique

### 1. Définition dans la Base de Données

```sql
-- Table users
CREATE TABLE users (
  ...
  role ENUM('bureau', 'tresorier', 'membre') DEFAULT 'membre',
  ...
);

-- Table invitations
CREATE TABLE invitations (
  ...
  role ENUM('bureau', 'tresorier', 'membre') DEFAULT 'membre',
  ...
);
```

### 2. Middleware de Rôles

**Fichier :** `src/middlewares/role.middleware.js`

```javascript
const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return error(res, 'Utilisateur non authentifié', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return error(res, 'Rôle insuffisant', 403);
    }

    next();
  };
};
```

### 3. Utilisation dans les Routes

```javascript
// Exemple 1 : Bureau uniquement
router.patch('/:id/valider', 
  roleMiddleware(['bureau']), 
  validerDepenseController
);

// Exemple 2 : Bureau et Trésorier
router.post('/', 
  roleMiddleware(['bureau', 'tresorier']), 
  createDepenseController
);

// Exemple 3 : Tous les rôles authentifiés
router.get('/', 
  authMiddleware,  // Pas de roleMiddleware
  getAllMembresController
);
```

### 4. Token JWT

Le rôle est inclus dans le token JWT :

```javascript
// Lors de la connexion
const token = jwt.sign(
  { 
    id: user.id, 
    dahira_id: user.dahira_id, 
    role: user.role  // ← Rôle inclus
  }, 
  process.env.JWT_SECRET
);

// Dans req.user après authMiddleware
{
  id: 1,
  dahira_id: 1,
  role: 'bureau'  // ← Disponible dans toutes les routes
}
```

---

## 🎯 Cas d'Usage par Rôle

### Scénario 1 : Gestion d'une Séance

**Bureau/Trésorier :**
1. ✅ Créer la séance
2. ✅ Enregistrer les présences
3. ✅ Générer la feuille de présence
4. ✅ Voir les statistiques

**Membre :**
1. ✅ Voir la séance programmée
2. ✅ Voir s'il est marqué présent
3. ❌ Ne peut pas enregistrer de présences

---

### Scénario 2 : Gestion d'une Dépense

**Bureau :**
1. ✅ Créer la dépense
2. ✅ Modifier la dépense
3. ✅ **Valider la dépense** ← Seul le Bureau peut
4. ✅ Voir dans trésorerie

**Trésorier :**
1. ✅ Créer la dépense
2. ✅ Modifier la dépense (si en_attente)
3. ❌ **Ne peut PAS valider** ← Séparation des pouvoirs
4. ✅ Voir dans trésorerie

**Membre :**
- ❌ Aucun accès aux dépenses

---

### Scénario 3 : Consultation Trésorerie

**Bureau/Trésorier :**
```
GET /api/tresorerie/solde
✅ 200 OK
{
  "solde_global": 500000,
  "entrees": { "total": 800000 },
  "sorties": { "total": 300000 }
}
```

**Membre :**
```
GET /api/tresorerie/solde
❌ 403 Forbidden
{
  "success": false,
  "message": "Rôle insuffisant"
}
```

---

## 🔄 Changement de Rôle

### Qui peut changer les rôles ?

**Seul le Bureau** peut modifier les rôles des utilisateurs.

### Comment changer un rôle ?

```javascript
PUT /api/users/:id
Authorization: Bearer <token_bureau>

{
  "role": "tresorier"  // ou "bureau" ou "membre"
}
```

### Validation

- ✅ Le rôle doit être valide : `bureau`, `tresorier`, ou `membre`
- ✅ L'utilisateur doit appartenir au même dahira
- ✅ Seul le Bureau peut effectuer cette action

---

## 🛡️ Bonnes Pratiques

### 1. Principe du Moindre Privilège

Attribuez toujours le rôle le **plus restrictif** nécessaire :
- Membre par défaut
- Trésorier uniquement pour gestion financière
- Bureau pour les responsables

### 2. Séparation des Pouvoirs

- ✅ Trésorier crée les dépenses
- ✅ Bureau valide les dépenses
- → Contrôle et transparence

### 3. Audit Trail

Toutes les actions sensibles sont tracées :
- Qui a créé/modifié/supprimé
- Date et heure
- Changements de rôle enregistrés

### 4. Multi-Tenancy

- Chaque rôle est isolé par `dahira_id`
- Un Bureau du Dahira A ne peut pas accéder au Dahira B

---

## 📝 Attribution des Rôles

### À la Création

**Via Invitation :**
```javascript
POST /api/invitations
{
  "membre_id": 1,
  "email": "tresorier@dahira.sn",
  "role": "tresorier"  // ← Rôle attribué
}
```

**Lors de l'Acceptation :**
Le rôle de l'invitation est automatiquement attribué au nouveau compte.

### Modification

**Par le Bureau uniquement :**
```javascript
PUT /api/users/:id
{
  "role": "bureau"
}
```

---

## 🚨 Erreurs Courantes

### Erreur 401 - Non Authentifié

```json
{
  "success": false,
  "message": "Token manquant ou invalide"
}
```

**Cause :** Token JWT manquant ou expiré  
**Solution :** Se reconnecter pour obtenir un nouveau token

### Erreur 403 - Accès Refusé

```json
{
  "success": false,
  "message": "Rôle insuffisant pour accéder à cette ressource"
}
```

**Cause :** Rôle insuffisant pour cette action  
**Solution :** Demander à un Bureau de vous attribuer le bon rôle

---

## 📊 Statistiques d'Utilisation

### Répartition Recommandée

| Rôle | Pourcentage | Exemple (Dahira 100 membres) |
|------|-------------|------------------------------|
| Bureau | 3-5% | 3-5 personnes |
| Trésorier | 1-3% | 1-3 personnes |
| Membre | 92-96% | 92-96 personnes |

---

## 🔮 Évolutions Futures

### Fonctionnalités Potentielles

1. **Rôles personnalisés** (roadmap)
   - Créer des rôles spécifiques par dahira
   - Permissions granulaires

2. **Permissions avancées** (roadmap)
   - `membres.read`, `membres.write`, `membres.delete`
   - `cotisations.validate`, `cotisations.export`
   
3. **Hiérarchie de rôles** (roadmap)
   - Bureau → Trésorier → Membre
   - Héritage de permissions

4. **Rôles temporaires** (futur)
   - Attribuer un rôle pour une période définie
   - Rotation automatique

---

## 📚 Références

- **Middleware :** `src/middlewares/role.middleware.js`
- **Migration :** `database/migrations/create_all_tables.sql`
- **Documentation API :** http://localhost:3000/api-docs
- **Guide Swagger :** [SWAGGER_GUIDE.md](./SWAGGER_GUIDE.md)

---

## ❓ FAQ

**Q: Peut-on avoir plusieurs rôles ?**  
R: Non, un utilisateur a un seul rôle à la fois.

**Q: Comment devient-on Bureau ?**  
R: Un Bureau existant doit vous attribuer ce rôle via `PUT /api/users/:id`.

**Q: Un Trésorier peut-il valider ses propres dépenses ?**  
R: Non, seul le Bureau peut valider les dépenses (séparation des pouvoirs).

**Q: Un Membre peut-il voir le solde de la trésorerie ?**  
R: Non, seuls Bureau et Trésorier ont accès aux détails financiers.

**Q: Les rôles sont-ils par dahira ?**  
R: Oui, chaque rôle est lié à un dahira spécifique (multi-tenant).

---

**Dernière mise à jour :** Juin 2026  
**Version :** 2.0.0
