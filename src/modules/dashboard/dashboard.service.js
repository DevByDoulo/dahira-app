const pool = require('../../config/db');
const { getSolde, getEvolution } = require('../tresorerie/tresorerie.service');

/**
 * Dashboard principal avec toutes les statistiques clés
 */
const getDashboardStats = async (dahiraId) => {
  // Statistiques membres
  const [membresStats] = await pool.query(
    `SELECT 
       COUNT(*) as total,
       SUM(CASE WHEN actif = TRUE THEN 1 ELSE 0 END) as actifs,
       SUM(CASE WHEN actif = FALSE THEN 1 ELSE 0 END) as inactifs
     FROM membres
     WHERE dahira_id = ?`,
    [dahiraId]
  );

  // Nouveaux membres ce mois
  const [nouveauxMembres] = await pool.query(
    `SELECT COUNT(*) as count
     FROM membres
     WHERE dahira_id = ? AND DATE_FORMAT(created_at, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')`,
    [dahiraId]
  );

  // Statistiques cotisations du mois en cours
  const [cotisationsStats] = await pool.query(
    `SELECT
       COUNT(*) as total,
       SUM(montant) as montant_total,
       SUM(CASE WHEN statut = 'pending' THEN 1 ELSE 0 END) as en_attente,
       SUM(CASE WHEN statut = 'approved' THEN 1 ELSE 0 END) as approuvees
     FROM cotisations
     WHERE dahira_id = ?
       AND YEAR(created_at) = YEAR(NOW())
       AND MONTH(created_at) = MONTH(NOW())`,
    [dahiraId]
  );

  // Membres à jour vs en retard ce mois
  const [cotisationsAJour] = await pool.query(
    `SELECT COUNT(DISTINCT membre_id) as count
     FROM cotisations
     WHERE dahira_id = ? AND statut = 'approved'
       AND YEAR(created_at) = YEAR(NOW())
       AND MONTH(created_at) = MONTH(NOW())`,
    [dahiraId]
  );

  const membresAJour = cotisationsAJour[0].count;
  const membresEnRetard = membresStats[0].actifs - membresAJour;

  // Prochaine séance
  const [prochaineSeance] = await pool.query(
    `SELECT id, type, date_seance
     FROM seances
     WHERE dahira_id = ? AND date_seance >= CURDATE()
     ORDER BY date_seance ASC
     LIMIT 1`,
    [dahiraId]
  );

  // Dernière séance
  const [derniereSeance] = await pool.query(
    `SELECT id, type, date_seance
     FROM seances
     WHERE dahira_id = ? AND date_seance < NOW()
     ORDER BY date_seance DESC
     LIMIT 1`,
    [dahiraId]
  );

  // Invitations en attente
  const [invitations] = await pool.query(
    `SELECT COUNT(*) as count
     FROM invitations
     WHERE dahira_id = ? AND statut = 'pending' AND expires_at > NOW()`,
    [dahiraId]
  );

  // Trésorerie
  const tresorerie = await getSolde(dahiraId);

  // Top 5 contributeurs du mois
  const [topContributeurs] = await pool.query(
    `SELECT m.id, m.nom, m.prenom, m.photo_url,
            COUNT(c.id) as nb_cotisations,
            SUM(c.montant) as total_montant
     FROM membres m
     JOIN cotisations c ON m.id = c.membre_id
     WHERE c.dahira_id = ? AND c.statut = 'approved'
     AND DATE_FORMAT(c.created_at, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')
     GROUP BY m.id, m.nom, m.prenom, m.photo_url
     ORDER BY total_montant DESC
     LIMIT 5`,
    [dahiraId]
  );

  return {
    membres: {
      total: membresStats[0].total,
      actifs: membresStats[0].actifs,
      inactifs: membresStats[0].inactifs,
      nouveaux_ce_mois: nouveauxMembres[0].count
    },
    cotisations: {
      total_mois: cotisationsStats[0].total || 0,
      montant_total_mois: cotisationsStats[0].montant_total || 0,
      en_attente: cotisationsStats[0].en_attente || 0,
      approuvees: cotisationsStats[0].approuvees || 0,
      membres_a_jour: membresAJour,
      membres_en_retard: membresEnRetard,
      taux_a_jour: membresStats[0].actifs > 0 
        ? ((membresAJour / membresStats[0].actifs) * 100).toFixed(1)
        : 0
    },
    tresorerie: {
      solde_global: tresorerie.solde_global,
      entrees_total: tresorerie.entrees.total,
      sorties_total: tresorerie.sorties.total,
      soldes_par_mode: tresorerie.soldes_par_mode
    },
    seances: {
      prochaine: prochaineSeance[0] || null,
      derniere: derniereSeance[0] || null
    },
    invitations_en_attente: invitations[0].count,
    top_contributeurs: topContributeurs
  };
};

/**
 * Graphiques pour le dashboard
 */
