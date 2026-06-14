const pool = require('../../config/db');

/**
 * Enregistrer une présence
 */
const enregistrerPresence = async (seanceId, membreId, dahiraId, enregistrePar) => {
  // Vérifier que la séance existe et appartient au dahira
  const [seance] = await pool.query(
    'SELECT id FROM seances WHERE id = ? AND dahira_id = ?',
    [seanceId, dahiraId]
  );

  if (seance.length === 0) {
    throw new Error('Séance non trouvée');
  }

  // Vérifier que le membre existe et appartient au dahira
  const [membre] = await pool.query(
    'SELECT id FROM membres WHERE id = ? AND dahira_id = ?',
    [membreId, dahiraId]
  );

  if (membre.length === 0) {
    throw new Error('Membre non trouvé');
  }

  // Vérifier si la présence n'existe pas déjà
  const [existing] = await pool.query(
    'SELECT id FROM presences WHERE seance_id = ? AND membre_id = ?',
    [seanceId, membreId]
  );

  if (existing.length > 0) {
    throw new Error('La présence de ce membre est déjà enregistrée pour cette séance');
  }

  // Enregistrer la présence
  const [result] = await pool.query(
    `INSERT INTO presences (seance_id, membre_id, dahira_id, enregistre_par, present)
     VALUES (?, ?, ?, ?, TRUE)`,
    [seanceId, membreId, dahiraId, enregistrePar]
  );

  const [presence] = await pool.query(
    'SELECT * FROM presences WHERE id = ?',
    [result.insertId]
  );

  return presence[0];
};

/**
 * Enregistrer les présences en masse
 */
