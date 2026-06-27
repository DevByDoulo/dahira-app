const pool = require('../../config/db');
const { comparePassword, hashPassword } = require('../../utils/bcrypt');
const { generateToken } = require('../../utils/jwt');

const login = async (telephone, password) => {
  const [rows] = await pool.query(
    'SELECT id, dahira_id, nom, telephone, email, password_hash, role, actif, is_owner, photo_url FROM membres WHERE telephone = ?',
    [telephone]
  );

  if (rows.length === 0) {
    throw new Error('Identifiants incorrects');
  }

  const membre = rows[0];

  if (!membre.actif) {
    throw new Error('Compte désactivé');
  }

  if (!membre.password_hash) {
    throw new Error('Ce compte n\'a pas encore de mot de passe. Utilisez le lien d\'invitation reçu par email.');
  }

  const isPasswordValid = await comparePassword(password, membre.password_hash);
  if (!isPasswordValid) {
    throw new Error('Identifiants incorrects');
  }

  await pool.query('UPDATE membres SET last_login = NOW() WHERE id = ?', [membre.id]);

  const token = generateToken({
    id: membre.id,
    dahira_id: membre.dahira_id,
    role: membre.role,
  });

  const { password_hash, ...membreWithoutPassword } = membre;

  return { token, user: membreWithoutPassword };
};

const getMe = async (membreId) => {
  const query = membreId
    ? `SELECT id, dahira_id, nom, prenom, telephone, telephone_secours, email,
              date_adhesion, responsabilites, sexe, date_naissance, adresse, profession,
              role, actif, is_owner, photo_url, thumbnail_url,
              email_notifications, last_login, created_at
       FROM membres WHERE id = ?`
    : 'SELECT id FROM membres WHERE id IS NULL';

  const [rows] = await pool.query(query, [membreId]);

  if (rows.length === 0) {
    throw new Error('Membre non trouvé');
  }

  return rows[0];
};

const updateMe = async (membreId, dahiraId, { nom, email, telephone }) => {
  const isSuperAdmin = !dahiraId;

  const whereClause = isSuperAdmin
    ? 'id = ? AND role = \'super_admin\''
    : 'id = ? AND dahira_id = ?';
  const params = isSuperAdmin ? [membreId] : [membreId, dahiraId];

  const [existing] = await pool.query(`SELECT id FROM membres WHERE ${whereClause}`, params);
  if (existing.length === 0) throw new Error('Membre non trouvé');

  const updateParams = isSuperAdmin
    ? [nom?.trim() || null, email?.trim() || null, telephone?.trim() || null, membreId]
    : [nom?.trim() || null, email?.trim() || null, telephone?.trim() || null, membreId, dahiraId];

  const updateWhere = isSuperAdmin ? 'WHERE id = ?' : 'WHERE id = ? AND dahira_id = ?';

  await pool.query(
    `UPDATE membres SET nom = COALESCE(?, nom), email = ?, telephone = COALESCE(?, telephone) ${updateWhere}`,
    updateParams,
  );

  const [updated] = await pool.query(
    'SELECT id, dahira_id, nom, prenom, telephone, email, role, actif, is_owner, photo_url, thumbnail_url FROM membres WHERE id = ?',
    [membreId],
  );
  return updated[0];
};

const changePassword = async (membreId, oldPassword, newPassword) => {
  const [rows] = await pool.query('SELECT password_hash FROM membres WHERE id = ?', [membreId]);

  if (rows.length === 0) {
    throw new Error('Membre non trouvé');
  }

  if (!rows[0].password_hash) {
    throw new Error('Aucun mot de passe défini pour ce compte');
  }

  const isPasswordValid = await comparePassword(oldPassword, rows[0].password_hash);
  if (!isPasswordValid) {
    throw new Error('Ancien mot de passe incorrect');
  }

  const hashedNewPassword = await hashPassword(newPassword);

  await pool.query('UPDATE membres SET password_hash = ? WHERE id = ?', [hashedNewPassword, membreId]);

  return { message: 'Mot de passe modifié avec succès' };
};

const updateMePhoto = async (membreId, photoUrl, thumbnailUrl) => {
  await pool.query('UPDATE membres SET photo_url = ?, thumbnail_url = ? WHERE id = ?', [
    photoUrl,
    thumbnailUrl,
    membreId,
  ]);

  const [rows] = await pool.query(
    'SELECT id, dahira_id, nom, prenom, telephone, email, role, photo_url, thumbnail_url FROM membres WHERE id = ?',
    [membreId],
  );
  return rows[0];
};

const registerDahira = async ({ dahira, user }) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[existing]] = await conn.query('SELECT id FROM membres WHERE telephone = ?', [
      user.telephone,
    ]);
    if (existing) throw new Error('Ce numéro de téléphone est déjà utilisé');

    const [dahiraResult] = await conn.query(
      'INSERT INTO dahiras (nom, ville, telephone, actif) VALUES (?, ?, ?, TRUE)',
      [dahira.nom.trim(), dahira.ville?.trim() || null, dahira.telephone?.trim() || null],
    );
    const dahiraId = dahiraResult.insertId;

    const password_hash = await hashPassword(user.password);
    const [membreResult] = await conn.query(
      `INSERT INTO membres (dahira_id, nom, telephone, email, password_hash, role, is_owner, actif)
       VALUES (?, ?, ?, ?, ?, 'bureau', TRUE, TRUE)`,
      [
        dahiraId,
        user.nom.trim(),
        user.telephone.trim(),
        user.email?.trim() || null,
        password_hash,
      ],
    );
    const membreId = membreResult.insertId;

    await conn.commit();

    const token = generateToken({ id: membreId, dahira_id: dahiraId, role: 'bureau' });

    return {
      token,
      user: {
        id: membreId,
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
  updateMe,
  updateMePhoto,
  changePassword,
  registerDahira,
};
