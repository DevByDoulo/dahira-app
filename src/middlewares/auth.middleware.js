const { verifyToken } = require('../utils/jwt');
const { error } = require('../utils/response');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 'Token d\'authentification manquant', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token);

    req.user = {
      id: decoded.id,
      dahira_id: decoded.dahira_id,
      role: decoded.role,
      membre_id: decoded.membre_id
    };

    next();
  } catch (err) {
    return error(res, 'Token invalide ou expiré', 401);
  }
};

module.exports = authMiddleware;
