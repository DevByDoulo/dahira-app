const { error } = require('../utils/response');

const superAdminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'super_admin') {
    return error(res, 'Accès réservé au Super Administrateur', 403);
  }
  next();
};

module.exports = superAdminMiddleware;
