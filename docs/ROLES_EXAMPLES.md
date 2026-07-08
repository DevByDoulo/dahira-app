> ⚠️ **Document historique (juillet 2026)** — décrit un système supprimé
> (`PERMISSIONS`, `requirePermission`, `requireAtLeast`, rôle `bureau`).
> Référence à jour : [ROLES_GUIDE.md](./ROLES_GUIDE.md).

# 📚 Exemples d'Utilisation du Système de Rôles

Ce document présente des exemples concrets d'utilisation du système de rôles amélioré.

---

## 🎯 Exemple 1 : Routes Basiques

### Avant (Sans Constantes)

```javascript
const express = require('express');
const router = express.Router();
const roleMiddleware = require('../../middlewares/role.middleware');

// ❌ Magic strings - Risque d'erreurs de frappe
router.post('/', roleMiddleware(['bureau', 'tresorier']), createController);
router.patch('/:id/valider', roleMiddleware(['bureau']), validerController);
router.get('/', roleMiddleware(['bureau', 'tresorier', 'membre']), listController);
```

### Après (Avec Constantes)

```javascript
const express = require('express');
const router = express.Router();
const { ROLES } = require('../../constants/roles');
const roleMiddleware = require('../../middlewares/role.middleware');

// ✅ Constantes - Autocomplétion + Sécurité
router.post('/', roleMiddleware(ROLES.BUREAU, ROLES.TRESORIER), createController);
router.patch('/:id/valider', roleMiddleware(ROLES.BUREAU), validerController);
router.get('/', roleMiddleware(ROLES.BUREAU, ROLES.TRESORIER, ROLES.MEMBRE), listController);
```

**Avantages :**
- ✅ Autocomplétion IDE
- ✅ Erreurs détectées à la compilation
- ✅ Refactoring facile (Ctrl+Clic sur ROLES.BUREAU)

---

## 🎯 Exemple 2 : Controller avec Logique Conditionnelle

### Avant

```javascript
const getCotisationsController = async (req, res) => {
  const { role } = req.user;
  
  // ❌ Magic strings partout
  if (role === 'bureau' || role === 'tresorier') {
    // Voir toutes les cotisations
    const cotisations = await getAllCotisations(req.dahira_id);
    return success(res, 'Cotisations', cotisations);
  } else if (role === 'membre') {
    // Voir seulement ses propres cotisations
    const cotisations = await getUserCotisations(req.user.id);
    return success(res, 'Cotisations', cotisations);
  }
  
  return error(res, 'Rôle invalide', 403);
};
```

### Après

```javascript
const { ROLES, isAtLeast } = require('../../constants/roles');

const getCotisationsController = async (req, res) => {
  const { role, id } = req.user;
  
  // ✅ Logique hiérarchique claire
  if (isAtLeast(role, ROLES.TRESORIER)) {
    // Trésorier et Bureau voient tout
    const cotisations = await getAllCotisations(req.dahira_id);
    return success(res, 'Cotisations', cotisations);
  }
  
  // Membre voit seulement les siennes
  const cotisations = await getUserCotisations(id);
  return success(res, 'Cotisations', cotisations);
};
```

**Avantages :**
- ✅ Plus concis
- ✅ Logique hiérarchique explicite
- ✅ Facile à maintenir

---

## 🎯 Exemple 3 : Service avec Vérification de Permissions

### Avant

```javascript
const validerDepense = async (depenseId, userId, userRole) => {
  // ❌ Validation manuelle
  if (userRole !== 'bureau') {
    throw new Error('Seul le Bureau peut valider les dépenses');
  }
  
  await db.query(
    'UPDATE depenses SET statut = ?, validated_by = ? WHERE id = ?',
    ['validee', userId, depenseId]
  );
  
  return { success: true };
};
```

### Après

```javascript
const { hasPermission } = require('../../constants/roles');

const validerDepense = async (depenseId, userId, userRole) => {
  // ✅ Vérification basée sur les permissions
  if (!hasPermission(userRole, 'depenses.validate')) {
    throw new Error('Permission refusée : validation de dépenses');
  }
  
  await db.query(
    'UPDATE depenses SET statut = ?, validated_by = ? WHERE id = ?',
    ['validee', userId, depenseId]
  );
  
  return { success: true };
};
```

**Avantages :**
- ✅ Permission centralisée
- ✅ Message d'erreur plus descriptif
- ✅ Facile d'ajouter de nouveaux rôles

---

## 🎯 Exemple 4 : Validation dans Controller

### Avant

```javascript
const createInvitationController = async (req, res) => {
  const { role } = req.body;
  
  // ❌ Liste hardcodée
  const validRoles = ['bureau', 'tresorier', 'membre'];
  if (!validRoles.includes(role)) {
    return error(res, 'Rôle invalide', 400);
  }
  
  // Créer l'invitation...
};
```

### Après

