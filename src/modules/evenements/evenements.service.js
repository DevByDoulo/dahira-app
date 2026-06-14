const pool = require('../../config/db');

const getAllEvenements = async (dahiraId, membreId) => {
  let query = `SELECT e.*,
                (SELECT COUNT(*) FROM participations p WHERE p.evenement_id = e.id AND p.inscrit = TRUE) as nombre_inscrits`;
  const params = [dahiraId];

  if (membreId) {
    query += `, (SELECT COUNT(*) FROM participations p WHERE p.evenement_id = e.id AND p.membre_id = ? AND p.inscrit = TRUE) > 0 as mon_inscription`;
    params.push(membreId);
  } else {
    query += `, FALSE as mon_inscription`;
  }

  query += ` FROM evenements e WHERE e.dahira_id = ? ORDER BY e.date_evenement ASC`;
  params.push(dahiraId);

  const [evenements] = await pool.query(query, params);
  return evenements;
};

const getEvenementById = async (id, dahiraId, membreId) => {
  let query = `SELECT e.*,
                (SELECT COUNT(*) FROM participations p WHERE p.evenement_id = e.id AND p.inscrit = TRUE) as nombre_inscrits`;
  const params = [id, dahiraId];

  if (membreId) {
    query += `, (SELECT COUNT(*) FROM participations p WHERE p.evenement_id = e.id AND p.membre_id = ? AND p.inscrit = TRUE) > 0 as mon_inscription`;
    params.push(membreId);
  } else {
    query += `, FALSE as mon_inscription`;
  }

  query += ` FROM evenements e WHERE e.id = ? AND e.dahira_id = ?`;
  params.push(id, dahiraId);

  const [evenements] = await pool.query(query, params);

  if (evenements.length === 0) {
    throw new Error('Événement non trouvé');
  }

  return evenements[0];
};

const createEvenement = async (dahiraId, evenementData, userId) => {
  const { titre, description, date_evenement, heure, lieu, photo_url } = evenementData;

  const [result] = await pool.query(
    `INSERT INTO evenements (dahira_id, titre, description, date_evenement, heure, lieu, photo_url, cree_par)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [dahiraId, titre, description, date_evenement, heure, lieu, photo_url, userId]
  );

  const [newEvenement] = await pool.query(
    'SELECT * FROM evenements WHERE id = ?',
    [result.insertId]
  );

  return newEvenement[0];
};

const updateEvenement = async (id, dahiraId, evenementData) => {
  const { titre, description, date_evenement, heure, lieu, photo_url } = evenementData;

  // Check if evenement exists and belongs to dahira
  const [existing] = await pool.query(
    'SELECT id FROM evenements WHERE id = ? AND dahira_id = ?',
    [id, dahiraId]
  );

  if (existing.length === 0) {
    throw new Error('Événement non trouvé');
  }

  await pool.query(
    `UPDATE evenements
     SET titre = ?, description = ?, date_evenement = ?, heure = ?, lieu = ?, photo_url = ?
     WHERE id = ? AND dahira_id = ?`,
    [titre, description, date_evenement, heure, lieu, photo_url, id, dahiraId]
  );

  const [updatedEvenement] = await pool.query(
    'SELECT * FROM evenements WHERE id = ?',
    [id]
  );

  return updatedEvenement[0];
};

const deleteEvenement = async (id, dahiraId) => {
  // Check if evenement exists and belongs to dahira
  const [existing] = await pool.query(
    'SELECT id FROM evenements WHERE id = ? AND dahira_id = ?',
    [id, dahiraId]
  );

  if (existing.length === 0) {
    throw new Error('Événement non trouvé');
  }

  await pool.query(
    'DELETE FROM evenements WHERE id = ? AND dahira_id = ?',
    [id, dahiraId]
  );

  return { message: 'Événement supprimé avec succès' };
};

module.exports = {
  getAllEvenements,
  getEvenementById,
  createEvenement,
  updateEvenement,
  deleteEvenement
};
