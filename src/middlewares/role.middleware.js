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

module.exports = allowRoles;