```javascript
const { isValidRole, getRoleInfo } = require('../../constants/roles');

const createInvitationController = async (req, res) => {
  const { role } = req.body;
  
  // ✅ Validation centralisée
  if (!isValidRole(role)) {
    return error(res, 'Rôle invalide', 400);
  }
  
  // ✅ Enrichir avec les infos du rôle
  const roleInfo = getRoleInfo(role);
  
  // Créer l'invitation avec métadonnées
  const invitation = await createInvitation({
    ...req.body,
    role_label: roleInfo.fr,
    role_icon: roleInfo.icon
  });
  
  return success(res, 'Invitation créée', invitation);
};
```

**Avantages :**
- ✅ Une seule source de vérité
- ✅ Métadonnées enrichies
- ✅ Pas de duplication de code

---

## 🎯 Exemple 5 : Affichage Utilisateur avec Métadonnées

### Avant

```javascript
const getUsersController = async (req, res) => {
  const users = await db.query(
    'SELECT * FROM users WHERE dahira_id = ?',
    [req.dahira_id]
  );
  
  // ❌ Transformation manuelle
  const usersWithLabels = users.map(user => ({
    ...user,
    role_display: user.role === 'bureau' ? 'Bureau' :
                  user.role === 'tresorier' ? 'Trésorier' : 'Membre'
  }));
  
  return success(res, 'Utilisateurs', usersWithLabels);
};
```

### Après

```javascript
const { getRoleInfo } = require('../../constants/roles');

const getUsersController = async (req, res) => {
  const users = await db.query(
    'SELECT * FROM users WHERE dahira_id = ?',
    [req.dahira_id]
  );
  
  // ✅ Transformation automatique
  const usersWithMetadata = users.map(user => {
    const roleInfo = getRoleInfo(user.role);
    return {
      ...user,
      role_label: roleInfo.fr,
      role_icon: roleInfo.icon,
      role_level: roleInfo.level,
      role_description: roleInfo.description
    };
  });
  
  return success(res, 'Utilisateurs', usersWithMetadata);
};
```

**Avantages :**
- ✅ Données enrichies automatiquement
- ✅ Frontend reçoit tout ce dont il a besoin
- ✅ Multilingue (fr/en disponibles)

---

## 🎯 Exemple 6 : Middleware Personnalisé

### Créer un Middleware Spécifique au Métier

```javascript
// src/middlewares/financial.middleware.js
const { hasPermission } = require('../constants/roles');
const { error } = require('../utils/response');

/**
 * Middleware pour les opérations financières
 * Vérifie que l'utilisateur peut gérer les finances
 */
const requireFinancialAccess = (req, res, next) => {
  if (!hasPermission(req.user.role, 'tresorerie.view')) {
    return error(res, 'Accès aux finances refusé', 403);
  }
  next();
};

/**
 * Middleware pour valider des opérations financières
 * Seul le Bureau peut valider
 */
const requireValidationPower = (req, res, next) => {
  if (!hasPermission(req.user.role, 'depenses.validate')) {
    return error(res, 'Seul le Bureau peut valider', 403);
  }
  next();
};

module.exports = {
  requireFinancialAccess,
  requireValidationPower
};
```

**Utilisation :**

```javascript
const { requireFinancialAccess, requireValidationPower } = require('../../middlewares/financial.middleware');

// Routes trésorerie
router.get('/solde', requireFinancialAccess, getSoldeController);
router.get('/transactions', requireFinancialAccess, getTransactionsController);

// Routes validation
router.patch('/depenses/:id/valider', requireValidationPower, validerController);
```

---

## 🎯 Exemple 7 : Statistiques de Rôles

### Dashboard Admin avec Répartition des Rôles

```javascript
const { ROLES, getRoleInfo, ROLE_HIERARCHY } = require('../../constants/roles');

const getDashboardStatsController = async (req, res) => {
  // Compter les users par rôle
  const usersByRole = await db.query(`
    SELECT role, COUNT(*) as count 
    FROM users 
    WHERE dahira_id = ? 
    GROUP BY role
  `, [req.dahira_id]);
  
  // ✅ Enrichir avec métadonnées
  const rolesStats = ROLE_HIERARCHY.map(role => {
    const roleInfo = getRoleInfo(role);
    const count = usersByRole.find(r => r.role === role)?.count || 0;
    
    return {
      role,
      label: roleInfo.fr,
      icon: roleInfo.icon,
      level: roleInfo.level,
      count,
      description: roleInfo.description
    };
  });
  
  return success(res, 'Statistiques rôles', {
    total_users: rolesStats.reduce((sum, r) => sum + r.count, 0),
    roles: rolesStats
  });
};
```

**Réponse API :**

```json
{
  "success": true,
  "message": "Statistiques rôles",
  "data": {
    "total_users": 45,
    "roles": [
      {
        "role": "membre",
        "label": "Membre",
        "icon": "👤",
        "level": 1,
        "count": 40,
        "description": "Membre ordinaire - Consultation uniquement"
      },
      {
        "role": "tresorier",
        "label": "Trésorier",
        "icon": "💰",
        "level": 2,
        "count": 2,
        "description": "Responsable financier - Gestion des finances"
      },
      {
        "role": "bureau",
        "label": "Bureau",
        "icon": "🏛️",
        "level": 3,
        "count": 3,
        "description": "Membres du bureau exécutif - Accès complet"
      }
    ]
  }
}
```

