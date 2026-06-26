const pool = require('../../config/db');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../../utils/email');
const { hashPassword, comparePassword } = require('../../utils/bcrypt');

/**
 * Génère un token de réinitialisation sécurisé
 */
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Demande de réinitialisation de mot de passe
 */
const requestPasswordReset = async (telephone) => {
  // Vérifier que l'utilisateur existe
  const [users] = await pool.query(
    'SELECT id, nom, email, telephone FROM users WHERE telephone = ? AND actif = TRUE',
    [telephone]
  );

  if (users.length === 0) {
    throw new Error('Aucun compte actif trouvé avec ce numéro de téléphone');
  }

  const user = users[0];

  if (!user.email) {
    throw new Error('Aucun email associé à ce compte. Contactez un administrateur.');
  }

  // Générer le token
  const token = generateResetToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // Expire dans 1h

  // Enregistrer le token
  await pool.query(
    `INSERT INTO password_resets (user_id, token, expires_at)
     VALUES (?, ?, ?)`,
    [user.id, token, expiresAt]
  );

  // Générer le lien de réinitialisation
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
  const resetLink = `${baseUrl}/nouveau-mot-de-passe?token=${token}`;

  // Envoyer l'email
  await sendPasswordResetEmail(user.email, user.nom, resetLink);

  return {
    message: 'Un email de réinitialisation a été envoyé',
    email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') // Masquer partiellement
  };
};

/**
 * Vérifier la validité d'un token
 */
const verifyResetToken = async (token) => {
  const [resets] = await pool.query(
    `SELECT pr.*, u.nom, u.email 
     FROM password_resets pr
     JOIN users u ON pr.user_id = u.id
     WHERE pr.token = ? AND pr.used = FALSE`,
    [token]
  );

  if (resets.length === 0) {
    throw new Error('Token invalide ou déjà utilisé');
  }

  const reset = resets[0];

  // Vérifier l'expiration
  if (new Date(reset.expires_at) < new Date()) {
    throw new Error('Ce lien a expiré. Veuillez demander un nouveau lien.');
  }

  return {
    valid: true,
    user_name: reset.nom,
    email: reset.email
  };
};

/**
 * Réinitialiser le mot de passe
 */
const resetPassword = async (token, newPassword) => {
  // Vérifier le token
  const [resets] = await pool.query(
    `SELECT pr.*, u.id as user_id, u.actif
     FROM password_resets pr
     JOIN users u ON pr.user_id = u.id
     WHERE pr.token = ? AND pr.used = FALSE`,
    [token]
  );

  if (resets.length === 0) {
    throw new Error('Token invalide ou déjà utilisé');
  }

  const reset = resets[0];

  // Vérifier l'expiration
  if (new Date(reset.expires_at) < new Date()) {
    throw new Error('Ce lien a expiré. Veuillez demander un nouveau lien.');
  }

  // Vérifier que le compte est actif
  if (!reset.actif) {
    throw new Error('Ce compte est désactivé');
  }

  // Hasher le nouveau mot de passe
  const passwordHash = await hashPassword(newPassword);

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Mettre à jour le mot de passe
    await connection.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [passwordHash, reset.user_id]
    );

    // Marquer le token comme utilisé
    await connection.query(
      'UPDATE password_resets SET used = TRUE, used_at = NOW() WHERE id = ?',
      [reset.id]
    );

    // Invalider tous les autres tokens de cet utilisateur
    await connection.query(
      'UPDATE password_resets SET used = TRUE WHERE user_id = ? AND id != ? AND used = FALSE',
      [reset.user_id, reset.id]
    );

    await connection.commit();

    return {
      message: 'Mot de passe réinitialisé avec succès'
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Nettoyer les tokens expirés (à exécuter périodiquement)
 */
const cleanupExpiredTokens = async () => {
  const [result] = await pool.query(
    'DELETE FROM password_resets WHERE expires_at < NOW() OR (used = TRUE AND used_at < DATE_SUB(NOW(), INTERVAL 30 DAY))'
  );

  return {
    deleted: result.affectedRows
  };
};

module.exports = {
  requestPasswordReset,
  verifyResetToken,
  resetPassword,
  cleanupExpiredTokens
};
