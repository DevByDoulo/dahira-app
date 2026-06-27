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
    'SELECT id, dahira_id, membre_id, nom, telephone, email, role, actif, photo_url, created_at FROM users WHERE id = ?',
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

const registerDahira = async ({ dahira, user }) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Vérifier que le téléphone n'est pas déjà utilisé
    const [[existing]] = await conn.query(
      'SELECT id FROM users WHERE telephone = ?',
      [user.telephone]
    );
    if (existing) throw new Error('Ce numéro de téléphone est déjà utilisé');

    // 2. Créer le Dahira
    const [dahiraResult] = await conn.query(
      'INSERT INTO dahiras (nom, ville, telephone, actif) VALUES (?, ?, ?, TRUE)',
      [dahira.nom.trim(), dahira.ville?.trim() || null, dahira.telephone?.trim() || null]
    );
    const dahiraId = dahiraResult.insertId;

    // 3. Créer l'utilisateur propriétaire avec rôle bureau
    const password_hash = await hashPassword(user.password);
    const [userResult] = await conn.query(
      `INSERT INTO users (dahira_id, nom, telephone, email, password_hash, role, is_owner, actif)
       VALUES (?, ?, ?, ?, ?, 'bureau', TRUE, TRUE)`,
      [dahiraId, user.nom.trim(), user.telephone.trim(), user.email?.trim() || null, password_hash]
    );
    const userId = userResult.insertId;

    await conn.commit();

    // 4. Générer le token et retourner
    const token = generateToken({ id: userId, dahira_id: dahiraId, role: 'bureau', membre_id: null });

    return {
      token,
      user: {
        id: userId,
        dahira_id: dahiraId,
        nom: user.nom.trim(),
        telephone: user.telephone.trim(),
        email: user.email?.trim() || null,
        role: 'bureau',
        is_owner: true,
        actif: true,
      },
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

module.exports = {
  login,
  getMe,
  changePassword,
  registerDahira,
};
