const pool = require('../../config/db');

/**
 * Créer un dahira
 */
const createDahira = async (dahiraData) => {
  const { nom, adresse, telephone, email, description, logo_url } = dahiraData;

  const [result] = await pool.query(
    `INSERT INTO dahiras (nom, adresse, telephone, email, description, logo_url)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [nom, adresse, telephone, email, description, logo_url]
  );

  const [dahira] = await pool.query(
    'SELECT * FROM dahiras WHERE id = ?',
    [result.insertId]
  );

  return dahira[0];
};

/**
 * Récupérer tous les dahiras
 */
const getAllDahiras = async (filters = {}) => {
  const { actif, limit = 50, offset = 0 } = filters;

  let query = 'SELECT * FROM dahiras WHERE 1=1';
  const params = [];

  if (actif !== undefined) {
    query += ' AND actif = ?';
    params.push(actif === 'true' || actif === true);
  }

  query += ' ORDER BY nom ASC';

  if (limit) {
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
  }

  const [dahiras] = await pool.query(query, params);

  // Compter le total
  const [countResult] = await pool.query(
    'SELECT COUNT(*) as total FROM dahiras WHERE actif = ?',
    [actif !== undefined ? (actif === 'true' || actif === true) : true]
  );

  return {
    dahiras,
    total: countResult[0].total,
    limit: parseInt(limit),
    offset: parseInt(offset)
  };
};

/**
 * Récupérer un dahira par ID
 */
const getDahiraById = async (id) => {
  const [dahiras] = await pool.query(
    'SELECT * FROM dahiras WHERE id = ?',
    [id]
  );

  if (dahiras.length === 0) {
    throw new Error('Dahira non trouvé');
  }

  // Statistiques du dahira
  const [stats] = await pool.query(
    `SELECT 
       (SELECT COUNT(*) FROM membres WHERE dahira_id = ? AND actif = TRUE) as total_membres,
       (SELECT COUNT(*) FROM users WHERE dahira_id = ? AND actif = TRUE) as total_users,
       (SELECT COUNT(*) FROM seances WHERE dahira_id = ?) as total_seances,
       (SELECT SUM(montant) FROM cotisations WHERE dahira_id = ? AND statut = 'approved') as total_cotisations`,
    [id, id, id, id]
  );

  return {
    ...dahiras[0],
    statistiques: stats[0]
  };
};

/**
 * Mettre à jour un dahira
 */
const updateDahira = async (id, updateData) => {
  const { nom, adresse, telephone, email, description, logo_url, actif } = updateData;

  const fields = [];
  const values = [];

  if (nom !== undefined) {
    fields.push('nom = ?');
    values.push(nom);
  }
  if (adresse !== undefined) {
    fields.push('adresse = ?');
    values.push(adresse);
  }
  if (telephone !== undefined) {
    fields.push('telephone = ?');
    values.push(telephone);
  }
  if (email !== undefined) {
    fields.push('email = ?');
    values.push(email);
  }
  if (description !== undefined) {
    fields.push('description = ?');
    values.push(description);
  }
  if (logo_url !== undefined) {
    fields.push('logo_url = ?');
    values.push(logo_url);
  }
  if (actif !== undefined) {
    fields.push('actif = ?');
    values.push(actif);
  }

  if (fields.length === 0) {
    throw new Error('Aucune donnée à mettre à jour');
  }

  values.push(id);

  await pool.query(
    `UPDATE dahiras SET ${fields.join(', ')} WHERE id = ?`,
    values
  );

  return await getDahiraById(id);
};

/**
 * Désactiver un dahira
 */
const desactiverDahira = async (id) => {
  const [result] = await pool.query(
    'UPDATE dahiras SET actif = FALSE WHERE id = ?',
    [id]
  );

  if (result.affectedRows === 0) {
    throw new Error('Dahira non trouvé');
  }

  return {
    message: 'Dahira désactivé avec succès'
  };
};

/**
 * Activer un dahira
 */
const activerDahira = async (id) => {
  const [result] = await pool.query(
    'UPDATE dahiras SET actif = TRUE WHERE id = ?',
    [id]
  );

  if (result.affectedRows === 0) {
    throw new Error('Dahira non trouvé');
  }

  return {
    message: 'Dahira activé avec succès'
  };
};

/**
 * Supprimer un dahira
 * ATTENTION: Cela supprimera toutes les données associées (membres, cotisations, etc.)
 */
const deleteDahira = async (id) => {
  // Vérifier qu'il n'y a pas de données importantes
  const [stats] = await pool.query(
    `SELECT 
       (SELECT COUNT(*) FROM membres WHERE dahira_id = ?) as membres,
       (SELECT COUNT(*) FROM cotisations WHERE dahira_id = ?) as cotisations
    `,
    [id, id]
  );

  if (stats[0].membres > 0 || stats[0].cotisations > 0) {
    throw new Error('Impossible de supprimer un dahira avec des données existantes. Désactivez-le plutôt.');
  }

  const [result] = await pool.query(
    'DELETE FROM dahiras WHERE id = ?',
    [id]
  );

  if (result.affectedRows === 0) {
    throw new Error('Dahira non trouvé');
  }

  return {
    message: 'Dahira supprimé avec succès'
  };
};

module.exports = {
  createDahira,
  getAllDahiras,
  getDahiraById,
  updateDahira,
  desactiverDahira,
  activerDahira,
  deleteDahira
};
