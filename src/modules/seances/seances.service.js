const pool = require('../../config/db');

const createSeance = async (dahiraId, seanceData) => {
  const { date_seance, type } = seanceData;

  // Validate type
  const validTypes = ['hebdomadaire', 'gamou', 'magal', 'safar', 'adiya', 'autre'];
  if (!validTypes.includes(type)) {
    throw new Error('Type invalide. Les types autorisés sont: hebdomadaire, gamou, magal, safar, adiya, autre');
  }

  const [result] = await pool.query(
    `INSERT INTO seances (dahira_id, date_seance, type, cloturee)
     VALUES (?, ?, ?, FALSE)`,
    [dahiraId, date_seance, type]
  );

  const [newSeance] = await pool.query(
    'SELECT * FROM seances WHERE id = ?',
    [result.insertId]
  );

  return newSeance[0];
};

const getAllSeances = async (dahiraId, typeFilter = null) => {
  let query = `SELECT * FROM seances WHERE dahira_id = ?`;
  const params = [dahiraId];

  if (typeFilter) {
    query += ` AND type = ?`;
    params.push(typeFilter);
  }

  query += ` ORDER BY date_seance DESC`;

  const [seances] = await pool.query(query, params);
  return seances;
};

const getSeanceCourante = async (dahiraId) => {
  const [seances] = await pool.query(
    `SELECT * FROM seances 
     WHERE dahira_id = ? AND type = 'hebdomadaire' AND cloturee = FALSE 
     ORDER BY date_seance DESC 
     LIMIT 1`,
    [dahiraId]
  );

  if (seances.length === 0) {
    throw new Error('Aucune séance hebdomadaire en cours');
  }

  return seances[0];
};

const cloturerSeance = async (id, dahiraId) => {
  // Check if seance exists and belongs to dahira
  const [existing] = await pool.query(
    'SELECT id FROM seances WHERE id = ? AND dahira_id = ?',
    [id, dahiraId]
  );

  if (existing.length === 0) {
    throw new Error('Séance non trouvée');
  }

  await pool.query(
    'UPDATE seances SET cloturee = TRUE WHERE id = ? AND dahira_id = ?',
    [id, dahiraId]
  );

  const [updatedSeance] = await pool.query(
    'SELECT * FROM seances WHERE id = ?',
    [id]
  );

  return updatedSeance[0];
};

module.exports = {
  createSeance,
  getAllSeances,
  getSeanceCourante,
  cloturerSeance
};
