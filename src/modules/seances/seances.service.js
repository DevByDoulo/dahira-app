const pool = require('../../config/db');

const SEANCE_FIELDS = `
  id, dahira_id, date_seance,
  TIME_FORMAT(heure_debut, '%H:%i') AS heure,
  TIME_FORMAT(heure_debut, '%H:%i') AS heure_debut,
  TIME_FORMAT(heure_fin,   '%H:%i') AS heure_fin,
  lieu, type, theme, description, photo_url, cloturee, rappel_envoye, created_by, created_at
`;

const VALID_TYPES = ['dahira', 'mensuelle', 'autre'];

const createSeance = async (dahiraId, seanceData) => {
  const {
    date_seance, type = 'hebdomadaire',
    heure_debut = null, heure_fin = null, heure = null,
    lieu = null, theme = null, description = null,
    created_by = null
  } = seanceData;

  if (type && !VALID_TYPES.includes(type)) {
    throw new Error(`Type invalide. Types autorisés: ${VALID_TYPES.join(', ')}`);
  }

  const debutFinal = heure_debut ?? heure ?? null;

  const [result] = await pool.query(
    `INSERT INTO seances (dahira_id, date_seance, heure_debut, heure_fin, lieu, type, theme, description, cloturee, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, FALSE, ?)`,
    [dahiraId, date_seance, debutFinal, heure_fin, lieu, type, theme, description, created_by]
  );

  const [rows] = await pool.query(`SELECT ${SEANCE_FIELDS} FROM seances WHERE id = ?`, [result.insertId]);
  return rows[0];
};

const getAllSeances = async (dahiraId, typeFilter = null, clotureeFilter = null, limit = null) => {
  let query = `SELECT ${SEANCE_FIELDS} FROM seances WHERE dahira_id = ?`;
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
    `SELECT ${SEANCE_FIELDS}
     FROM seances
     WHERE dahira_id = ? AND cloturee = FALSE
     ORDER BY date_seance DESC
     LIMIT 1`,
    [dahiraId]
  );

  if (seances.length === 0) {
    throw new Error('Aucune séance en cours');
  }

  return seances[0];
};

const getSeanceById = async (id, dahiraId) => {
  const [rows] = await pool.query(
    `SELECT ${SEANCE_FIELDS} FROM seances WHERE id = ? AND dahira_id = ?`,
    [id, dahiraId]
  );
  if (rows.length === 0) throw new Error('Séance non trouvée');
  return rows[0];
};

const updateSeance = async (id, dahiraId, seanceData) => {
  const {
    date_seance, type,
    heure_debut = null, heure_fin = null, heure = null,
    lieu = null, theme = null, description = null
  } = seanceData;

  if (type && !VALID_TYPES.includes(type)) {
    throw new Error(`Type invalide. Types autorisés: ${VALID_TYPES.join(', ')}`);
  }

  const [existing] = await pool.query(
    'SELECT id FROM seances WHERE id = ? AND dahira_id = ?',
    [id, dahiraId]
  );
  if (existing.length === 0) throw new Error('Séance non trouvée');

  const debutFinal = heure_debut ?? heure ?? null;

  await pool.query(
    `UPDATE seances SET date_seance = ?, type = ?, heure_debut = ?, heure_fin = ?, lieu = ?, theme = ?, description = ?
     WHERE id = ? AND dahira_id = ?`,
    [date_seance, type, debutFinal, heure_fin, lieu, theme, description, id, dahiraId]
  );

  return getSeanceById(id, dahiraId);
};

const cloturerSeance = async (id, dahiraId) => {
  const [existing] = await pool.query(
    'SELECT id FROM seances WHERE id = ? AND dahira_id = ?',
    [id, dahiraId]
  );
  if (existing.length === 0) throw new Error('Séance non trouvée');

  await pool.query(
    'UPDATE seances SET cloturee = TRUE WHERE id = ? AND dahira_id = ?',
    [id, dahiraId]
  );

  const [rows] = await pool.query(`SELECT ${SEANCE_FIELDS} FROM seances WHERE id = ?`, [id]);
  return rows[0];
};

const updateSeancePhoto = async (id, dahiraId, photoUrl) => {
  const [existing] = await pool.query(
    'SELECT id FROM seances WHERE id = ? AND dahira_id = ?',
    [id, dahiraId]
  );
  if (existing.length === 0) throw new Error('Séance non trouvée');

  await pool.query(
    'UPDATE seances SET photo_url = ? WHERE id = ? AND dahira_id = ?',
    [photoUrl, id, dahiraId]
  );

  const [rows] = await pool.query(`SELECT ${SEANCE_FIELDS} FROM seances WHERE id = ?`, [id]);
  return rows[0];
};

module.exports = {
  createSeance,
  getAllSeances,
  getSeanceCourante,
  getSeanceById,
  updateSeance,
  updateSeancePhoto,
  cloturerSeance,
};
