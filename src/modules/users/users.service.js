const pool = require('../../config/db');
const { hashPassword } = require('../../utils/bcrypt');

const getAllUsers = async (dahiraId) => {
  const [users] = await pool.query(
    `SELECT id, nom, telephone, email, role, actif, membre_id, created_at 
     FROM users 
     WHERE dahira_id = ? 
     ORDER BY nom`,
    [dahiraId]
  );

  return users;
};

const createUser = async (dahiraId, userData) => {
  const { nom, telephone, password, role, email, membre_id } = userData;

  // Validate role
  const validRoles = ['membre', 'tresorier', 'bureau'];
  if (!validRoles.includes(role)) {
    throw new Error('Rôle invalide. Les rôles autorisés sont: membre, tresorier, bureau');
  }

  // If membre_id is provided, verify it exists and belongs to the dahira
  if (membre_id) {
    const [membre] = await pool.query(
      'SELECT id FROM membres WHERE id = ? AND dahira_id = ?',
      [membre_id, dahiraId]
    );

    if (membre.length === 0) {
      throw new Error('Membre non trouvé ou n\'appartient pas à ce dahira');
    }
  }

  // Hash password
  const password_hash = await hashPassword(password);

  // Insert user
  const [result] = await pool.query(
    `INSERT INTO users (dahira_id, nom, telephone, password_hash, role, email, membre_id, actif)
     VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
    [dahiraId, nom, telephone, password_hash, role, email, membre_id]
  );

  // Return user without password_hash
  const [newUser] = await pool.query(
    'SELECT id, nom, telephone, email, role, actif, membre_id, created_at FROM users WHERE id = ?',
    [result.insertId]
  );

  return newUser[0];
};

const updateUser = async (id, dahiraId, userData) => {
  const { nom, email, role, membre_id } = userData;

  // Validate role if provided
  if (role) {
    const validRoles = ['membre', 'tresorier', 'bureau'];
    if (!validRoles.includes(role)) {
      throw new Error('Rôle invalide. Les rôles autorisés sont: membre, tresorier, bureau');
    }
  }

  // If membre_id is provided, verify it exists and belongs to the dahira
  if (membre_id) {
    const [membre] = await pool.query(
      'SELECT id FROM membres WHERE id = ? AND dahira_id = ?',
      [membre_id, dahiraId]
    );

    if (membre.length === 0) {
      throw new Error('Membre non trouvé ou n\'appartient pas à ce dahira');
    }
  }

  // Check if user exists and belongs to dahira
  const [existing] = await pool.query(
    'SELECT id FROM users WHERE id = ? AND dahira_id = ?',
    [id, dahiraId]
  );

  if (existing.length === 0) {
    throw new Error('Utilisateur non trouvé');
  }

  // Update user
  await pool.query(
    `UPDATE users 
     SET nom = ?, email = ?, role = ?, membre_id = ?
     WHERE id = ? AND dahira_id = ?`,
    [nom, email, role, membre_id, id, dahiraId]
  );

  // Return updated user without password_hash
  const [updatedUser] = await pool.query(
    'SELECT id, nom, telephone, email, role, actif, membre_id, created_at FROM users WHERE id = ?',
    [id]
  );

  return updatedUser[0];
};

const desactiverUser = async (id, dahiraId) => {
  // Check if user exists and belongs to dahira
  const [existing] = await pool.query(
    'SELECT id FROM users WHERE id = ? AND dahira_id = ?',
    [id, dahiraId]
  );

  if (existing.length === 0) {
    throw new Error('Utilisateur non trouvé');
  }

  await pool.query(
    'UPDATE users SET actif = FALSE WHERE id = ? AND dahira_id = ?',
    [id, dahiraId]
  );

  // Return updated user without password_hash
  const [updatedUser] = await pool.query(
    'SELECT id, nom, telephone, email, role, actif, membre_id, created_at FROM users WHERE id = ?',
    [id]
  );

  return updatedUser[0];
};

const getUserByMembreId = async (membreId, dahiraId) => {
  const [rows] = await pool.query(
    'SELECT id, nom, telephone, email, role, actif, membre_id, created_at FROM users WHERE membre_id = ? AND dahira_id = ?',
    [membreId, dahiraId]
  );
  return rows[0] ?? null;
};

const activerUser = async (id, dahiraId) => {
  const [existing] = await pool.query(
    'SELECT id FROM users WHERE id = ? AND dahira_id = ?',
    [id, dahiraId]
  );
  if (existing.length === 0) throw new Error('Utilisateur non trouvé');

  await pool.query('UPDATE users SET actif = TRUE WHERE id = ? AND dahira_id = ?', [id, dahiraId]);

  const [updatedUser] = await pool.query(
    'SELECT id, nom, telephone, email, role, actif, membre_id, created_at FROM users WHERE id = ?',
    [id]
  );
  return updatedUser[0];
};

const updateMe = async (userId, dahiraId, { nom, email, telephone }) => {
  const [existing] = await pool.query(
    'SELECT id FROM users WHERE id = ? AND dahira_id = ?',
    [userId, dahiraId]
  );
  if (existing.length === 0) throw new Error('Utilisateur non trouvé');

  await pool.query(
    'UPDATE users SET nom = ?, email = ?, telephone = ? WHERE id = ? AND dahira_id = ?',
    [nom, email || null, telephone || null, userId, dahiraId]
  );

  const [updated] = await pool.query(
    'SELECT id, nom, telephone, email, role, actif, membre_id, created_at FROM users WHERE id = ?',
    [userId]
  );
  return updated[0];
};

module.exports = {
  getAllUsers,
  getUserByMembreId,
  createUser,
  updateUser,
  desactiverUser,
  activerUser,
  updateMe,
};
