# 🤝 Guide de Contribution - Dahira App

Merci de votre intérêt pour contribuer à Dahira App ! Ce document vous guidera à travers le processus de contribution.

## 📋 Table des Matières

- [Code de Conduite](#code-de-conduite)
- [Comment Contribuer](#comment-contribuer)
- [Structure du Projet](#structure-du-projet)
- [Standards de Code](#standards-de-code)
- [Tests](#tests)
- [Commits](#commits)
- [Pull Requests](#pull-requests)

## 🤝 Code de Conduite

En participant à ce projet, vous acceptez de respecter notre code de conduite :
- Soyez respectueux envers tous les contributeurs
- Acceptez les critiques constructives
- Concentrez-vous sur ce qui est meilleur pour la communauté

## 🚀 Comment Contribuer

### 1. Fork & Clone

```bash
# Fork le repository sur GitHub
# Puis clonez votre fork
git clone https://github.com/votre-username/dahira-app.git
cd dahira-app
```

### 2. Créer une Branche

```bash
# Créez une branche pour votre feature
git checkout -b feature/nom-de-la-feature

# Ou pour un bugfix
git checkout -b fix/nom-du-bug
```

### 3. Installer les Dépendances

```bash
npm install
```

### 4. Configuration

```bash
# Copier .env.example vers .env
cp .env.example .env

# Configurer la base de données
mysql -u root -p dahira_app < database/migrations/create_all_tables.sql
```

### 5. Développer

Apportez vos modifications en respectant les [standards de code](#standards-de-code).

### 6. Tester

```bash
# Tester manuellement vos changements
npm run dev

# Tester l'API
# Ouvrir http://localhost:3000/api-docs
```

### 7. Commit & Push

```bash
git add .
git commit -m "feat: description de votre feature"
git push origin feature/nom-de-la-feature
```

### 8. Pull Request

Créez une Pull Request sur GitHub avec :
- Titre clair
- Description détaillée
- Screenshots si applicable

## 🏗️ Structure du Projet

```
src/
├── modules/
│   └── nom_module/
│       ├── nom_module.service.js    # Logique métier
│       ├── nom_module.controller.js # Contrôleurs
│       └── nom_module.routes.js     # Routes API
├── middlewares/                     # Middlewares Express
├── utils/                           # Fonctions utilitaires
└── config/                          # Configuration
```

## 📝 Standards de Code

### Architecture MVC

Chaque module suit la structure MVC :

```javascript
// 1. SERVICE - Logique métier
// nom_module.service.js
const createItem = async (data) => {
  // Logique de création
  const [result] = await pool.query('INSERT INTO ...');
  return result;
};

// 2. CONTROLLER - Validation et réponses
// nom_module.controller.js
const createItemController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg, 400);
    }
    const item = await createItem(req.body);
    return success(res, item, 201);
  } catch (err) {
    next(err);
  }
};

// 3. ROUTES - Définition des endpoints
// nom_module.routes.js
router.post('/', authMiddleware, validation, createItemController);
```

### Conventions de Nommage

**Fichiers :**
- Services : `nom_module.service.js`
- Contrôleurs : `nom_module.controller.js`
- Routes : `nom_module.routes.js`

**Fonctions :**
```javascript
// Services (métier)
const getItemById = async (id) => { ... }
const createItem = async (data) => { ... }
const updateItem = async (id, data) => { ... }

// Controllers (API)
const getItemByIdController = async (req, res, next) => { ... }
const createItemController = async (req, res, next) => { ... }
```

**Variables :**
```javascript
// camelCase pour les variables
const userId = 1;
const dahiraId = req.user.dahira_id;

// UPPER_CASE pour les constantes
const MAX_FILE_SIZE = 5000000;
```

### SQL et Base de Données

**Requêtes préparées (toujours) :**
```javascript
// ✅ BON
const [users] = await pool.query(
  'SELECT * FROM users WHERE id = ?',
  [userId]
);

// ❌ MAUVAIS (injection SQL)
const [users] = await pool.query(
  `SELECT * FROM users WHERE id = ${userId}`
);
```

**Transactions :**
```javascript
const connection = await pool.getConnection();
try {
  await connection.beginTransaction();
  
  // Vos requêtes ici
  
  await connection.commit();
} catch (err) {
  await connection.rollback();
  throw err;
} finally {
  connection.release();
}
```

### Gestion des Erreurs

**Dans les services :**
```javascript
const getItemById = async (id, dahiraId) => {
  const [items] = await pool.query(
    'SELECT * FROM items WHERE id = ? AND dahira_id = ?',
    [id, dahiraId]
  );
  
  if (items.length === 0) {
    throw new Error('Item non trouvé');
  }
  
  return items[0];
};
```

**Dans les contrôleurs :**
```javascript
const getItemController = async (req, res, next) => {
  try {
    const item = await getItemById(req.params.id, req.user.dahira_id);
    return success(res, item, 200);
  } catch (err) {
    next(err); // Laisse le middleware d'erreur gérer
  }
};
```

### Validation

**Utiliser express-validator :**
```javascript
const { body, validationResult } = require('express-validator');

const createValidation = [
  body('nom').notEmpty().withMessage('Nom requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('montant').isFloat({ min: 0 }).withMessage('Montant invalide')
];

router.post('/', createValidation, createController);
```

### Documentation Swagger

**Documenter chaque endpoint :**
```javascript
/**
 * @swagger
 * /api/items:
 *   post:
 *     summary: Créer un item
 *     description: Description détaillée
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *             properties:
 *               nom:
 *                 type: string
 *     responses:
 *       201:
 *         description: Item créé
 */
router.post('/', createItemController);
```

## 🧪 Tests

### Tests Manuels

Utilisez Postman ou Swagger UI pour tester vos endpoints.

**Collection Postman fournie :** `postman_collection.json`

### Tests Automatisés (à venir)

```bash
# Lancer les tests
npm test

# Tests avec couverture
npm run test:coverage
```

## 📝 Commits

### Format des Messages

Utilisez le format [Conventional Commits](https://www.conventionalcommits.org/) :

```
type(scope): description courte

Description détaillée (optionnel)

BREAKING CHANGE: description (si applicable)
```

**Types :**
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage, point-virgules manquants
- `refactor`: Refactorisation du code
- `test`: Ajout de tests
- `chore`: Mise à jour des dépendances, configuration

**Exemples :**
```bash
feat(presences): ajouter endpoint pour export Excel
fix(auth): corriger la validation du token JWT
docs(readme): mettre à jour les instructions d'installation
refactor(tresorerie): optimiser la requête de calcul du solde
```

## 🔄 Pull Requests

### Checklist

Avant de soumettre une PR, vérifiez :

- [ ] Le code suit les standards du projet
- [ ] Les endpoints sont documentés avec Swagger
- [ ] Les erreurs sont gérées correctement
- [ ] Le multi-tenancy est respecté (dahira_id)
- [ ] Les permissions par rôle sont appliquées
- [ ] Pas de console.log() oubliés
- [ ] Les fichiers sensibles ne sont pas commités (.env)
- [ ] La PR a un titre et une description clairs

### Template de PR

```markdown
## Description
Brève description de vos changements

## Type de changement
- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Breaking change
- [ ] Documentation

## Changements
- Point 1
- Point 2

## Screenshots (si applicable)
[Ajouter des screenshots]

## Testé sur
- [ ] Développement local
- [ ] Swagger UI
- [ ] Postman

## Checklist
- [ ] Code respecte les standards
- [ ] Documentation à jour
- [ ] Tests ajoutés/mis à jour
```

## 🐛 Signaler un Bug

Utilisez les [GitHub Issues](https://github.com/username/dahira-app/issues) avec :

**Template :**
```markdown
## Description
Description claire du bug

## Comment Reproduire
1. Aller sur...
2. Cliquer sur...
3. Voir l'erreur

## Comportement Attendu
Ce qui devrait se passer

## Comportement Actuel
Ce qui se passe réellement

## Screenshots
Si applicable

## Environnement
- OS: [ex: Windows 11]
- Node: [ex: v18.0.0]
- Version: [ex: 2.0]
```

## 💡 Proposer une Fonctionnalité

Consultez d'abord [FEATURES_ROADMAP.md](./FEATURES_ROADMAP.md) pour voir si votre idée est déjà prévue.

Créez une issue avec :
- Description de la fonctionnalité
- Cas d'usage
- Impact attendu
- Difficulté estimée

## 📚 Ressources

- [Documentation API](http://localhost:3000/api-docs)
- [README.md](./README.md) - Documentation complète
- [QUICK_START.md](./QUICK_START.md) - Démarrage rapide
- [FEATURES_ROADMAP.md](./FEATURES_ROADMAP.md) - Feuille de route

## 🙏 Remerciements

Merci à tous les contributeurs qui aident à améliorer Dahira App !

## 📜 Licence

En contribuant, vous acceptez que vos contributions soient sous la même licence que le projet (MIT).

---

**Questions ?** N'hésitez pas à ouvrir une issue ou à contacter les mainteneurs.