const enregistrerPresencesBatch = async (seanceId, membreIds, dahiraId, enregistrePar) => {
  // Vérifier que la séance existe
  const [seance] = await pool.query(
    'SELECT id FROM seances WHERE id = ? AND dahira_id = ?',
    [seanceId, dahiraId]
  );

  if (seance.length === 0) {
    throw new Error('Séance non trouvée');
  }

  const connection = await pool.getConnection();
  const createdPresences = [];

  try {
    await connection.beginTransaction();

    for (const membreId of membreIds) {
      // Vérifier que le membre existe
      const [membre] = await connection.query(
        'SELECT id FROM membres WHERE id = ? AND dahira_id = ?',
        [membreId, dahiraId]
      );

      if (membre.length === 0) {
        throw new Error(`Membre ${membreId} non trouvé`);
      }

      // Vérifier si existe déjà
      const [existing] = await connection.query(
        'SELECT id FROM presences WHERE seance_id = ? AND membre_id = ?',
        [seanceId, membreId]
      );

      if (existing.length === 0) {
        const [result] = await connection.query(
          `INSERT INTO presences (seance_id, membre_id, dahira_id, enregistre_par, present)
           VALUES (?, ?, ?, ?, TRUE)`,
          [seanceId, membreId, dahiraId, enregistrePar]
        );

        const [presence] = await connection.query(
          'SELECT * FROM presences WHERE id = ?',
          [result.insertId]
        );

        createdPresences.push(presence[0]);
      }
    }

    await connection.commit();

    return {
      count: createdPresences.length,
      presences: createdPresences
    };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

/**
 * Récupérer les présences d'une séance
 */
const getPresencesSeance = async (seanceId, dahiraId) => {
  const [presences] = await pool.query(
    `SELECT p.*, m.nom, m.prenom, m.photo_url, m.thumbnail_url, u.nom as enregistre_par_nom
     FROM presences p
     JOIN membres m ON p.membre_id = m.id
     LEFT JOIN users u ON p.enregistre_par = u.id
     WHERE p.seance_id = ? AND p.dahira_id = ?
     ORDER BY m.nom, m.prenom`,
    [seanceId, dahiraId]
  );

  return presences;
};

/**
 * Récupérer les statistiques de présence d'un membre
 */
const getStatistiquesMembre = async (membreId, dahiraId) => {
  // Total de séances
  const [totalSeances] = await pool.query(
    'SELECT COUNT(*) as total FROM seances WHERE dahira_id = ? AND date_seance <= NOW()',
    [dahiraId]
  );

  // Présences du membre
  const [presences] = await pool.query(
    `SELECT COUNT(*) as total, 
     SUM(CASE WHEN present = TRUE THEN 1 ELSE 0 END) as presents,
     SUM(CASE WHEN present = FALSE THEN 1 ELSE 0 END) as absents
     FROM presences
     WHERE membre_id = ? AND dahira_id = ?`,
    [membreId, dahiraId]
  );

  const total = totalSeances[0].total;
  const presents = presences[0].presents || 0;
  const absents = presences[0].absents || 0;
  const nonEnregistres = total - presents - absents;

  const tauxPresence = total > 0 ? ((presents / total) * 100).toFixed(2) : 0;

  return {
    total_seances: total,
    presents,
    absents,
    non_enregistres: nonEnregistres,
    taux_presence: parseFloat(tauxPresence)
  };
};

/**
 * Récupérer les statistiques globales de présence
 */
const getStatistiquesGlobales = async (dahiraId, seanceId = null) => {
  let query = `
    SELECT 
      COUNT(DISTINCT s.id) as total_seances,
      COUNT(p.id) as total_presences,
      COUNT(DISTINCT p.membre_id) as membres_distincts,
      AVG(CASE WHEN p.present = TRUE THEN 1 ELSE 0 END) * 100 as taux_moyen
    FROM seances s
    LEFT JOIN presences p ON s.id = p.seance_id
    WHERE s.dahira_id = ?
  `;

  const params = [dahiraId];

  if (seanceId) {
    query += ' AND s.id = ?';
    params.push(seanceId);
  }

  const [stats] = await pool.query(query, params);

  return {
    total_seances: stats[0].total_seances,
    total_presences: stats[0].total_presences,
    membres_distincts: stats[0].membres_distincts,
    taux_moyen: parseFloat((stats[0].taux_moyen || 0).toFixed(2))
  };
};

/**
 * Marquer une absence
 */
const marquerAbsence = async (seanceId, membreId, dahiraId, enregistrePar) => {
  // Vérifier que la séance et le membre existent
  const [seance] = await pool.query(
    'SELECT id FROM seances WHERE id = ? AND dahira_id = ?',
    [seanceId, dahiraId]
  );

  if (seance.length === 0) {
    throw new Error('Séance non trouvée');
  }

  const [membre] = await pool.query(
    'SELECT id FROM membres WHERE id = ? AND dahira_id = ?',
    [membreId, dahiraId]
  );

  if (membre.length === 0) {
    throw new Error('Membre non trouvé');
  }

  // Vérifier si une présence existe déjà
  const [existing] = await pool.query(
    'SELECT id FROM presences WHERE seance_id = ? AND membre_id = ?',
    [seanceId, membreId]
  );

  if (existing.length > 0) {
    // Mettre à jour
    await pool.query(
      'UPDATE presences SET present = FALSE WHERE id = ?',
      [existing[0].id]
    );

    const [presence] = await pool.query(
      'SELECT * FROM presences WHERE id = ?',
      [existing[0].id]
    );

    return presence[0];
  } else {
    // Créer une nouvelle entrée avec absent
    const [result] = await pool.query(
      `INSERT INTO presences (seance_id, membre_id, dahira_id, enregistre_par, present)
       VALUES (?, ?, ?, ?, FALSE)`,
      [seanceId, membreId, dahiraId, enregistrePar]
    );

    const [presence] = await pool.query(
      'SELECT * FROM presences WHERE id = ?',
      [result.insertId]
    );

    return presence[0];
  }
};

/**
 * Supprimer une présence
 */
const supprimerPresence = async (presenceId, dahiraId) => {
  const [result] = await pool.query(
    'DELETE FROM presences WHERE id = ? AND dahira_id = ?',
    [presenceId, dahiraId]
  );

  if (result.affectedRows === 0) {
    throw new Error('Présence non trouvée');
  }

  return {
    message: 'Présence supprimée avec succès'
  };
};

/**
 * Générer une feuille de présence pour export
 */
const genererFeuillePresence = async (seanceId, dahiraId) => {
  // Informations de la séance
  const [seance] = await pool.query(
    `SELECT s.*, d.nom as dahira_nom
     FROM seances s
     JOIN dahiras d ON s.dahira_id = d.id
     WHERE s.id = ? AND s.dahira_id = ?`,
    [seanceId, dahiraId]
  );

  if (seance.length === 0) {
    throw new Error('Séance non trouvée');
  }

  // Liste de tous les membres actifs
  const [membres] = await pool.query(
    'SELECT id, nom, prenom, photo_url, thumbnail_url FROM membres WHERE dahira_id = ? AND actif = TRUE ORDER BY nom, prenom',
    [dahiraId]
  );

  // Présences enregistrées
  const [presences] = await pool.query(
    'SELECT membre_id, present FROM presences WHERE seance_id = ?',
    [seanceId]
  );

  const presencesMap = {};
  presences.forEach(p => {
    presencesMap[p.membre_id] = p.present;
  });

  // Fusionner les données
  const feuille = membres.map(m => ({
    membre_id: m.id,
    nom: m.nom,
    prenom: m.prenom,
    photo_url: m.photo_url,
    thumbnail_url: m.thumbnail_url,
    statut: presencesMap[m.id] === true ? 'present' : presencesMap[m.id] === false ? 'absent' : 'non_enregistre'
  }));

  return {
    seance: seance[0],
    membres: feuille,
    statistiques: {
      total: membres.length,
      presents: feuille.filter(m => m.statut === 'present').length,
      absents: feuille.filter(m => m.statut === 'absent').length,
      non_enregistres: feuille.filter(m => m.statut === 'non_enregistre').length
    }
  };
};

module.exports = {
  enregistrerPresence,
  enregistrerPresencesBatch,
  getPresencesSeance,
  getStatistiquesMembre,
  getStatistiquesGlobales,
  marquerAbsence,
  supprimerPresence,
  genererFeuillePresence
};
