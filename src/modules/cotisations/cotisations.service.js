const pool = require('../../config/db');

const encaisserCotisation = async (dahiraId, cotisationData, userId) => {
  const { membre_id, seance_id, montant, mode_paiement, note } = cotisationData;

  // Validate mode_paiement
  const validModes = ['especes', 'wave', 'orange_money'];
  if (!validModes.includes(mode_paiement)) {
    throw new Error('Mode de paiement invalide. Les modes autorisés sont: especes, wave, orange_money');
  }

  // Verify membre exists and belongs to dahira
  const [membre] = await pool.query(
    'SELECT id FROM membres WHERE id = ? AND dahira_id = ?',
    [membre_id, dahiraId]
  );

  if (membre.length === 0) {
    throw new Error('Membre non trouvé ou n\'appartient pas à ce dahira');
  }

  // Verify seance exists and belongs to dahira
  const [seance] = await pool.query(
    'SELECT id FROM seances WHERE id = ? AND dahira_id = ?',
    [seance_id, dahiraId]
  );

  if (seance.length === 0) {
    throw new Error('Séance non trouvée ou n\'appartient pas à ce dahira');
  }

  const [result] = await pool.query(
    `INSERT INTO cotisations (dahira_id, membre_id, seance_id, montant, mode_paiement, note, statut, declare_par, valide_par, valide_at)
     VALUES (?, ?, ?, ?, ?, ?, 'approved', NULL, ?, NOW())`,
    [dahiraId, membre_id, seance_id, montant, mode_paiement, note, userId]
  );

  const [newCotisation] = await pool.query(
    'SELECT * FROM cotisations WHERE id = ?',
    [result.insertId]
  );

  return newCotisation[0];
};

const encaisserCotisationsBatch = async (dahiraId, cotisationsData, userId) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const createdCotisations = [];

    for (const cotisationData of cotisationsData) {
      const { membre_id, seance_id, montant, mode_paiement, note } = cotisationData;

      // Validate mode_paiement
      const validModes = ['especes', 'wave', 'orange_money'];
      if (!validModes.includes(mode_paiement)) {
        throw new Error('Mode de paiement invalide. Les modes autorisés sont: especes, wave, orange_money');
      }

      // Verify membre exists and belongs to dahira
      const [membre] = await connection.query(
        'SELECT id FROM membres WHERE id = ? AND dahira_id = ?',
        [membre_id, dahiraId]
      );

      if (membre.length === 0) {
        throw new Error(`Membre ${membre_id} non trouvé ou n'appartient pas à ce dahira`);
      }

      // Verify seance exists and belongs to dahira
      const [seance] = await connection.query(
        'SELECT id FROM seances WHERE id = ? AND dahira_id = ?',
        [seance_id, dahiraId]
      );

      if (seance.length === 0) {
        throw new Error(`Séance ${seance_id} non trouvée ou n'appartient pas à ce dahira`);
      }

      const [result] = await connection.query(
        `INSERT INTO cotisations (dahira_id, membre_id, seance_id, montant, mode_paiement, note, statut, declare_par, valide_par, valide_at)
         VALUES (?, ?, ?, ?, ?, ?, 'approved', NULL, ?, NOW())`,
        [dahiraId, membre_id, seance_id, montant, mode_paiement, note, userId]
      );

      const [newCotisation] = await connection.query(
        'SELECT * FROM cotisations WHERE id = ?',
        [result.insertId]
      );

      createdCotisations.push(newCotisation[0]);
    }

    await connection.commit();

    return {
      count: createdCotisations.length,
      cotisations: createdCotisations
    };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

const declarerCotisation = async (dahiraId, membreId, cotisationData, userId) => {
  const { seance_id, montant, mode_paiement, note } = cotisationData;

  if (!membreId) {
    throw new Error('Ce compte n\'est pas lié à un membre');
  }

  // Validate mode_paiement (only wave or orange_money for declarations)
  const validModes = ['wave', 'orange_money'];
  if (!validModes.includes(mode_paiement)) {
    throw new Error('Mode de paiement invalide pour une déclaration. Les modes autorisés sont: wave, orange_money');
  }

  // Verify seance exists and belongs to dahira
  const [seance] = await pool.query(
    'SELECT id FROM seances WHERE id = ? AND dahira_id = ?',
    [seance_id, dahiraId]
  );

  if (seance.length === 0) {
    throw new Error('Séance non trouvée ou n\'appartient pas à ce dahira');
  }

  const [result] = await pool.query(
    `INSERT INTO cotisations (dahira_id, membre_id, seance_id, montant, mode_paiement, note, statut, declare_par, valide_par, valide_at)
     VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, NULL, NULL)`,
    [dahiraId, membreId, seance_id, montant, mode_paiement, note, userId]
  );

  const [newCotisation] = await pool.query(
    'SELECT * FROM cotisations WHERE id = ?',
    [result.insertId]
  );

  return newCotisation[0];
};

const getPendingCotisations = async (dahiraId) => {
  const [cotisations] = await pool.query(
    `SELECT c.*, m.nom, m.prenom, s.date_seance, s.type
     FROM cotisations c
     JOIN membres m ON c.membre_id = m.id
     JOIN seances s ON c.seance_id = s.id
     WHERE c.dahira_id = ? AND c.statut = 'pending'
     ORDER BY c.created_at ASC`,
    [dahiraId]
  );

  return cotisations;
};

