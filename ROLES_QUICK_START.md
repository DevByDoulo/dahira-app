# 🚀 Système de Rôles - Guide Rapide

**Démarrage rapide pour utiliser le nouveau système de rôles**

---

## ⚡ En 30 Secondes

### 1. Import
```javascript
const { ROLES } = require('../../constants/roles');
```

### 2. Utilisation
```javascript
// Dans vos routes
router.post('/', allowRoles(ROLES.BUREAU, ROLES.TRESORIER), controller);

// Dans vos controllers
if (req.user.role === ROLES.BUREAU) { ... }
```

**C'est tout ! ✅**

---

## 🎯 Les 3 Rôles

```javascript
ROLES.BUREAU      // 'bureau' - Accès complet ⭐⭐⭐⭐⭐
ROLES.TRESORIER   // 'tresorier' - Gestion financière ⭐⭐⭐⭐
ROLES.MEMBRE      // 'membre' - Consultation ⭐⭐
```

---

## 📝 Exemples Courants

### Routes

```javascript
const { ROLES } = require('../../constants/roles');
const allowRoles = require('../../middlewares/role.middleware');

// Bureau uniquement
router.delete('/:id', allowRoles(ROLES.BUREAU), deleteController);

// Bureau ET Trésorier
router.post('/', allowRoles(ROLES.BUREAU, ROLES.TRESORIER), createController);

// Tous les rôles authentifiés
router.get('/', authMiddleware, listController);
```

### Controllers

```javascript
const { ROLES, isAtLeast } = require('../../constants/roles');

// Vérification simple
if (req.user.role === ROLES.BUREAU) {
  // Bureau seulement
}

// Vérification hiérarchique
if (isAtLeast(req.user.role, ROLES.TRESORIER)) {
  // Trésorier ET Bureau (niveau >= 2)
}
```

### Validation

```javascript
const { isValidRole } = require('../../constants/roles');

const createUser = (req, res) => {
  const { role } = req.body;
  
  if (!isValidRole(role)) {
    return error(res, 'Rôle invalide', 400);
  }
  
  // Créer l'utilisateur...
};
```

---

## 🔑 Fonctions Utiles

```javascript
const {
  ROLES,              // Les 3 constantes
  isAtLeast,          // Vérifier hiérarchie
  hasPermission,      // Vérifier permission
  isValidRole,        // Valider un rôle
  getRoleInfo         // Métadonnées complètes
} = require('../../constants/roles');
```

### isAtLeast(userRole, minRole)
```javascript
isAtLeast(ROLES.BUREAU, ROLES.TRESORIER)      // true
isAtLeast(ROLES.TRESORIER, ROLES.MEMBRE)      // true
isAtLeast(ROLES.MEMBRE, ROLES.TRESORIER)      // false
```

### hasPermission(userRole, permission)
```javascript
hasPermission(ROLES.BUREAU, 'depenses.validate')      // true
hasPermission(ROLES.TRESORIER, 'depenses.validate')   // false
hasPermission(ROLES.TRESORIER, 'depenses.create')     // true
```

### isValidRole(role)
```javascript
isValidRole(ROLES.BUREAU)      // true
isValidRole('invalid')         // false
```

### getRoleInfo(role)
```javascript
getRoleInfo(ROLES.BUREAU)
// {
//   fr: 'Bureau',
//   en: 'Board',
//   icon: '🏛️',
//   level: 3,
//   description: 'Membres du bureau exécutif - Accès complet'
// }
```

---

## 💡 Patterns Courants

### Pattern 1 : Route avec Plusieurs Rôles
```javascript
// Bureau ET Trésorier peuvent créer
router.post('/', 
  authMiddleware,
  tenantMiddleware,
  allowRoles(ROLES.BUREAU, ROLES.TRESORIER),
  createController
);
```

