const { error } = require('../utils/response');

const tenantMiddleware = (req, res, next) => {
  if (!req.user) {
    return error(res, 'Utilisateur non authentifié', 401);
  }

  // Le super_admin bypass l'isolation tenant — il accède à tous les dahiras
  if (req.user.role === 'super_admin') {
    return next();
  }

  if (!req.user.dahira_id) {
    return error(res, 'Dahira non identifié pour cet utilisateur', 401);
  }

  req.dahira_id = req.user.dahira_id;
  next();
};

module.exports = tenantMiddleware;
