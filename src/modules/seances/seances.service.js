const pool = require('../../config/db');

const createSeance = async (dahiraId, seanceData) => {
  const { date_seance, type, heure = null, lieu = null, theme = null } = seanceData;

  // Validate type
  const validTypes = ['dahira', 'mensuelle', 'autre'];
  if (!validTypes.includes(type)) {
    throw new Error('Type invalide. Les types autorisés sont: dahira, mensuelle, autre');
  }

  const [result] = await pool.query(
    `INSERT INTO seances (dahira_id, date_seance, heure, lieu, type, theme, cloturee)
     VALUES (?, ?, ?, ?, ?, ?, FALSE)`,
    [dahiraId, date_seance, heure, lieu, type, theme]
  );

  const [newSeance] = await pool.query(
    'SELECT * FROM seances WHERE id = ?',
    [result.insertId]
  );

  return newSeance[0];
};

const getAllSeances = async (dahiraId, typeFilter = null, clotureeFilter = null, limit = null) => {
  let query = `
    SELECT id, dahira_id, date_seance,
           TIME_FORMAT(heure, '%H:%i') AS heure,
           lieu, type, theme, cloturee, created_at
    FROM seances WHERE dahira_id = ?`;
  const params = [dahiraId];

  if (typeFilter) {
    query += ` AND type = ?`;
    params.push(typeFilter);
  }

  if (clotureeFilter !== null) {
    query += ` AND cloturee = ?`;
    params.push(clotureeFilter ? 1 : 0);
  }

  query += ` ORDER BY date_seance DESC`;

  if (limit) {
    query += ` LIMIT ?`;
    params.push(limit);
  }

  const [seances] = await pool.query(query, params);
  return seances;
};

const getSeanceCourante = async (dahiraId) => {
  const [seances] = await pool.query(
    `SELECT id, dahira_id, date_seance,
            TIME_FORMAT(heure, '%H:%i') AS heure,
            lieu, type, cloturee, created_at
     FROM seances
     WHERE dahira_id = ? AND type = 'dahira' AND cloturee = FALSE
     ORDER BY date_seance DESC
     LIMIT 1`,
    [dahiraId]
  );

  if (seances.length === 0) {
    throw new Error('Aucune séance dahira en cours');
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
    `SELECT id, dahira_id, date_seance,
            TIME_FORMAT(heure, '%H:%i') AS heure,
            lieu, type, cloturee, created_at
     FROM seances WHERE id = ?`,
    [id]
  );

  return updatedSeance[0];
};

const getSeanceById = async (id, dahiraId) => {
  const [rows] = await pool.query(
    `SELECT id, dahira_id, date_seance,
            TIME_FORMAT(heure, '%H:%i') AS heure,
            lieu, type, theme, cloturee, created_at
     FROM seances WHERE id = ? AND dahira_id = ?`,
    [id, dahiraId]
  );
  if (rows.length === 0) throw new Error('Séance non trouvée');
  return rows[0];
};

const updateSeance = async (id, dahiraId, seanceData) => {
  const { date_seance, type, heure = null, lieu = null, theme = null } = seanceData;

  const validTypes = ['dahira', 'mensuelle', 'autre'];
  if (!validTypes.includes(type)) {
    throw new Error('Type invalide');
  }

  const [existing] = await pool.query(
    'SELECT id FROM seances WHERE id = ? AND dahira_id = ?',
    [id, dahiraId]
  );
  if (existing.length === 0) throw new Error('Séance non trouvée');

  await pool.query(
    `UPDATE seances SET date_seance = ?, type = ?, heure = ?, lieu = ?, theme = ?
     WHERE id = ? AND dahira_id = ?`,
    [date_seance, type, heure, lieu, theme, id, dahiraId]
  );

  return getSeanceById(id, dahiraId);
};

module.exports = {
  createSeance,
  getAllSeances,
  getSeanceCourante,
  getSeanceById,
  updateSeance,
  cloturerSeance
};
