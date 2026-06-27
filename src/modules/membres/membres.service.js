const pool = require('../../config/db');
const { hashPassword } = require('../../utils/bcrypt');

// ── Garde de sécurité hiérarchique ───────────────────────────────────────────
// Un bureau ne peut pas agir sur un bureau de rang supérieur (is_owner OU id plus petit).
const assertCanActOnMembre = async (actingMembre, targetId, dahiraId) => {
  if (actingMembre.role !== 'bureau') return;
  const [[target]] = await pool.query(
    'SELECT id, role, is_owner FROM membres WHERE id = ? AND dahira_id = ?',
    [targetId, dahiraId],
  );
  if (!target) throw new Error('Membre non trouvé');
  if (target.role === 'bureau' && (target.is_owner || target.id < actingMembre.id)) {
    throw new Error(
      'Action non autorisée : vous ne pouvez pas modifier ou désactiver un administrateur de rang supérieur.',
    );
  }
};

// ── Listing ───────────────────────────────────────────────────────────────────
const getAllMembres = async (dahiraId) => {
  const [membres] = await pool.query(
    `SELECT id, nom, prenom, telephone, telephone_secours, photo_url, thumbnail_url,
            date_adhesion, responsabilites, role, is_owner, actif,
            (password_hash IS NOT NULL) AS a_compte, created_at
     FROM membres
     WHERE dahira_id = ?
     ORDER BY nom, prenom`,
    [dahiraId],
  );

  return Promise.all(
    membres.map(async (m) => {
      const [cots] = await pool.query(
        `SELECT id FROM cotisations WHERE membre_id = ?
         AND YEAR(created_at) = YEAR(NOW()) AND MONTH(created_at) = MONTH(NOW()) LIMIT 1`,
        [m.id],
      );
      return { ...m, a_compte: !!m.a_compte, statut_cotisation: cots.length > 0 ? 'a_jour' : 'en_retard' };
    }),
  );
};

const getMembresAvecCompte = async (dahiraId) => {
  const [membres] = await pool.query(
    `SELECT id, nom, prenom, telephone, email, role, is_owner, actif, photo_url, thumbnail_url, last_login, created_at
     FROM membres
     WHERE dahira_id = ? AND password_hash IS NOT NULL
     ORDER BY nom, prenom`,
    [dahiraId],
  );
  return membres;
};

const getMembreById = async (id, dahiraId) => {
  const [rows] = await pool.query(
    `SELECT id, dahira_id, nom, prenom, telephone, telephone_secours, email, date_naissance,
            lieu_naissance, adresse, profession, responsabilites, sexe, date_adhesion,
            photo_url, thumbnail_url, role, is_owner, actif,
            (password_hash IS NOT NULL) AS a_compte, email_notifications, last_login, created_at
     FROM membres WHERE id = ? AND dahira_id = ?`,
    [id, dahiraId],
  );

  if (rows.length === 0) throw new Error('Membre non trouvé');

  const membre = { ...rows[0], a_compte: !!rows[0].a_compte };

  const [cots] = await pool.query(
    `SELECT id FROM cotisations WHERE membre_id = ?
     AND YEAR(created_at) = YEAR(NOW()) AND MONTH(created_at) = MONTH(NOW()) LIMIT 1`,
    [membre.id],
  );

  return { ...membre, statut_cotisation: cots.length > 0 ? 'a_jour' : 'en_retard' };
};