const getDashboardCharts = async (dahiraId) => {
  // Évolution trésorerie sur 12 mois
  const evolutionTresorerie = await getEvolution(dahiraId, 'mois');

  // Évolution des cotisations sur 12 mois
  const [evolutionCotisations] = await pool.query(
    `SELECT
       DATE_FORMAT(created_at, '%Y-%m') as mois,
       COUNT(*) as nombre,
       SUM(montant) as montant
     FROM cotisations
     WHERE dahira_id = ? AND statut = 'approved'
     AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
     GROUP BY DATE_FORMAT(created_at, '%Y-%m')
     ORDER BY mois ASC`,
    [dahiraId]
  );

  // Répartition des cotisations par mode de paiement (ce mois)
  const [repartitionPaiement] = await pool.query(
    `SELECT 
       mode_paiement,
       COUNT(*) as nombre,
       SUM(montant) as montant
     FROM cotisations
     WHERE dahira_id = ? AND statut = 'approved'
     AND DATE_FORMAT(created_at, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')
     GROUP BY mode_paiement`,
    [dahiraId]
  );

  // 5 dernières séances
  const [dernieresSeances] = await pool.query(
    `SELECT id, type, date_seance, lieu, theme
     FROM seances
     WHERE dahira_id = ? AND date_seance < NOW()
     ORDER BY date_seance DESC
     LIMIT 5`,
    [dahiraId]
  );

  return {
    evolution_tresorerie: evolutionTresorerie,
    evolution_cotisations: evolutionCotisations,
    repartition_paiement: repartitionPaiement,
    dernieres_seances: dernieresSeances.reverse()
  };
};

/**
 * Activité récente pour le dashboard
 */
const getRecentActivity = async (dahiraId, limit = 10) => {
  const activities = [];

  // Cotisations récentes
  const [cotisations] = await pool.query(
    `SELECT 'cotisation' as type, c.id, c.created_at, c.montant,
            m.nom, m.prenom, m.photo_url
     FROM cotisations c
     JOIN membres m ON c.membre_id = m.id
     WHERE c.dahira_id = ? AND c.statut = 'approved'
     ORDER BY c.created_at DESC
     LIMIT 5`,
    [dahiraId]
  );

  // Nouveaux membres
  const [nouveauxMembres] = await pool.query(
    `SELECT 'nouveau_membre' as type, id, created_at, nom, prenom, photo_url
     FROM membres
     WHERE dahira_id = ?
     ORDER BY created_at DESC
     LIMIT 5`,
    [dahiraId]
  );

  // Fusionner et trier
  activities.push(...cotisations, ...nouveauxMembres);
  activities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return activities.slice(0, limit);
};

/**
 * Statistiques comparatives (mois en cours vs mois précédent)
 */
const getComparativeStats = async (dahiraId) => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthStr = lastMonth.toISOString().slice(0, 7);

  // Cotisations
  const [cotisationsCurrent] = await pool.query(
    `SELECT COUNT(*) as count, SUM(montant) as montant FROM cotisations WHERE dahira_id = ? AND statut = 'approved' AND DATE_FORMAT(created_at, '%Y-%m') = ?`,
    [dahiraId, currentMonth]
  );

  const [cotisationsLast] = await pool.query(
    `SELECT COUNT(*) as count, SUM(montant) as montant FROM cotisations WHERE dahira_id = ? AND statut = 'approved' AND DATE_FORMAT(created_at, '%Y-%m') = ?`,
    [dahiraId, lastMonthStr]
  );

  const cotisationsEvolution = {
    nombre: {
      actuel: cotisationsCurrent[0].count || 0,
      precedent: cotisationsLast[0].count || 0,
      evolution: cotisationsLast[0].count > 0 
        ? (((cotisationsCurrent[0].count - cotisationsLast[0].count) / cotisationsLast[0].count) * 100).toFixed(1)
        : 0
    },
    montant: {
      actuel: cotisationsCurrent[0].montant || 0,
      precedent: cotisationsLast[0].montant || 0,
      evolution: cotisationsLast[0].montant > 0 
        ? (((cotisationsCurrent[0].montant - cotisationsLast[0].montant) / cotisationsLast[0].montant) * 100).toFixed(1)
        : 0
    }
  };

  // Nouveaux membres
  const [membresCurrent] = await pool.query(
    `SELECT COUNT(*) as count FROM membres WHERE dahira_id = ? AND DATE_FORMAT(created_at, '%Y-%m') = ?`,
    [dahiraId, currentMonth]
  );

  const [membresLast] = await pool.query(
    `SELECT COUNT(*) as count FROM membres WHERE dahira_id = ? AND DATE_FORMAT(created_at, '%Y-%m') = ?`,
    [dahiraId, lastMonthStr]
  );

  const membresEvolution = {
    actuel: membresCurrent[0].count,
    precedent: membresLast[0].count,
    evolution: membresLast[0].count > 0 
      ? (((membresCurrent[0].count - membresLast[0].count) / membresLast[0].count) * 100).toFixed(1)
      : 0
  };

  return {
    cotisations: cotisationsEvolution,
    nouveaux_membres: membresEvolution
  };
};

module.exports = {
  getDashboardStats,
  getDashboardCharts,
  getRecentActivity,
  getComparativeStats
};