### Pattern 2 : Logique Conditionnelle
```javascript
const getFinances = async (req, res) => {
  // Trésorier et Bureau voient tout
  if (isAtLeast(req.user.role, ROLES.TRESORIER)) {
    const data = await getAllFinances(req.dahira_id);
    return success(res, 'Finances', data);
  }
  
  // Membre voit seulement ses cotisations
  const data = await getUserCotisations(req.user.id);
  return success(res, 'Mes cotisations', data);
};
```

### Pattern 3 : Validation Métier
```javascript
const validerDepense = async (req, res) => {
  // Vérifier la permission
  if (!hasPermission(req.user.role, 'depenses.validate')) {
    return error(res, 'Seul le Bureau peut valider', 403);
  }
  
  // Valider la dépense...
};
```

---

## 🎯 Séparation des Pouvoirs

### Dépenses
```javascript
// ✅ Trésorier crée
router.post('/', allowRoles(ROLES.BUREAU, ROLES.TRESORIER), createController);

// ✅ Seul Bureau valide (séparation)
router.patch('/:id/valider', allowRoles(ROLES.BUREAU), validerController);
```

### Users
```javascript
// ✅ Seul Bureau gère les comptes
router.post('/', allowRoles(ROLES.BUREAU), createUserController);
router.put('/:id', allowRoles(ROLES.BUREAU), updateUserController);
```

---

## ⚠️ À Éviter

### ❌ Magic Strings
```javascript
// ❌ MAUVAIS - Risque de typo
if (user.role === 'bureau') { ... }
router.post('/', allowRoles('bureau', 'tresorier'), controller);
```

### ✅ Constantes
```javascript
// ✅ BON - Type-safe
if (user.role === ROLES.BUREAU) { ... }
router.post('/', allowRoles(ROLES.BUREAU, ROLES.TRESORIER), controller);
```

---

## 📚 Documentation Complète

| Document | Contenu |
|----------|---------|
| **docs/ROLES_GUIDE.md** | Guide complet (50+ pages) |
| **docs/ROLES_EXAMPLES.md** | 10 exemples détaillés |
| **ROLES_SYSTEM_SUMMARY.md** | Résumé exécutif |
| **src/constants/roles.js** | Code source commenté |

---

## 🧪 Test Rapide

```bash
# Tester les constantes
node -e "const { ROLES } = require('./src/constants/roles'); console.log(ROLES)"

# Résultat attendu :
# { BUREAU: 'bureau', TRESORIER: 'tresorier', MEMBRE: 'membre' }
```

---

## 🎓 Hiérarchie

```
MEMBRE (niveau 1)     → Consultation
  ↓
TRESORIER (niveau 2)  → Finances
  ↓
BUREAU (niveau 3)     → Accès complet
```

**isAtLeast()** respecte cette hiérarchie :
- Bureau >= Trésorier ✅
- Bureau >= Membre ✅
- Trésorier >= Membre ✅
- Membre >= Trésorier ❌

---

## ✅ Checklist

Pour utiliser le nouveau système dans un nouveau module :

1. [ ] Importer `const { ROLES } = require('../../constants/roles')`
2. [ ] Remplacer `'bureau'` par `ROLES.BUREAU`
3. [ ] Remplacer `'tresorier'` par `ROLES.TRESORIER`
4. [ ] Remplacer `'membre'` par `ROLES.MEMBRE`
5. [ ] Utiliser `isAtLeast()` pour logique hiérarchique
6. [ ] Utiliser `isValidRole()` pour validation

---

## 🚀 Migration Complète

✅ **17 modules** déjà migrés  
✅ **70+ routes** mises à jour  
✅ **0 magic string** restant  
✅ **Production ready**

Consultez `docs/MIGRATION_ROLES_COMPLETE.md` pour les détails.

---

**🎉 Vous êtes prêt ! Le système de rôles est simple et puissant.**

**Questions ? Consultez `docs/ROLES_GUIDE.md`**

