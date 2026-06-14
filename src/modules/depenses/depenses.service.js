const pool = require('../../config/db');

/**
 * Créer une dépense
 */
const createDepense = async (depenseData, dahiraId, creePar) => {
  const {
    description,
    montant,
    categorie,
    mode_paiement,
    date_depense,
    justificatif_url,
    note
  } = depenseData;

  const [result] = await pool.query(
    `INSERT INTO depenses (dahira_id, description, montant, categorie, mode_paiement, date_depense, justificatif_url, note, cree_par)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [dahiraId, description, montant, categorie, mode_paiement, date_depense, justificatif_url, note, creePar]
  );

  const [depense] = await pool.query(
    'SELECT * FROM depenses WHERE id = ?',
    [result.insertId]
  );

  return depense[0];
};

/**
 * Récupérer toutes les dépenses avec filtres
 */
const getAllDepenses = async (dahiraId, filters = {}) => {
  const { statut, categorie, date_debut, date_fin, limit = 50, offset = 0 } = filters;

  let query = `
    SELECT d.*, 
           u1.nom as cree_par_nom,
           u2.nom as valide_par_nom
    FROM depenses d
    LEFT JOIN users u1 ON d.cree_par = u1.id
    LEFT JOIN users u2 ON d.valide_par = u2.id
    WHERE d.dahira_id = ?
  `;

  const params = [dahiraId];

  if (statut) {
    query += ' AND d.statut = ?';
    params.push(statut);
  }

  if (categorie) {
    query += ' AND d.categorie = ?';
    params.push(categorie);
  }

  if (date_debut) {
    query += ' AND d.date_depense >= ?';
    params.push(date_debut);
  }

  if (date_fin) {
    query += ' AND d.date_depense <= ?';
    params.push(date_fin);
  }

  query += ' ORDER BY d.date_depense DESC, d.created_at DESC';

  if (limit) {
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
  }

  const [depenses] = await pool.query(query, params);

  // Compter le total
  let countQuery = 'SELECT COUNT(*) as total FROM depenses WHERE dahira_id = ?';
  const countParams = [dahiraId];

  if (statut) {
    countQuery += ' AND statut = ?';
    countParams.push(statut);
  }

  if (categorie) {
    countQuery += ' AND categorie = ?';
    countParams.push(categorie);
  }

  const [countResult] = await pool.query(countQuery, countParams);

  return {
    depenses,
    total: countResult[0].total,
    limit: parseInt(limit),
    offset: parseInt(offset)
  };
};

/**
 * Récupérer une dépense par ID
 */
const getDepenseById = async (id, dahiraId) => {
  const [depenses] = await pool.query(
    `SELECT d.*, 
            u1.nom as cree_par_nom,
            u2.nom as valide_par_nom
     FROM depenses d
     LEFT JOIN users u1 ON d.cree_par = u1.id
     LEFT JOIN users u2 ON d.valide_par = u2.id
     WHERE d.id = ? AND d.dahira_id = ?`,
    [id, dahiraId]
  );

  if (depenses.length === 0) {
    throw new Error('Dépense non trouvée');
  }

  return depenses[0];
};

/**
 * Mettre à jour une dépense
 */
const updateDepense = async (id, dahiraId, updateData) => {
  const {
    description,
    montant,
    categorie,
    mode_paiement,
    date_depense,
    justificatif_url,
    note
  } = updateData;

  // Vérifier que la dépense existe et n'est pas validée
  const [existing] = await pool.query(
    'SELECT statut FROM depenses WHERE id = ? AND dahira_id = ?',
    [id, dahiraId]
  );

  if (existing.length === 0) {
    throw new Error('Dépense non trouvée');
  }

  if (existing[0].statut !== 'en_attente') {
    throw new Error('Impossible de modifier une dépense validée ou rejetée');
  }

  const fields = [];
  const values = [];

  if (description !== undefined) {
    fields.push('description = ?');
    values.push(description);
  }
  if (montant !== undefined) {
    fields.push('montant = ?');
    values.push(montant);
  }
  if (categorie !== undefined) {
    fields.push('categorie = ?');
    values.push(categorie);
  }
  if (mode_paiement !== undefined) {
    fields.push('mode_paiement = ?');
    values.push(mode_paiement);
  }
  if (date_depense !== undefined) {
    fields.push('date_depense = ?');
    values.push(date_depense);
  }
  if (justificatif_url !== undefined) {
    fields.push('justificatif_url = ?');
    values.push(justificatif_url);
  }
  if (note !== undefined) {
    fields.push('note = ?');
    values.push(note);
  }

  if (fields.length === 0) {
    throw new Error('Aucune donnée à mettre à jour');
  }

  values.push(id, dahiraId);

  await pool.query(
    `UPDATE depenses SET ${fields.join(', ')} WHERE id = ? AND dahira_id = ?`,
    values
  );

  return await getDepenseById(id, dahiraId);
};

/**
 * Valider une dépense
 */
const validerDepense = async (id, dahiraId, validePar) => {
  const [result] = await pool.query(
    `UPDATE depenses 
     SET statut = 'validee', valide_par = ?, valide_at = NOW()
     WHERE id = ? AND dahira_id = ? AND statut = 'en_attente'`,
    [validePar, id, dahiraId]
  );

  if (result.affectedRows === 0) {
    throw new Error('Dépense non trouvée ou déjà traitée');
  }

  return await getDepenseById(id, dahiraId);
};

/**
 * Rejeter une dépense
 */
const rejeterDepense = async (id, dahiraId, validePar, motif) => {
  const [result] = await pool.query(
    `UPDATE depenses 
     SET statut = 'rejetee', valide_par = ?, valide_at = NOW(), note = CONCAT(COALESCE(note, ''), '\nMotif de rejet: ', ?)
     WHERE id = ? AND dahira_id = ? AND statut = 'en_attente'`,
    [validePar, motif, id, dahiraId]
  );

  if (result.affectedRows === 0) {
    throw new Error('Dépense non trouvée ou déjà traitée');
  }

  return await getDepenseById(id, dahiraId);
};

/**
 * Supprimer une dépense
 */
const deleteDepense = async (id, dahiraId) => {
  // Seules les dépenses en attente ou rejetées peuvent être supprimées
  const [result] = await pool.query(
    'DELETE FROM depenses WHERE id = ? AND dahira_id = ? AND statut IN ("en_attente", "rejetee")',
    [id, dahiraId]
  );

  if (result.affectedRows === 0) {
    throw new Error('Dépense non trouvée ou impossible à supprimer (déjà validée)');
  }

  return {
    message: 'Dépense supprimée avec succès'
  };
};

/**
 * Statistiques des dépenses
 */
const getStatistiques = async (dahiraId, filters = {}) => {
  const { date_debut, date_fin, periode } = filters;

  // Total des dépenses par statut
  const [totaux] = await pool.query(
    `SELECT 
       COUNT(*) as total,
       SUM(CASE WHEN statut = 'en_attente' THEN 1 ELSE 0 END) as en_attente,
       SUM(CASE WHEN statut = 'validee' THEN 1 ELSE 0 END) as validees,
       SUM(CASE WHEN statut = 'rejetee' THEN 1 ELSE 0 END) as rejetees,
       SUM(CASE WHEN statut = 'validee' THEN montant ELSE 0 END) as montant_valide
     FROM depenses
     WHERE dahira_id = ?`,
    [dahiraId]
  );

  // Répartition par catégorie
  const [parCategorie] = await pool.query(
    `SELECT 
       categorie,
       COUNT(*) as nombre,
       SUM(montant) as montant_total
     FROM depenses
     WHERE dahira_id = ? AND statut = 'validee'
     GROUP BY categorie
     ORDER BY montant_total DESC`,
    [dahiraId]
  );

  // Évolution mensuelle
  const [evolution] = await pool.query(
    `SELECT 
       DATE_FORMAT(date_depense, '%Y-%m') as mois,
       COUNT(*) as nombre,
       SUM(montant) as montant_total
     FROM depenses
     WHERE dahira_id = ? AND statut = 'validee'
     AND date_depense >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
     GROUP BY DATE_FORMAT(date_depense, '%Y-%m')
     ORDER BY mois ASC`,
    [dahiraId]
  );

  // Dépenses du mois en cours
  const [moisActuel] = await pool.query(
    `SELECT 
       COUNT(*) as nombre,
       SUM(montant) as montant
     FROM depenses
     WHERE dahira_id = ? AND statut = 'validee'
     AND DATE_FORMAT(date_depense, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')`,
    [dahiraId]
  );

  return {
    totaux: totaux[0],
    par_categorie: parCategorie,
    evolution_mensuelle: evolution,
    mois_actuel: moisActuel[0]
  };
};

module.exports = {
  createDepense,
  getAllDepenses,
  getDepenseById,
  updateDepense,
  validerDepense,
  rejeterDepense,
  deleteDepense,
  getStatistiques
};
