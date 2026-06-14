  const pool = require('../../config/db');

  /**
   * Calculer le solde actuel de la trésorerie
   */
  const getSolde = async (dahiraId) => {
    // Total des entrées (cotisations approuvées)
    const [entrees] = await pool.query(
      `SELECT 
        SUM(montant) as total,
        SUM(CASE WHEN mode_paiement = 'especes' THEN montant ELSE 0 END) as especes,
        SUM(CASE WHEN mode_paiement = 'wave' THEN montant ELSE 0 END) as wave,
        SUM(CASE WHEN mode_paiement = 'orange_money' THEN montant ELSE 0 END) as orange_money
      FROM cotisations
      WHERE dahira_id = ? AND statut = 'approved'`,
      [dahiraId]
    );

    // Total des sorties (dépenses validées)
    const [sorties] = await pool.query(
      `SELECT 
        SUM(montant) as total,
        SUM(CASE WHEN mode_paiement = 'especes' THEN montant ELSE 0 END) as especes,
        SUM(CASE WHEN mode_paiement = 'wave' THEN montant ELSE 0 END) as wave,
        SUM(CASE WHEN mode_paiement = 'orange_money' THEN montant ELSE 0 END) as orange_money
      FROM depenses
      WHERE dahira_id = ? AND statut = 'validee'`,
      [dahiraId]
    );

    const entreesTotal = entrees[0].total || 0;
    const sortiesTotal = sorties[0].total || 0;

    return {
      solde_global: entreesTotal - sortiesTotal,
      entrees: {
        total: entreesTotal,
        especes: entrees[0].especes || 0,
        wave: entrees[0].wave || 0,
        orange_money: entrees[0].orange_money || 0
      },
      sorties: {
        total: sortiesTotal,
        especes: sorties[0].especes || 0,
        wave: sorties[0].wave || 0,
        orange_money: sorties[0].orange_money || 0
      },
      soldes_par_mode: {
        especes: (entrees[0].especes || 0) - (sorties[0].especes || 0),
        wave: (entrees[0].wave || 0) - (sorties[0].wave || 0),
        orange_money: (entrees[0].orange_money || 0) - (sorties[0].orange_money || 0)
      }
    };
  };

  /**
   * Récupérer l'historique des transactions
   */
  const getTransactions = async (dahiraId, filters = {}) => {
    const { type, mode_paiement, date_debut, date_fin, limit = 50, offset = 0 } = filters;

    let query = `
      SELECT 'entree' as type, id, montant, mode_paiement, created_at as date, 
            'Cotisation' as description, membre_id, seance_id
      FROM cotisations
      WHERE dahira_id = ? AND statut = 'approved'
    `;

    let params = [dahiraId];

    if (type === 'sortie' || !type) {
      query += `
        UNION ALL
        SELECT 'sortie' as type, id, montant, mode_paiement, created_at as date,
              description, NULL as membre_id, NULL as seance_id
        FROM depenses
        WHERE dahira_id = ? AND statut = 'validee'
      `;
      params.push(dahiraId);
    }

    query += ' ORDER BY date DESC';

    if (limit) {
      query += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);
    }

    const [transactions] = await pool.query(query, params);

    // Enrichir avec les noms
    for (const transaction of transactions) {
      if (transaction.membre_id) {
        const [membre] = await pool.query(
          'SELECT nom, prenom FROM membres WHERE id = ?',
          [transaction.membre_id]
        );
        if (membre.length > 0) {
          transaction.membre_nom = `${membre[0].prenom} ${membre[0].nom}`;
        }
      }
    }

    return transactions;
  };

  /**
   * Évolution de la trésorerie sur une période
   */
  const getEvolution = async (dahiraId, periode = 'mois') => {
    let groupBy = '';
    let dateFormat = '';

    if (periode === 'jour') {
      groupBy = 'DATE(created_at)';
      dateFormat = '%Y-%m-%d';
    } else if (periode === 'semaine') {
      groupBy = 'YEARWEEK(created_at)';
      dateFormat = '%Y-W%v';
    } else {
      groupBy = 'DATE_FORMAT(created_at, "%Y-%m")';
      dateFormat = '%Y-%m';
    }

    // Entrées par période
    const [entrees] = await pool.query(
      `SELECT DATE_FORMAT(created_at, ?) as periode, SUM(montant) as montant
      FROM cotisations
      WHERE dahira_id = ? AND statut = 'approved'
      GROUP BY ${groupBy}
      ORDER BY periode DESC
      LIMIT 12`,
      [dateFormat, dahiraId]
    );

    // Sorties par période
    const [sorties] = await pool.query(
      `SELECT DATE_FORMAT(created_at, ?) as periode, SUM(montant) as montant
      FROM depenses
      WHERE dahira_id = ? AND statut = 'validee'
      GROUP BY ${groupBy}
      ORDER BY periode DESC
      LIMIT 12`,
      [dateFormat, dahiraId]
    );

    // Fusionner les données
    const periodesMap = {};

    entrees.forEach(e => {
      if (!periodesMap[e.periode]) {
        periodesMap[e.periode] = { periode: e.periode, entrees: 0, sorties: 0 };
      }
      periodesMap[e.periode].entrees = parseFloat(e.montant || 0);
    });

    sorties.forEach(s => {
      if (!periodesMap[s.periode]) {
        periodesMap[s.periode] = { periode: s.periode, entrees: 0, sorties: 0 };
      }
      periodesMap[s.periode].sorties = parseFloat(s.montant || 0);
    });

    const evolution = Object.values(periodesMap).map(p => ({
      ...p,
      solde: p.entrees - p.sorties
    }));

    return evolution.sort((a, b) => a.periode.localeCompare(b.periode));
  };

  /**
   * Prévisions basées sur les moyennes
   */
  const getPrevisions = async (dahiraId, moisFuturs = 3) => {
    // Calculer les moyennes sur les 6 derniers mois
    const [moyennes] = await pool.query(
      `SELECT 
        AVG(entrees) as moy_entrees,
        AVG(sorties) as moy_sorties
      FROM (
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as mois,
          SUM(montant) as entrees,
          0 as sorties
        FROM cotisations
        WHERE dahira_id = ? AND statut = 'approved'
        AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        
        UNION ALL
        
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as mois,
          0 as entrees,
          SUM(montant) as sorties
        FROM depenses
        WHERE dahira_id = ? AND statut = 'validee'
        AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ) as stats`,
      [dahiraId, dahiraId]
    );

    const moyEntrees = moyennes[0].moy_entrees || 0;
    const moySorties = moyennes[0].moy_sorties || 0;
    const soldeActuel = await getSolde(dahiraId);

    const previsions = [];
    let soldeProjete = soldeActuel.solde_global;

    for (let i = 1; i <= moisFuturs; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      const mois = date.toISOString().slice(0, 7);

      soldeProjete += moyEntrees - moySorties;

      previsions.push({
        mois,
        entrees_prevues: Math.round(moyEntrees),
        sorties_prevues: Math.round(moySorties),
        solde_projete: Math.round(soldeProjete)
      });
    }

    return {
      solde_actuel: Math.round(soldeActuel.solde_global),
      moyenne_entrees: Math.round(moyEntrees),
      moyenne_sorties: Math.round(moySorties),
      previsions
    };
  };

  /**
   * Alertes trésorerie
   */
  const getAlertes = async (dahiraId) => {
    const solde = await getSolde(dahiraId);
    const alertes = [];

    // Alerte solde faible
    if (solde.solde_global < 50000) {
      alertes.push({
        type: 'warning',
        message: 'Solde global faible (< 50 000 FCFA)',
        priorite: 'medium'
      });
    }

    if (solde.solde_global < 20000) {
      alertes.push({
        type: 'danger',
        message: 'Solde global critique (< 20 000 FCFA)',
        priorite: 'high'
      });
    }

    // Alerte espèces négatives
    if (solde.soldes_par_mode.especes < 0) {
      alertes.push({
        type: 'danger',
        message: 'Solde espèces négatif - Vérifier la caisse',
        priorite: 'high'
      });
    }

    // Tendance négative sur 3 mois
    const evolution = await getEvolution(dahiraId, 'mois');
    const derniersMois = evolution.slice(-3);
    const tendanceNegative = derniersMois.every(m => m.solde < 0);

    if (tendanceNegative) {
      alertes.push({
        type: 'warning',
        message: 'Tendance négative sur les 3 derniers mois',
        priorite: 'medium'
      });
    }

    return alertes;
  };

  module.exports = {
    getSolde,
    getTransactions,
    getEvolution,
    getPrevisions,
    getAlertes
  };
