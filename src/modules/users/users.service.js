const pool = require('../../config/db');
const { hashPassword } = require('../../utils/bcrypt');

/**
 * Vérifie qu'un secretaire_general ne peut pas agir sur un secretaire_general plus ancien (id inférieur = rang supérieur).
 * Seul le super_admin contourne cette règle (il passe par /api/admin, pas ici).
 */
const assertCanActOnUser = async (actingUser, targetId, dahiraId) => {
  const { role: actingRole } = actingUser;
  if (actingRole !== 'secretaire_general' && actingRole !== 'adjoint') return;

  const [[target]] = await pool.query(
    'SELECT id, role, is_owner FROM users WHERE id = ? AND dahira_id = ?',
    [targetId, dahiraId]
  );
  if (!target) throw new Error('Utilisateur non trouvé');

  if (actingRole === 'adjoint' && target.role === 'secretaire_general') {
    throw new Error("Action non autorisée : un adjoint ne peut pas modifier un Secrétaire Général.");
  }

  if (
    actingRole === 'secretaire_general' &&
    target.role === 'secretaire_general' &&
    (target.is_owner || target.id < actingUser.id)
  ) {
    throw new Error('Action non autorisée : vous ne pouvez pas modifier un Secrétaire Général de rang supérieur.');
  }
};

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
  const validRoles = ['secretaire_general', 'adjoint', 'tresorier', 'responsable_org', 'membre'];
  if (!validRoles.includes(role)) {
    throw new Error('Rôle invalide. Les rôles autorisés sont : secretaire_general, adjoint, tresorier, responsable_org, membre');
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

const updateUser = async (id, dahiraId, userData, actingUser) => {
  await assertCanActOnUser(actingUser, id, dahiraId);
  const { nom, email, role, membre_id } = userData;

  // Validate role if provided
  if (role) {
    const validRoles = ['secretaire_general', 'adjoint', 'tresorier', 'responsable_org', 'membre'];
    if (!validRoles.includes(role)) {
      throw new Error('Rôle invalide. Les rôles autorisés sont : secretaire_general, adjoint, tresorier, responsable_org, membre');
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

const desactiverUser = async (id, dahiraId, actingUser) => {
  await assertCanActOnUser(actingUser, id, dahiraId);

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

const activerUser = async (id, dahiraId, actingUser) => {
  await assertCanActOnUser(actingUser, id, dahiraId);

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
  const whereClause = dahiraId ? 'WHERE id = ? AND dahira_id = ?' : 'WHERE id = ?';
  const whereParams = dahiraId ? [userId, dahiraId] : [userId];

  const [existing] = await pool.query(`SELECT id FROM users ${whereClause}`, whereParams);
  if (existing.length === 0) throw new Error('Utilisateur non trouvé');

  await pool.query(
    'UPDATE users SET nom = ?, email = ?, telephone = ? WHERE id = ?',
    [nom, email || null, telephone || null, userId]
  );

  const [updated] = await pool.query(
    'SELECT id, nom, telephone, email, role, actif, membre_id, created_at, notification_prefs FROM users WHERE id = ?',
    [userId]
  );
  const row = updated[0];
  return { ...row, notification_prefs: row.notification_prefs ? JSON.parse(row.notification_prefs) : {} };
};

const updateNotificationPrefs = async (userId, dahiraId, prefs) => {
  const whereClause = dahiraId ? 'WHERE id = ? AND dahira_id = ?' : 'WHERE id = ?';
  const whereParams = dahiraId ? [userId, dahiraId] : [userId];

  const [existing] = await pool.query(`SELECT id FROM users ${whereClause}`, whereParams);
  if (existing.length === 0) throw new Error('Utilisateur non trouvé');

  // Ensure the column exists (safe to run on every call)
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_prefs JSON DEFAULT NULL`
  );

  await pool.query(
    'UPDATE users SET notification_prefs = ? WHERE id = ?',
    [JSON.stringify(prefs), userId]
  );

  const [updated] = await pool.query(
    'SELECT id, nom, telephone, email, role, actif, membre_id, created_at, notification_prefs FROM users WHERE id = ?',
    [userId]
  );
  const row = updated[0];
  return { ...row, notification_prefs: row.notification_prefs ? JSON.parse(row.notification_prefs) : {} };
};

module.exports = {
  getAllUsers,
  getUserByMembreId,
  createUser,
  updateUser,
  desactiverUser,
  activerUser,
  updateMe,
  updateNotificationPrefs,
};

