const pool = require('../../config/db');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../../utils/email');
const { hashPassword } = require('../../utils/bcrypt');
const { FRONTEND_URL } = require('../../config/app');

const generateResetToken = () => crypto.randomBytes(32).toString('hex');

const requestPasswordReset = async (telephone) => {
  const [membres] = await pool.query(
    'SELECT id, nom, email, telephone FROM membres WHERE telephone = ? AND actif = TRUE AND password_hash IS NOT NULL',
    [telephone],
  );

  if (membres.length === 0) {
    throw new Error('Aucun compte actif trouvé avec ce numéro de téléphone');
  }

  const membre = membres[0];

  if (!membre.email) {
    throw new Error('Aucun email associé à ce compte. Contactez un administrateur.');
  }

  const token = generateResetToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  await pool.query(
    'INSERT INTO password_resets (membre_id, token, expires_at) VALUES (?, ?, ?)',
    [membre.id, token, expiresAt],
  );

  const baseUrl = FRONTEND_URL;
  const resetLink = `${baseUrl}/nouveau-mot-de-passe?token=${token}`;

  await sendPasswordResetEmail(membre.email, membre.nom, resetLink);

  return {
    message: 'Un email de réinitialisation a été envoyé',
    email: membre.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
  };
};

const verifyResetToken = async (token) => {
  const [resets] = await pool.query(
    `SELECT pr.*, m.nom, m.email
     FROM password_resets pr
     JOIN membres m ON pr.membre_id = m.id
     WHERE pr.token = ? AND pr.used = FALSE`,
    [token],
  );

  if (resets.length === 0) throw new Error('Token invalide ou déjà utilisé');

  const reset = resets[0];
  if (new Date(reset.expires_at) < new Date()) {
    throw new Error('Ce lien a expiré. Veuillez demander un nouveau lien.');
  }

  return { valid: true, user_name: reset.nom, email: reset.email };
};

const resetPassword = async (token, newPassword) => {
  const [resets] = await pool.query(
    `SELECT pr.*, m.id as membre_id, m.actif
     FROM password_resets pr
     JOIN membres m ON pr.membre_id = m.id
     WHERE pr.token = ? AND pr.used = FALSE`,
    [token],
  );

  if (resets.length === 0) throw new Error('Token invalide ou déjà utilisé');

  const reset = resets[0];
  if (new Date(reset.expires_at) < new Date()) {
    throw new Error('Ce lien a expiré. Veuillez demander un nouveau lien.');
  }
  if (!reset.actif) throw new Error('Ce compte est désactivé');

  const passwordHash = await hashPassword(newPassword);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query('UPDATE membres SET password_hash = ? WHERE id = ?', [
      passwordHash,
      reset.membre_id,
    ]);

    await connection.query('UPDATE password_resets SET used = TRUE, used_at = NOW() WHERE id = ?', [reset.id]);

    await connection.query(
      'UPDATE password_resets SET used = TRUE WHERE membre_id = ? AND id != ? AND used = FALSE',
      [reset.membre_id, reset.id],
    );

    await connection.commit();
    return { message: 'Mot de passe réinitialisé avec succès' };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const cleanupExpiredTokens = async () => {
  const [result] = await pool.query(
    'DELETE FROM password_resets WHERE expires_at < NOW() OR (used = TRUE AND used_at < DATE_SUB(NOW(), INTERVAL 30 DAY))',
  );
  return { deleted: result.affectedRows };
};

module.exports = {
  requestPasswordReset,
  verifyResetToken,
  resetPassword,
  cleanupExpiredTokens,
};
