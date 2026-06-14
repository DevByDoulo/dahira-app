const { error } = require('../utils/response');

const errorMiddleware = (err, req, res, next) => {
  console.error('Error:', err);

  // Handle MySQL duplicate entry error
  if (err.code === 'ER_DUP_ENTRY') {
    const match = err.message.match(/for key '(.+?)'/);
    const key = match ? match[1] : 'ce champ';
    
    if (key.includes('telephone')) {
      return error(res, 'Ce numéro de téléphone est déjà utilisé', 400);
    }
    
    return error(res, `Une entrée existe déjà pour ${key}`, 400);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return error(res, 'Token invalide', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return error(res, 'Token expiré', 401);
  }

  // Generic error
  const message = process.env.NODE_ENV === 'production' 
    ? 'Erreur serveur' 
    : err.message;

  return error(res, message, 500);
};

module.exports = errorMiddleware;
