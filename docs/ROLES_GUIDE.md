# Guide du système de rôles

> Dernière mise à jour : juillet 2026 — reflète la suppression du système
> `PERMISSIONS` / `requirePermission` / `requireAtLeast` (code mort).
> **La source de vérité des autorisations est `allowRoles(...)` dans les
> fichiers de routes de chaque module.**

---

## Les 6 rôles (`src/constants/roles.js`)

| Constante | Valeur | Libellé FR | Niveau | Périmètre |
|---|---|---|---|---|
| `ROLES.SUPER_ADMIN` | `super_admin` | Super Administrateur | 99 | Plateforme entière (hors tenant) |
| `ROLES.SECRETAIRE_GENERAL` | `secretaire_general` | Secrétaire Général | 5 | Admin du dahira, accès complet |
| `ROLES.ADJOINT` | `adjoint` | Adjoint | 4 | Comme le SG, sauf gérer le SG |
| `ROLES.TRESORIER` | `tresorier` | Trésorier | 3 | Finance : cotisations, dépenses, trésorerie |
| `ROLES.RESPONSABLE_ORG` | `responsable_org` | Communicateur | 2 | Séances et organisation |
| `ROLES.MEMBRE` | `membre` | Membre | 1 | Profil et déclaration de ses cotisations |

Le libellé utilisateur de `responsable_org` est **« Communicateur »** partout
(frontend et backend).

---

## Protéger une route

Toujours avec des listes explicites via `allowRoles` :

```javascript
const allowRoles = require('../../middlewares/role.middleware');
const { ROLES } = require('../../constants/roles');

// Exemple réel (seances.routes.js)
router.post(
  '/',
  authMiddleware,
  tenantMiddleware,
  allowRoles(ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.RESPONSABLE_ORG),
  createSeanceController,
);
```

- `allowRoles` valide les rôles passés **au chargement** (une faute de frappe
  fait planter le serveur au démarrage, pas en production silencieuse).
- Réponses : `401` si non authentifié, `403` si rôle insuffisant.
- Certains modules importent le middleware sous le nom `roleMiddleware`
  (trésorerie, dépenses) — c'est la même fonction.

---

## Répartition actuelle par module

Résumé indicatif — en cas de doute, **le fichier `*.routes.js` du module fait foi**.

| Module | Lecture | Écriture | Validation/Suppression |
|---|---|---|---|
| `membres` | SG, Adjoint, Trésorier | SG, Adjoint | SG, Adjoint |
| `seances` | SG, Adjoint, Trésorier, Communicateur | SG, Adjoint, Communicateur | SG, Adjoint (+Communicateur clôture) |
| `depenses` | SG, Adjoint, Trésorier | SG, Adjoint, Trésorier | SG, Adjoint |
| `tresorerie` | SG, Adjoint, Trésorier | — | — |
| `dashboard` | SG, Adjoint, Trésorier | — | — |
| `cotisations` | bureau + membre (les siennes) | bureau + membre (déclaration) | SG, Adjoint, Trésorier |
| `invitations` | SG, Adjoint, Trésorier | SG, Adjoint, Trésorier | SG, Adjoint, Trésorier |
| `users` | SG, Adjoint, Trésorier | SG, Adjoint | SG, Adjoint |
| `admin` | super_admin uniquement | super_admin | super_admin |

Note : le trésorier a un accès **en lecture** aux membres et séances même si
ces pages n'apparaissent pas dans sa sidebar — l'écran cotisations en dépend
(choix du membre et de la séance).

---

## Helpers disponibles (`src/constants/roles.js`)

```javascript
const {
  ROLES,          // constantes des 6 rôles
  ROLE_LABELS,    // libellés fr/en, niveau, description
  ADMIN_ROLES,    // [secretaire_general, adjoint]
  isAdminRole,    // (role) => bool
  getAllRoles,    // () => string[]
  isValidRole,    // (role) => bool
  getRoleInfo,    // (role) => { fr, en, level, description } | null
  getRoleLevel,   // (role) => number
  compareRoles,   // (a, b) => number (tri par niveau)
} = require('../constants/roles');
```

---

## Côté frontend

- La sidebar filtre les entrées par rôle : `main-layout.component.ts` (`navItems[].roles`).
- Les libellés de rôles sont centralisés dans `shared/utils/roles.ts`.
- Le dashboard a deux vues : bureau/trésorier (statistiques) et
  membre/communicateur (accueil simple, aucun appel aux endpoints stats).

## Historique

L'ancien système déclaratif (`PERMISSIONS`, `hasPermission`,
`requirePermission`, `requireAtLeast`, `ROLE_HIERARCHY`, `isAtLeast`) a été
supprimé en juillet 2026 : il n'était branché sur aucune route et sa table de
permissions contredisait les routes réelles (le rôle `responsable_org` n'y
figurait pas). Les documents `ROLES_EXAMPLES.md`,
`ROLES_IMPROVEMENTS_SUMMARY.md` et `MIGRATION_ROLES_COMPLETE.md` sont
conservés à titre historique et ne décrivent plus le code actuel.
