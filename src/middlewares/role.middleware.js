const { error } = require('../utils/response');
const { isValidRole } = require('../constants/roles');

/**
 * Middleware de contrôle d'accès basé sur les rôles (RBAC)
 * 
 * @param {...string} allowedRoles - Rôles autorisés à accéder à la ressource
 * @returns {Function} Middleware Express
 * 
 * @example
 * const { ROLES } = require('../constants/roles');
 * 
 * // Un seul rôle
 * router.patch('/valider', allowRoles(ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT), controller);
 * 
 * // Plusieurs rôles
 * router.post('/', allowRoles(ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER), controller);
 */
const allowRoles = (...allowedRoles) => {
  // Validation : vérifier que tous les rôles passés sont valides
  const invalidRoles = allowedRoles.filter(role => !isValidRole(role));
  if (invalidRoles.length > 0) {
    throw new Error(`Rôles invalides dans allowRoles: ${invalidRoles.join(', ')}`);
  }

  return (req, res, next) => {
    // Vérifier que l'utilisateur est authentifié
    if (!req.user || !req.user.role) {
      return error(res, 'Utilisateur non authentifié', 401);
    }

    // Vérifier que le rôle de l'utilisateur est dans la liste autorisée
    if (!allowedRoles.includes(req.user.role)) {
      return error(res, 'Rôle insuffisant pour accéder à cette ressource', 403);
    }

    next();
  };
};

/**
 * Middleware pour vérifier une permission spécifique
 * 
 * @param {string} permission - Permission à vérifier (ex: 'depenses.validate')
 * @returns {Function} Middleware Express
 * 
 * @example
 * const { requirePermission } = require('../middlewares/role.middleware');
 * 
 * router.patch('/:id/valider', requirePermission('depenses.validate'), controller);
 */
const requirePermission = (permission) => {
  const { hasPermission } = require('../constants/roles');
  
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return error(res, 'Utilisateur non authentifié', 401);
    }

    if (!hasPermission(req.user.role, permission)) {
      return error(res, `Permission insuffisante: ${permission}`, 403);
    }

    next();
  };
};

/**
 * Middleware pour vérifier un niveau hiérarchique minimum
 * 
 * @param {string} minRole - Rôle minimum requis
 * @returns {Function} Middleware Express
 * 
 * @example
 * const { ROLES } = require('../constants/roles');
 * const { requireAtLeast } = require('../middlewares/role.middleware');
 * 
 * // Accessible par TRESORIER et BUREAU (pas MEMBRE)
 * router.get('/stats', requireAtLeast(ROLES.TRESORIER), controller);
 */
const requireAtLeast = (minRole) => {
  const { isAtLeast } = require('../constants/roles');
  
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return error(res, 'Utilisateur non authentifié', 401);
    }

    if (!isAtLeast(req.user.role, minRole)) {
      return error(res, 'Niveau de rôle insuffisant', 403);
    }

    next();
  };
};

module.exports = allowRoles;

// Export des fonctions additionnelles
module.exports.requirePermission = requirePermission;
module.exports.requireAtLeast = requireAtLeast;

