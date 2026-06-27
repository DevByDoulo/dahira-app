const pool = require('../../config/db');

const getAllEvenements = async (dahiraId, membreId) => {
  let query = `SELECT e.*,
                (SELECT COUNT(*) FROM participations p WHERE p.evenement_id = e.id AND p.statut IN ('inscrit','confirme','present')) as nombre_inscrits`;
  const params = [];

  if (membreId) {
    query += `, (SELECT COUNT(*) FROM participations p WHERE p.evenement_id = e.id AND p.membre_id = ? AND p.statut != 'annule') > 0 as mon_inscription`;
    params.push(membreId);
  } else {
    query += `, FALSE as mon_inscription`;
  }

  query += ` FROM evenements e WHERE e.dahira_id = ? ORDER BY e.date_debut ASC`;
  params.push(dahiraId);

  const [evenements] = await pool.query(query, params);
  return evenements;
};

const getEvenementById = async (id, dahiraId, membreId) => {
  let query = `SELECT e.*,
                (SELECT COUNT(*) FROM participations p WHERE p.evenement_id = e.id AND p.statut IN ('inscrit','confirme','present')) as nombre_inscrits`;
  const params = [];

  if (membreId) {
    query += `, (SELECT COUNT(*) FROM participations p WHERE p.evenement_id = e.id AND p.membre_id = ? AND p.statut != 'annule') > 0 as mon_inscription`;
    params.push(membreId);
  } else {
    query += `, FALSE as mon_inscription`;
  }

  query += ` FROM evenements e WHERE e.id = ? AND e.dahira_id = ?`;
  params.push(id, dahiraId);

  const [evenements] = await pool.query(query, params);

  if (evenements.length === 0) throw new Error('Événement non trouvé');

  return evenements[0];
};

const createEvenement = async (dahiraId, evenementData, membreId) => {
  const { titre, description, date_debut, date_fin, lieu, image_url, type, max_participants } = evenementData;

  const [result] = await pool.query(
    `INSERT INTO evenements (dahira_id, titre, description, date_debut, date_fin, lieu, image_url, type, max_participants, cree_par)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [dahiraId, titre, description, date_debut, date_fin || null, lieu, image_url || null, type || 'autre', max_participants || null, membreId],
  );

  const [newEvenement] = await pool.query('SELECT * FROM evenements WHERE id = ?', [result.insertId]);
  return newEvenement[0];
};

const updateEvenement = async (id, dahiraId, evenementData) => {
  const { titre, description, date_debut, date_fin, lieu, image_url, type, max_participants, inscriptions_ouvertes } = evenementData;

  const [existing] = await pool.query(
    'SELECT id FROM evenements WHERE id = ? AND dahira_id = ?',
    [id, dahiraId],
  );
  if (existing.length === 0) throw new Error('Événement non trouvé');

  await pool.query(
    `UPDATE evenements
     SET titre = ?, description = ?, date_debut = ?, date_fin = ?, lieu = ?, image_url = ?,
         type = ?, max_participants = ?, inscriptions_ouvertes = ?
     WHERE id = ? AND dahira_id = ?`,
    [titre, description, date_debut, date_fin || null, lieu, image_url || null, type || 'autre', max_participants || null, inscriptions_ouvertes ?? true, id, dahiraId],
  );

  const [updated] = await pool.query('SELECT * FROM evenements WHERE id = ?', [id]);
  return updated[0];
};

const deleteEvenement = async (id, dahiraId) => {
  const [existing] = await pool.query(
    'SELECT id FROM evenements WHERE id = ? AND dahira_id = ?',
    [id, dahiraId],
  );
  if (existing.length === 0) throw new Error('Événement non trouvé');

  await pool.query('DELETE FROM evenements WHERE id = ? AND dahira_id = ?', [id, dahiraId]);
  return { message: 'Événement supprimé avec succès' };
};

const s_inscrireEvenement = async (id, dahiraId, membreId) => {
  const [evenement] = await pool.query(
    'SELECT id, max_participants, inscriptions_ouvertes FROM evenements WHERE id = ? AND dahira_id = ?',
    [id, dahiraId],
  );
  if (evenement.length === 0) throw new Error('Événement non trouvé');
  if (!evenement[0].inscriptions_ouvertes) throw new Error('Les inscriptions sont fermées');

  const [existing] = await pool.query(
    'SELECT id FROM participations WHERE evenement_id = ? AND membre_id = ?',
    [id, membreId],
  );
  if (existing.length > 0) throw new Error('Vous êtes déjà inscrit à cet événement');

  await pool.query(
    `INSERT INTO participations (evenement_id, membre_id, dahira_id, statut) VALUES (?, ?, ?, 'inscrit')`,
    [id, membreId, dahiraId],
  );

  return { message: 'Inscription réussie' };
};

module.exports = {
  getAllEvenements,
  getEvenementById,
  createEvenement,
  updateEvenement,
  deleteEvenement,
  s_inscrireEvenement,
};