---

## 🎯 Exemple 8 : Audit et Logs

### Logger les Actions par Rôle

```javascript
const { getRoleInfo } = require('../../constants/roles');

const auditLogger = (action, userId, userRole, resourceType, resourceId) => {
  const roleInfo = getRoleInfo(userRole);
  
  console.log({
    timestamp: new Date().toISOString(),
    action,
    user_id: userId,
    user_role: userRole,
    role_label: roleInfo.fr,
    role_level: roleInfo.level,
    resource_type: resourceType,
    resource_id: resourceId
  });
  
  // Enregistrer dans une table d'audit
  db.query(`
    INSERT INTO audit_logs 
    (user_id, user_role, action, resource_type, resource_id)
    VALUES (?, ?, ?, ?, ?)
  `, [userId, userRole, action, resourceType, resourceId]);
};

// Utilisation
const validerDepenseController = async (req, res) => {
  const { id } = req.params;
  
  await validerDepense(id, req.user.id, req.user.role);
  
  // ✅ Audit enrichi
  auditLogger('VALIDATE_DEPENSE', req.user.id, req.user.role, 'depense', id);
  
  return success(res, 'Dépense validée');
};
```

---

## 🎯 Exemple 9 : Tests Unitaires

### Tester les Fonctions Utilitaires

```javascript
// tests/constants/roles.test.js
const { ROLES, isAtLeast, hasPermission, isValidRole } = require('../../src/constants/roles');

describe('Système de Rôles', () => {
  
  describe('isAtLeast()', () => {
    it('Bureau >= Trésorier', () => {
      expect(isAtLeast(ROLES.BUREAU, ROLES.TRESORIER)).toBe(true);
    });
    
    it('Trésorier >= Membre', () => {
      expect(isAtLeast(ROLES.TRESORIER, ROLES.MEMBRE)).toBe(true);
    });
    
    it('Membre < Trésorier', () => {
      expect(isAtLeast(ROLES.MEMBRE, ROLES.TRESORIER)).toBe(false);
    });
  });
  
  describe('hasPermission()', () => {
    it('Bureau peut valider dépenses', () => {
      expect(hasPermission(ROLES.BUREAU, 'depenses.validate')).toBe(true);
    });
    
    it('Trésorier ne peut pas valider dépenses', () => {
      expect(hasPermission(ROLES.TRESORIER, 'depenses.validate')).toBe(false);
    });
    
    it('Membre ne peut pas créer dépenses', () => {
      expect(hasPermission(ROLES.MEMBRE, 'depenses.create')).toBe(false);
    });
  });
  
  describe('isValidRole()', () => {
    it('bureau est valide', () => {
      expect(isValidRole(ROLES.BUREAU)).toBe(true);
    });
    
    it('invalid est invalide', () => {
      expect(isValidRole('invalid')).toBe(false);
    });
  });
});
```

---

## 🎯 Exemple 10 : Documentation API Enrichie

### Générer la Documentation des Permissions

```javascript
// scripts/generate-permissions-doc.js
const { PERMISSIONS, getRoleInfo } = require('../src/constants/roles');

const generatePermissionsDoc = () => {
  console.log('# Matrice des Permissions\n');
  console.log('| Permission | Bureau | Trésorier | Membre |');
  console.log('|------------|--------|-----------|--------|');
  
  Object.entries(PERMISSIONS).forEach(([permission, roles]) => {
    const bureau = roles.includes('bureau') ? '✅' : '❌';
    const tresorier = roles.includes('tresorier') ? '✅' : '❌';
    const membre = roles.includes('membre') ? '✅' : '❌';
    
    console.log(`| \`${permission}\` | ${bureau} | ${tresorier} | ${membre} |`);
  });
};

generatePermissionsDoc();
```

**Sortie :**

```markdown
# Matrice des Permissions

| Permission | Bureau | Trésorier | Membre |
|------------|--------|-----------|--------|
| `dahiras.view` | ✅ | ✅ | ✅ |
| `dahiras.create` | ✅ | ❌ | ❌ |
| `membres.create` | ✅ | ✅ | ❌ |
| `depenses.validate` | ✅ | ❌ | ❌ |
| `cotisations.view_all` | ✅ | ✅ | ❌ |
...
```

---

## 📝 Résumé des Avantages

| Aspect | Avant | Après |
|--------|-------|-------|
| **Erreurs de frappe** | ❌ Possibles | ✅ Impossible (constantes) |
| **Autocomplétion** | ❌ Non | ✅ Oui |
| **Refactoring** | ❌ Difficile | ✅ Facile |
| **Maintenance** | ❌ Dispersée | ✅ Centralisée |
| **Tests** | ❌ Complexes | ✅ Simples |
| **Documentation** | ❌ Manuelle | ✅ Automatisable |
| **Type Safety** | ❌ Non | ✅ Partielle |
| **Métadonnées** | ❌ Non | ✅ Oui (labels, icons) |

---

**Dernière mise à jour :** Juin 2026  
**Version :** 2.0.0