// ── Création ──────────────────────────────────────────────────────────────────
const createMembre = async (dahiraId, membreData) => {
  const {
    nom, prenom, telephone, telephone_secours, email,
    date_naissance, lieu_naissance, adresse, profession,
    responsabilites, sexe, date_adhesion, photo_url,
    role = 'membre', password,
  } = membreData;

  const [existing] = await pool.query('SELECT id FROM membres WHERE telephone = ?', [telephone]);
  if (existing.length > 0) {
    const err = new Error(`Duplicate entry '${telephone}' for key 'membres.telephone'`);
    err.code = 'ER_DUP_ENTRY';
    throw err;
  }

  if (email) {
    const [emailExists] = await pool.query(
      'SELECT id FROM membres WHERE email = ? AND dahira_id = ?',
      [email, dahiraId],
    );
    if (emailExists.length > 0) {
      const err = new Error(`Un membre avec l'adresse email '${email}' existe déjà dans ce dahira`);
      err.code = 'ER_DUP_EMAIL';
      throw err;
    }
  }

  const password_hash = password ? await hashPassword(password) : null;

  const [result] = await pool.query(
    `INSERT INTO membres
       (dahira_id, nom, prenom, telephone, telephone_secours, email, date_naissance,
        lieu_naissance, adresse, profession, responsabilites, sexe, date_adhesion,
        photo_url, role, password_hash, actif)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
    [
      dahiraId, nom, prenom, telephone, telephone_secours || null, email || null,
      date_naissance || null, lieu_naissance || null, adresse || null,
      profession || null, responsabilites || null, sexe || null,
      date_adhesion || null, photo_url || null, role, password_hash,
    ],
  );

  const [newMembre] = await pool.query(
    `SELECT id, dahira_id, nom, prenom, telephone, email, role, is_owner, actif,
            photo_url, (password_hash IS NOT NULL) AS a_compte, created_at
     FROM membres WHERE id = ?`,
    [result.insertId],
  );

  return { ...newMembre[0], a_compte: !!newMembre[0].a_compte };
};

// ── Mise à jour fiche ─────────────────────────────────────────────────────────
const updateMembre = async (id, dahiraId, membreData, actingMembre) => {
  if (actingMembre) await assertCanActOnMembre(actingMembre, id, dahiraId);

  const {
    nom, prenom, telephone, telephone_secours, email,
    date_naissance, lieu_naissance, adresse, profession,
    responsabilites, sexe, date_adhesion, photo_url,
  } = membreData;

  const [existing] = await pool.query(
    'SELECT id FROM membres WHERE id = ? AND dahira_id = ?',
    [id, dahiraId],
  );
  if (existing.length === 0) throw new Error('Membre non trouvé');

  if (email) {
    const [emailExists] = await pool.query(
      'SELECT id FROM membres WHERE email = ? AND dahira_id = ? AND id != ?',
      [email, dahiraId, id],
    );
    if (emailExists.length > 0) {
      const err = new Error(`Un membre avec l'adresse email '${email}' existe déjà dans ce dahira`);
      err.code = 'ER_DUP_EMAIL';
      throw err;
    }
  }

  await pool.query(
    `UPDATE membres SET
       nom = ?, prenom = ?, telephone = ?, telephone_secours = ?, email = ?,
       date_naissance = ?, lieu_naissance = ?, adresse = ?, profession = ?,
       responsabilites = ?, sexe = ?, date_adhesion = ?, photo_url = ?
     WHERE id = ? AND dahira_id = ?`,
    [
      nom, prenom, telephone, telephone_secours || null, email || null,
      date_naissance || null, lieu_naissance || null, adresse || null,
      profession || null, responsabilites || null, sexe || null,
      date_adhesion || null, photo_url || null,
      id, dahiraId,
    ],
  );

  const [updated] = await pool.query(
    `SELECT id, dahira_id, nom, prenom, telephone, email, role, is_owner, actif,
            photo_url, (password_hash IS NOT NULL) AS a_compte, created_at
     FROM membres WHERE id = ?`,
    [id],
  );
  return { ...updated[0], a_compte: !!updated[0].a_compte };
};

// ── Changer le rôle ───────────────────────────────────────────────────────────
const updateRole = async (id, dahiraId, role, actingMembre) => {
  await assertCanActOnMembre(actingMembre, id, dahiraId);

  const allowed = ['bureau', 'tresorier', 'responsable_org', 'membre'];
  if (!allowed.includes(role)) throw new Error('Rôle invalide');

  const [existing] = await pool.query(
    'SELECT id FROM membres WHERE id = ? AND dahira_id = ?',
    [id, dahiraId],
  );
  if (existing.length === 0) throw new Error('Membre non trouvé');

  await pool.query('UPDATE membres SET role = ? WHERE id = ? AND dahira_id = ?', [role, id, dahiraId]);

  const [updated] = await pool.query(
    'SELECT id, nom, prenom, telephone, email, role, is_owner, actif FROM membres WHERE id = ?',
    [id],
  );
  return updated[0];
};

// ── Désactiver / activer ───────────────────────────────────────────────────────
const desactiverMembre = async (id, dahiraId, actingMembre) => {
  if (actingMembre) await assertCanActOnMembre(actingMembre, id, dahiraId);

  const [existing] = await pool.query(
    'SELECT id FROM membres WHERE id = ? AND dahira_id = ?',
    [id, dahiraId],
  );
  if (existing.length === 0) throw new Error('Membre non trouvé');

  await pool.query('UPDATE membres SET actif = FALSE WHERE id = ? AND dahira_id = ?', [id, dahiraId]);

  const [updated] = await pool.query('SELECT * FROM membres WHERE id = ?', [id]);
  return updated[0];
};

const activerMembre = async (id, dahiraId, actingMembre) => {
  if (actingMembre) await assertCanActOnMembre(actingMembre, id, dahiraId);

  const [existing] = await pool.query(
    'SELECT id FROM membres WHERE id = ? AND dahira_id = ?',
    [id, dahiraId],
  );
  if (existing.length === 0) throw new Error('Membre non trouvé');

  await pool.query('UPDATE membres SET actif = TRUE WHERE id = ? AND dahira_id = ?', [id, dahiraId]);

  const [updated] = await pool.query('SELECT * FROM membres WHERE id = ?', [id]);
  return updated[0];
};

// ── Photo de profil membre ────────────────────────────────────────────────────
const updateMembrePhoto = async (id, dahiraId, photoUrl, thumbnailUrl) => {
  const [existing] = await pool.query(
    'SELECT id FROM membres WHERE id = ? AND dahira_id = ?',
    [id, dahiraId],
  );
  if (existing.length === 0) throw new Error('Membre non trouvé');

  await pool.query(
    'UPDATE membres SET photo_url = ?, thumbnail_url = ? WHERE id = ? AND dahira_id = ?',
    [photoUrl, thumbnailUrl, id, dahiraId],
  );

  const [updated] = await pool.query(
    'SELECT id, nom, prenom, photo_url, thumbnail_url FROM membres WHERE id = ?',
    [id],
  );
  return updated[0];
};

module.exports = {
  assertCanActOnMembre,
  getAllMembres,
  getMembresAvecCompte,
  getMembreById,
  createMembre,
  updateMembre,
  updateRole,
  desactiverMembre,
  activerMembre,
  updateMembrePhoto,
};
