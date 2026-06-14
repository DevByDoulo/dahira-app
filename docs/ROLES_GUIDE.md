# 🎯 Guide d'Utilisation du Système de Rôles

## 📚 Table des Matières

1. [Introduction](#introduction)
2. [Constantes de Rôles](#constantes-de-rôles)
3. [Utilisation dans les Routes](#utilisation-dans-les-routes)
4. [Fonctions Utilitaires](#fonctions-utilitaires)
5. [Système de Permissions](#système-de-permissions)
6. [Exemples Pratiques](#exemples-pratiques)
7. [Bonnes Pratiques](#bonnes-pratiques)

---

## 📖 Introduction

Le système de rôles de Dahira App utilise des **constantes centralisées** pour garantir :
- ✅ Cohérence dans tout le code
- ✅ Autocomplétion dans l'IDE
- ✅ Réduction des erreurs de frappe
- ✅ Maintenance facilitée

---

## 🔑 Constantes de Rôles

### Import des Constantes

```javascript
const { ROLES, ROLE_LABELS, isAtLeast, hasPermission } = require('../constants/roles');
```

### Valeurs des Rôles

```javascript
ROLES.BUREAU      // 'bureau'
ROLES.TRESORIER   // 'tresorier'
ROLES.MEMBRE      // 'membre'
```

### Informations des Rôles

```javascript
ROLE_LABELS[ROLES.BUREAU]
// {
//   fr: 'Bureau',
//   en: 'Board',
//   icon: '🏛️',
//   level: 3,
//   description: 'Membres du bureau exécutif - Accès complet'
// }
```

---

## 🛣️ Utilisation dans les Routes

### 1. Méthode Basique : `allowRoles()`

**Importer les constantes :**
```javascript
const express = require('express');
const router = express.Router();
const { ROLES } = require('../../constants/roles');
const allowRoles = require('../../middlewares/role.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
```

**Protéger une route (un seul rôle) :**
```javascript
// ✅ RECOMMANDÉ - Avec constantes
router.patch('/:id/valider', 
  authMiddleware,
  allowRoles(ROLES.BUREAU),  // Seul le Bureau
  validerDepenseController
);

// ❌ ANCIEN - Sans constantes (risque de typo)
router.patch('/:id/valider', 
  authMiddleware,
  allowRoles('bureau'),  // Risque d'erreur de frappe
  validerDepenseController
);
```

**Protéger une route (plusieurs rôles) :**
```javascript
// Bureau ET Trésorier
router.post('/', 
  authMiddleware,
  allowRoles(ROLES.BUREAU, ROLES.TRESORIER),
  createDepenseController
);
```

**Route accessible à tous (authentifiés) :**
```javascript
// Pas de allowRoles = tous les rôles authentifiés
router.get('/', 
  authMiddleware,
  getAllMembresController
);
```

---

### 2. Méthode par Permission : `requirePermission()`

**Pour un contrôle plus granulaire :**

```javascript
const { requirePermission } = require('../../middlewares/role.middleware');

router.patch('/:id/valider', 
  authMiddleware,
  requirePermission('depenses.validate'),
  validerDepenseController
);
```

**Avantages :**
- Sémantique claire : "valider une dépense"
- Permissions centralisées dans `constants/roles.js`
- Changements de permissions sans toucher aux routes

---

### 3. Méthode Hiérarchique : `requireAtLeast()`

**Pour un accès basé sur le niveau :**

```javascript
const { requireAtLeast } = require('../../middlewares/role.middleware');

// Accessible par Trésorier ET Bureau (pas Membre)
router.get('/stats', 
  authMiddleware,
  requireAtLeast(ROLES.TRESORIER),
  getStatsController
);
```

**Hiérarchie :**
```
MEMBRE (niveau 1) < TRESORIER (niveau 2) < BUREAU (niveau 3)
```

---

## 🛠️ Fonctions Utilitaires

### 1. `isAtLeast(userRole, requiredRole)`

**Vérifier si un rôle est au moins au niveau d'un autre :**

```javascript
const { isAtLeast, ROLES } = require('../constants/roles');

if (isAtLeast(req.user.role, ROLES.TRESORIER)) {
  // Bureau et Trésorier peuvent accéder
  console.log('Accès autorisé aux finances');
}
```

**Exemples :**
```javascript
isAtLeast(ROLES.BUREAU, ROLES.TRESORIER)      // true
isAtLeast(ROLES.TRESORIER, ROLES.MEMBRE)      // true
isAtLeast(ROLES.MEMBRE, ROLES.TRESORIER)      // false
```

---

### 2. `hasPermission(userRole, permission)`

**Vérifier une permission spécifique :**

```javascript
const { hasPermission, ROLES } = require('../constants/roles');

if (hasPermission(req.user.role, 'depenses.validate')) {
  // Seul le Bureau peut valider
  await validerDepense(depenseId);
}
```

**Permissions disponibles :**
- `depenses.validate` - Valider une dépense
- `depenses.create` - Créer une dépense
- `users.change_role` - Changer le rôle d'un user
- `notifications.send_all` - Notifier tous les membres
- Voir `src/constants/roles.js` pour la liste complète

---

### 3. `isValidRole(role)`

**Valider un rôle avant enregistrement :**

```javascript
const { isValidRole, ROLES } = require('../constants/roles');

const createUser = async (req, res) => {
  const { role } = req.body;
  
  if (!isValidRole(role)) {
    return error(res, 'Rôle invalide', 400);
  }
  
  // Créer l'utilisateur...
};
```

---

### 4. `getRoleInfo(role)`

**Obtenir les infos d'un rôle :**

```javascript
const { getRoleInfo, ROLES } = require('../constants/roles');

const info = getRoleInfo(ROLES.BUREAU);
console.log(info.fr);          // 'Bureau'
console.log(info.icon);        // '🏛️'
console.log(info.level);       // 3
console.log(info.description); // 'Membres du bureau...'
```

---

### 5. `getRolePermissions(role)`

**Lister toutes les permissions d'un rôle :**

```javascript
const { getRolePermissions, ROLES } = require('../constants/roles');

const permissions = getRolePermissions(ROLES.TRESORIER);
console.log(permissions);
// [
//   'dahiras.view',
//   'membres.view',
//   'membres.create',
//   'cotisations.create',
//   'depenses.create',
//   ...
// ]
```

---

## 🔐 Système de Permissions

### Structure des Permissions

**Format :** `ressource.action`

**Exemples :**
```javascript
'membres.view'       // Voir les membres
'membres.create'     // Créer un membre
'membres.delete'     // Supprimer un membre
'depenses.validate'  // Valider une dépense
'users.change_role'  // Changer le rôle d'un user
```

### Permissions par Module

#### Finances
```javascript
'cotisations.view_all'    // [BUREAU, TRESORIER]
'cotisations.create'      // [BUREAU, TRESORIER]
'depenses.validate'       // [BUREAU] uniquement
'tresorerie.view'         // [BUREAU, TRESORIER]
```

#### Administration
```javascript
'users.create'            // [BUREAU] uniquement
'users.change_role'       // [BUREAU] uniquement
'membres.delete'          // [BUREAU] uniquement
```

#### Communication
```javascript
'notifications.send_all'  // [BUREAU] uniquement
'annonces.create'         // [BUREAU] uniquement
```

---

## 💡 Exemples Pratiques

### Exemple 1 : Route Dépenses Complète

```javascript
const express = require('express');
const router = express.Router();
const { ROLES } = require('../../constants/roles');
const allowRoles = require('../../middlewares/role.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const {
  createDepenseController,
  getDepensesController,
  validerDepenseController,
  rejeterDepenseController
} = require('./depenses.controller');

// Toutes les routes nécessitent authentification
router.use(authMiddleware);

// Bureau ET Trésorier peuvent créer
router.post('/', 
  allowRoles(ROLES.BUREAU, ROLES.TRESORIER),
  createDepenseController
);

// Bureau ET Trésorier peuvent voir
router.get('/', 
  allowRoles(ROLES.BUREAU, ROLES.TRESORIER),
  getDepensesController
);

// Seul le Bureau peut valider
router.patch('/:id/valider', 
  allowRoles(ROLES.BUREAU),
  validerDepenseController
);

// Seul le Bureau peut rejeter
router.patch('/:id/rejeter', 
  allowRoles(ROLES.BUREAU),
  rejeterDepenseController
);

module.exports = router;
```

---

### Exemple 2 : Logique Conditionnelle dans un Controller

```javascript
const { ROLES, isAtLeast, hasPermission } = require('../../constants/roles');

const getDepensesController = async (req, res) => {
  const { role } = req.user;
  
  // Trésorier ne voit que les dépenses validées
  // Bureau voit tout
  let whereClause = { dahira_id: req.dahira_id };
  
  if (role === ROLES.TRESORIER) {
    whereClause.statut = 'validee';
  }
  
  const depenses = await db.query(
    'SELECT * FROM depenses WHERE ?',
    whereClause
  );
  
  return success(res, 'Dépenses récupérées', depenses);
};
```

---

### Exemple 3 : Validation dans un Service

```javascript
const { hasPermission, ROLES } = require('../../constants/roles');

const validerDepense = async (depenseId, userId, userRole) => {
  // Vérifier la permission
  if (!hasPermission(userRole, 'depenses.validate')) {
    throw new Error('Permission refusée : seul le Bureau peut valider');
  }
  
  // Mettre à jour la dépense
  await db.query(
    'UPDATE depenses SET statut = ?, validated_by = ? WHERE id = ?',
    ['validee', userId, depenseId]
  );
  
  return { success: true };
};
```

---

### Exemple 4 : Affichage Conditionnel dans une API

```javascript
const { getRoleInfo, ROLES } = require('../../constants/roles');

const getUserProfileController = async (req, res) => {
  const user = await getUserById(req.params.id);
  
  // Enrichir avec les infos du rôle
  const roleInfo = getRoleInfo(user.role);
  
  return success(res, 'Profil utilisateur', {
    ...user,
    role_display: roleInfo.fr,
    role_icon: roleInfo.icon,
    role_level: roleInfo.level
  });
};
```

---

## ✅ Bonnes Pratiques

### 1. ✅ Toujours Utiliser les Constantes

```javascript
// ✅ BON
if (user.role === ROLES.BUREAU) { ... }

// ❌ MAUVAIS - Risque de typo
if (user.role === 'bureau') { ... }
```

---

### 2. ✅ Importer au Début du Fichier

```javascript
// ✅ BON - Import en haut
const { ROLES } = require('../../constants/roles');

// Plus tard dans le code
router.post('/', allowRoles(ROLES.BUREAU), controller);

// ❌ MAUVAIS - Magic strings
router.post('/', allowRoles('bureau'), controller);
```

---

### 3. ✅ Utiliser les Fonctions Utilitaires

```javascript
// ✅ BON - Utiliser isAtLeast pour hiérarchie
if (isAtLeast(user.role, ROLES.TRESORIER)) {
  // Accessible par Trésorier ET Bureau
}

// ❌ MAUVAIS - Logique manuelle
if (user.role === 'tresorier' || user.role === 'bureau') {
  // Code dupliqué et moins maintenable
}
```

---

### 4. ✅ Valider les Rôles dans les Inputs

```javascript
// ✅ BON
const createInvitation = async (req, res) => {
  const { role } = req.body;
  
  if (!isValidRole(role)) {
    return error(res, 'Rôle invalide', 400);
  }
  
  // Créer l'invitation...
};
```

---

### 5. ✅ Documenter les Routes avec les Permissions

```javascript
/**
 * @swagger
 * /api/depenses/{id}/valider:
 *   patch:
 *     summary: Valider une dépense
 *     tags: [Dépenses]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       **Permission requise:** Bureau uniquement
 *       
 *       Le Trésorier crée les dépenses mais seul le Bureau peut les valider.
 *       Ceci assure la séparation des pouvoirs.
 */
router.patch('/:id/valider', 
  allowRoles(ROLES.BUREAU),
  validerDepenseController
);
```

---

## 🔄 Migration du Code Existant

### Avant (Sans Constantes)

```javascript
router.patch('/:id/valider', 
  allowRoles('bureau'),  // Magic string
  validerDepenseController
);

if (user.role === 'bureau') {  // Magic string
  // ...
}
```

### Après (Avec Constantes)

```javascript
const { ROLES } = require('../../constants/roles');

router.patch('/:id/valider', 
  allowRoles(ROLES.BUREAU),  // Constante
  validerDepenseController
);

if (user.role === ROLES.BUREAU) {  // Constante
  // ...
}
```

**Avantages :**
- ✅ Autocomplétion IDE
- ✅ Détection d'erreurs à la compilation
- ✅ Refactoring facile
- ✅ Code plus lisible

---

## 📊 Checklist de Migration

Pour mettre à jour votre code existant :

- [ ] Remplacer `'bureau'` par `ROLES.BUREAU`
- [ ] Remplacer `'tresorier'` par `ROLES.TRESORIER`
- [ ] Remplacer `'membre'` par `ROLES.MEMBRE`
- [ ] Ajouter les imports `const { ROLES } = require('...')`
- [ ] Utiliser `isValidRole()` pour valider les inputs
- [ ] Utiliser `isAtLeast()` pour la logique hiérarchique
- [ ] Documenter les permissions dans Swagger

---

## 🎯 Résumé des Imports

```javascript
// Import complet
const {
  ROLES,              // Constantes des rôles
  ROLE_LABELS,        // Métadonnées des rôles
  PERMISSIONS,        // Définition des permissions
  isAtLeast,          // Vérifier hiérarchie
  hasPermission,      // Vérifier permission
  isValidRole,        // Valider un rôle
  getRoleInfo,        // Info d'un rôle
  getRolePermissions  // Permissions d'un rôle
} = require('../constants/roles');

// Middlewares
const allowRoles = require('../middlewares/role.middleware');
const { requirePermission, requireAtLeast } = require('../middlewares/role.middleware');
```

---

## 📞 Questions Fréquentes

**Q: Dois-je migrer tout mon code existant ?**  
R: Non, le code avec `'bureau'` fonctionne toujours. Utilisez les constantes pour le nouveau code.

**Q: Quelle méthode choisir : allowRoles, requirePermission ou requireAtLeast ?**  
R: 
- `allowRoles()` : Simple et direct (recommandé pour la plupart des cas)
- `requirePermission()` : Pour un contrôle granulaire
- `requireAtLeast()` : Pour une logique hiérarchique

**Q: Comment ajouter une nouvelle permission ?**  
R: Ajoutez-la dans `PERMISSIONS` dans `src/constants/roles.js`

**Q: Puis-je avoir plusieurs rôles par utilisateur ?**  
R: Non, un utilisateur = un rôle. Pour des permissions complexes, utilisez `requirePermission()`.

---

**Dernière mise à jour :** Juin 2026  
**Version :** 2.0.0

