const pool = require('../../config/db');

const getCurrentMonth = () => {
  const now = new Date();
  return now.toISOString().slice(0, 7); // Format: YYYY-MM
};

const getAllMembres = async (dahiraId) => {
  const currentMonth = getCurrentMonth();
  
  const [membres] = await pool.query(
    `SELECT id, nom, prenom, telephone, telephone_secours, photo_url, date_adhesion, responsabilites, actif, created_at 
     FROM membres 
     WHERE dahira_id = ? 
     ORDER BY nom, prenom`,
    [dahiraId]
  );

  // Calculate cotisation status for each member
  const membresWithStatus = await Promise.all(
    membres.map(async (membre) => {
      const [cotisations] = await pool.query(
        `SELECT id FROM cotisations WHERE membre_id = ?
         AND YEAR(created_at) = YEAR(NOW()) AND MONTH(created_at) = MONTH(NOW()) LIMIT 1`,
        [membre.id]
      );

      return {
        ...membre,
        statut_cotisation: cotisations.length > 0 ? 'a_jour' : 'en_retard'
      };
    })
  );

  return membresWithStatus;
};

const getMembreById = async (id, dahiraId) => {
  const [rows] = await pool.query(
    'SELECT * FROM membres WHERE id = ? AND dahira_id = ?',
    [id, dahiraId]
  );

  if (rows.length === 0) {
    throw new Error('Membre non trouvé');
  }

  const membre = rows[0];

  const [cotisations] = await pool.query(
    `SELECT id FROM cotisations WHERE membre_id = ?
     AND YEAR(created_at) = YEAR(NOW()) AND MONTH(created_at) = MONTH(NOW()) LIMIT 1`,
    [membre.id]
  );

  return {
    ...membre,
    statut_cotisation: cotisations.length > 0 ? 'a_jour' : 'en_retard',
  };
};

const createMembre = async (dahiraId, membreData) => {
  const { nom, prenom, telephone, telephone_secours, photo_url, date_adhesion, responsabilites } = membreData;

  // Vérifier l'unicité du téléphone au sein du dahira
  if (telephone) {
    const [existing] = await pool.query(
      'SELECT id FROM membres WHERE telephone = ? AND dahira_id = ?',
      [telephone, dahiraId]
    );
    if (existing.length > 0) {
      const err = new Error("Duplicate entry '" + telephone + "' for key 'membres.telephone'");
      err.code = 'ER_DUP_ENTRY';
      throw err;
    }
  }

  const [result] = await pool.query(
    `INSERT INTO membres (dahira_id, nom, prenom, telephone, telephone_secours, photo_url, date_adhesion, responsabilites, actif)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
    [dahiraId, nom, prenom, telephone, telephone_secours, photo_url, date_adhesion, responsabilites]
  );

  const [newMembre] = await pool.query(
    'SELECT * FROM membres WHERE id = ?',
    [result.insertId]
  );

  return newMembre[0];
};

const updateMembre = async (id, dahiraId, membreData) => {
  const { nom, prenom, telephone, telephone_secours, photo_url, date_adhesion, responsabilites } = membreData;

  // Check if member exists and belongs to dahira
  const [existing] = await pool.query(
    'SELECT id FROM membres WHERE id = ? AND dahira_id = ?',
    [id, dahiraId]
  );

  if (existing.length === 0) {
    throw new Error('Membre non trouvé');
  }

  await pool.query(
    `UPDATE membres 
     SET nom = ?, prenom = ?, telephone = ?, telephone_secours = ?, photo_url = ?, date_adhesion = ?, responsabilites = ?
     WHERE id = ? AND dahira_id = ?`,
    [nom, prenom, telephone, telephone_secours, photo_url, date_adhesion, responsabilites, id, dahiraId]
  );

  const [updatedMembre] = await pool.query(
    'SELECT * FROM membres WHERE id = ?',
    [id]
  );

  return updatedMembre[0];
};

const desactiverMembre = async (id, dahiraId) => {
  // Check if member exists and belongs to dahira
  const [existing] = await pool.query(
    'SELECT id FROM membres WHERE id = ? AND dahira_id = ?',
    [id, dahiraId]
  );

  if (existing.length === 0) {
    throw new Error('Membre non trouvé');
  }

  await pool.query(
    'UPDATE membres SET actif = FALSE WHERE id = ? AND dahira_id = ?',
    [id, dahiraId]
  );

  const [updatedMembre] = await pool.query(
    'SELECT * FROM membres WHERE id = ?',
    [id]
  );

  return updatedMembre[0];
};

module.exports = {
  getAllMembres,
  getMembreById,
  createMembre,
  updateMembre,
  desactiverMembre
};