const validerCotisation = async (id, dahiraId, userId) => {
  // Check if cotisation exists, belongs to dahira, and is pending
  const [existing] = await pool.query(
    'SELECT id, statut FROM cotisations WHERE id = ? AND dahira_id = ?',
    [id, dahiraId]
  );

  if (existing.length === 0) {
    throw new Error('Cotisation non trouvée');
  }

  if (existing[0].statut !== 'pending') {
    throw new Error('Cette cotisation a déjà été traitée');
  }

  await pool.query(
    `UPDATE cotisations 
     SET statut = 'approved', valide_par = ?, valide_at = NOW() 
     WHERE id = ? AND dahira_id = ?`,
    [userId, id, dahiraId]
  );

  const [updatedCotisation] = await pool.query(
    'SELECT * FROM cotisations WHERE id = ?',
    [id]
  );

  return updatedCotisation[0];
};

const rejeterCotisation = async (id, dahiraId, userId, note = null) => {
  // Check if cotisation exists, belongs to dahira, and is pending
  const [existing] = await pool.query(
    'SELECT id, statut FROM cotisations WHERE id = ? AND dahira_id = ?',
    [id, dahiraId]
  );

  if (existing.length === 0) {
    throw new Error('Cotisation non trouvée');
  }

  if (existing[0].statut !== 'pending') {
    throw new Error('Cette cotisation a déjà été traitée');
  }

  await pool.query(
    `UPDATE cotisations 
     SET statut = 'rejected', valide_par = ?, valide_at = NOW(), note = COALESCE(?, note)
     WHERE id = ? AND dahira_id = ?`,
    [userId, note, id, dahiraId]
  );

  const [updatedCotisation] = await pool.query(
    'SELECT * FROM cotisations WHERE id = ?',
    [id]
  );

  return updatedCotisation[0];
};

const getMesCotisations = async (dahiraId, membreId) => {
  if (!membreId) {
    return [];
  }

  const [cotisations] = await pool.query(
    `SELECT c.*, s.date_seance, s.type
     FROM cotisations c
     JOIN seances s ON c.seance_id = s.id
     WHERE c.dahira_id = ? AND c.membre_id = ?
     ORDER BY c.created_at DESC`,
    [dahiraId, membreId]
  );

  return cotisations;
};

const getDashboard = async (dahiraId, seanceId = null) => {
  let whereClause = 'WHERE c.dahira_id = ? AND c.statut = "approved"';
  const params = [dahiraId];

  if (seanceId) {
    whereClause += ' AND c.seance_id = ?';
    params.push(seanceId);
  }

  // Calculate totals by payment method
  const [totals] = await pool.query(
    `SELECT 
       SUM(CASE WHEN mode_paiement = 'especes' THEN montant ELSE 0 END) as total_especes,
       SUM(CASE WHEN mode_paiement = 'wave' THEN montant ELSE 0 END) as total_wave,
       SUM(CASE WHEN mode_paiement = 'orange_money' THEN montant ELSE 0 END) as total_orange_money,
       SUM(montant) as total_general
     FROM cotisations c
     ${whereClause}`,
    params
  );

  // Get latest weekly seance
  const [latestSeance] = await pool.query(
    `SELECT id, date_seance 
     FROM seances 
     WHERE dahira_id = ? AND type = 'hebdomadaire' 
     ORDER BY date_seance DESC 
     LIMIT 1`,
    [dahiraId]
  );

  let membres_a_jour = 0;
  let membres_en_retard = [];

  if (latestSeance.length > 0) {
    const latestSeanceId = latestSeance[0].id;

    // Count members with approved cotisation for latest weekly seance
    const [countResult] = await pool.query(
      `SELECT COUNT(DISTINCT membre_id) as count
       FROM cotisations
       WHERE dahira_id = ? AND seance_id = ? AND statut = 'approved'`,
      [dahiraId, latestSeanceId]
    );

    membres_a_jour = countResult[0].count;

    // Get members without approved cotisation for latest weekly seance
    const [membersBehind] = await pool.query(
      `SELECT m.id, m.nom, m.prenom
       FROM membres m
       WHERE m.dahira_id = ? AND m.actif = TRUE
       AND m.id NOT IN (
         SELECT DISTINCT membre_id
         FROM cotisations
         WHERE dahira_id = ? AND seance_id = ? AND statut = 'approved'
       )
       ORDER BY m.nom, m.prenom`,
      [dahiraId, dahiraId, latestSeanceId]
    );

    membres_en_retard = membersBehind;
  }

  return {
    total_especes: totals[0].total_especes || 0,
    total_wave: totals[0].total_wave || 0,
    total_orange_money: totals[0].total_orange_money || 0,
    total_general: totals[0].total_general || 0,
    membres_a_jour,
    membres_en_retard
  };
};

module.exports = {
  encaisserCotisation,
  encaisserCotisationsBatch,
  declarerCotisation,
  getPendingCotisations,
  validerCotisation,
  rejeterCotisation,
  getMesCotisations,
  getDashboard
};
