const { error } = require('../utils/response');

const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return error(res, 'Utilisateur non authentifié', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return error(res, 'Rôle insuffisant pour accéder à cette ressource', 403);
    }

    next();
  };
};

module.exports = allowRoles;
