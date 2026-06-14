const pool = require('../../config/db');
const { comparePassword, hashPassword } = require('../../utils/bcrypt');
const { generateToken } = require('../../utils/jwt');

const login = async (telephone, password) => {
  const [rows] = await pool.query(
    'SELECT id, dahira_id, membre_id, nom, telephone, email, password_hash, role, actif FROM users WHERE telephone = ?',
    [telephone]
  );

  if (rows.length === 0) {
    throw new Error('Identifiants incorrects');
  }

  const user = rows[0];

  if (!user.actif) {
    throw new Error('Compte désactivé');
  }

  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    throw new Error('Identifiants incorrects');
  }

  const token = generateToken({
    id: user.id,
    dahira_id: user.dahira_id,
    role: user.role,
    membre_id: user.membre_id
  });

  const { password_hash, ...userWithoutPassword } = user;

  return {
    token,
    user: userWithoutPassword
  };
};

const getMe = async (userId) => {
  const [rows] = await pool.query(
    'SELECT id, dahira_id, membre_id, nom, telephone, email, role, actif, created_at FROM users WHERE id = ?',
    [userId]
  );

  if (rows.length === 0) {
    throw new Error('Utilisateur non trouvé');
  }

  return rows[0];
};

const changePassword = async (userId, oldPassword, newPassword) => {
  const [rows] = await pool.query(
    'SELECT password_hash FROM users WHERE id = ?',
    [userId]
  );

  if (rows.length === 0) {
    throw new Error('Utilisateur non trouvé');
  }

  const isPasswordValid = await comparePassword(oldPassword, rows[0].password_hash);
  if (!isPasswordValid) {
    throw new Error('Ancien mot de passe incorrect');
  }

  const hashedNewPassword = await hashPassword(newPassword);

  await pool.query(
    'UPDATE users SET password_hash = ? WHERE id = ?',
    [hashedNewPassword, userId]
  );

  return { message: 'Mot de passe modifié avec succès' };
};

module.exports = {
  login,
  getMe,
  changePassword
};
