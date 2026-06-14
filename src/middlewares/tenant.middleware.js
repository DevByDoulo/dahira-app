const { error } = require('../utils/response');

const tenantMiddleware = (req, res, next) => {
  if (!req.user || !req.user.dahira_id) {
    return error(res, 'Utilisateur non authentifié ou dahira_id manquant', 401);
  }

  req.dahira_id = req.user.dahira_id;
  next();
};

module.exports = tenantMiddleware;
