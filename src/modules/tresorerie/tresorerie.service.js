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

    // Dates métier : created_at pour les cotisations (date d'encaissement),
    // date_depense pour les dépenses (cohérent avec le rapport mensuel).
    const entreeConds = ['c.dahira_id = ?', "c.statut = 'approved'"];
    const entreeParams = [dahiraId];
    const sortieConds = ['dahira_id = ?', "statut = 'validee'"];
    const sortieParams = [dahiraId];

    if (mode_paiement) {
      entreeConds.push('c.mode_paiement = ?');
      entreeParams.push(mode_paiement);
      sortieConds.push('mode_paiement = ?');
      sortieParams.push(mode_paiement);
    }
    if (date_debut) {
      entreeConds.push('c.created_at >= ?');
      entreeParams.push(date_debut);
      sortieConds.push('date_depense >= ?');
      sortieParams.push(date_debut);
    }
    if (date_fin) {
      // borne de fin inclusive (jour entier)
      entreeConds.push('c.created_at < DATE_ADD(?, INTERVAL 1 DAY)');
      entreeParams.push(date_fin);
      sortieConds.push('date_depense < DATE_ADD(?, INTERVAL 1 DAY)');
      sortieParams.push(date_fin);
    }

    const selectEntrees = `
        SELECT 'entree' as type, c.id, c.montant, c.mode_paiement, c.created_at as date,
              'Cotisation' as description, c.membre_id, c.seance_id,
              CONCAT(m.prenom, ' ', m.nom) as membre_nom
        FROM cotisations c
        LEFT JOIN membres m ON m.id = c.membre_id
        WHERE ${entreeConds.join(' AND ')}
      `;
    const selectSorties = `
        SELECT 'sortie' as type, id, montant, mode_paiement, date_depense as date,
              description, NULL as membre_id, NULL as seance_id,
              NULL as membre_nom
        FROM depenses
        WHERE ${sortieConds.join(' AND ')}
      `;

    let query;
    let params;

    if (type === 'sortie') {
      query = selectSorties;
      params = sortieParams;
    } else if (type === 'entree') {
      query = selectEntrees;
      params = entreeParams;
    } else {
      query = `${selectEntrees} UNION ALL ${selectSorties}`;
      params = [...entreeParams, ...sortieParams];
    }

    query += ' ORDER BY date DESC';

    if (limit) {
      query += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);
    }

    const [transactions] = await pool.query(query, params);
    return transactions;
  };

  /**
   * Évolution de la trésorerie sur une période.
   * Pour `mois` : renvoie toujours les 12 derniers mois calendaires (mois
   * courant inclus), les mois sans activité à zéro — le graphique et les KPI
   * « mois en cours » du frontend s'appuient sur cette continuité.
   */
  const getEvolution = async (dahiraId, periode = 'mois') => {
    if (periode !== 'jour' && periode !== 'semaine') {
      const moisListe = [];
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        moisListe.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
      }
      const debut = `${moisListe[0]}-01`;

      const [entrees] = await pool.query(
        `SELECT DATE_FORMAT(created_at, '%Y-%m') as periode, SUM(montant) as montant
        FROM cotisations
        WHERE dahira_id = ? AND statut = 'approved' AND created_at >= ?
        GROUP BY periode`,
        [dahiraId, debut]
      );

      const [sorties] = await pool.query(
        `SELECT DATE_FORMAT(date_depense, '%Y-%m') as periode, SUM(montant) as montant
        FROM depenses
        WHERE dahira_id = ? AND statut = 'validee' AND date_depense >= ?
        GROUP BY periode`,
        [dahiraId, debut]
      );

      const periodesMap = {};
      moisListe.forEach(m => {
        periodesMap[m] = { periode: m, entrees: 0, sorties: 0 };
      });
      entrees.forEach(e => {
        if (periodesMap[e.periode]) periodesMap[e.periode].entrees = parseFloat(e.montant || 0);
      });
      sorties.forEach(s => {
        if (periodesMap[s.periode]) periodesMap[s.periode].sorties = parseFloat(s.montant || 0);
      });

      return moisListe.map(m => ({
        ...periodesMap[m],
        solde: periodesMap[m].entrees - periodesMap[m].sorties
      }));
    }

    // jour / semaine : uniquement les périodes ayant des transactions
    const groupByEntrees = periode === 'jour' ? 'DATE(created_at)' : 'YEARWEEK(created_at)';
    const groupBySorties = periode === 'jour' ? 'DATE(date_depense)' : 'YEARWEEK(date_depense)';
    const dateFormat = periode === 'jour' ? '%Y-%m-%d' : '%Y-W%v';

    const [entrees] = await pool.query(
      `SELECT DATE_FORMAT(created_at, ?) as periode, SUM(montant) as montant
      FROM cotisations
      WHERE dahira_id = ? AND statut = 'approved'
      GROUP BY ${groupByEntrees}
      ORDER BY periode DESC
      LIMIT 12`,
      [dateFormat, dahiraId]
    );

    const [sorties] = await pool.query(
      `SELECT DATE_FORMAT(date_depense, ?) as periode, SUM(montant) as montant
      FROM depenses
      WHERE dahira_id = ? AND statut = 'validee'
      GROUP BY ${groupBySorties}
      ORDER BY periode DESC
      LIMIT 12`,
      [dateFormat, dahiraId]
    );

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
    // Calculer les moyennes mensuelles sur les 6 derniers mois.
    // On agrège d'abord entrées et sorties par mois (GROUP BY mois) avant la
    // moyenne, sinon les lignes à zéro de l'UNION diluent les deux moyennes.
    const [moyennes] = await pool.query(
      `SELECT
        AVG(entrees) as moy_entrees,
        AVG(sorties) as moy_sorties
      FROM (
        SELECT mois, SUM(entrees) as entrees, SUM(sorties) as sorties
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
            DATE_FORMAT(date_depense, '%Y-%m') as mois,
            0 as entrees,
            SUM(montant) as sorties
          FROM depenses
          WHERE dahira_id = ? AND statut = 'validee'
          AND date_depense >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
          GROUP BY DATE_FORMAT(date_depense, '%Y-%m')
        ) as flux
        GROUP BY mois
      ) as stats`,
      [dahiraId, dahiraId]
    );

    const moyEntrees = parseFloat(moyennes[0].moy_entrees) || 0;
    const moySorties = parseFloat(moyennes[0].moy_sorties) || 0;
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

    // Alerte solde faible (une seule alerte, la plus grave)
    if (solde.solde_global < 20000) {
      alertes.push({
        type: 'danger',
        message: 'Solde global critique (< 20 000 FCFA)',
        priorite: 'high'
      });
    } else if (solde.solde_global < 50000) {
      alertes.push({
        type: 'warning',
        message: 'Solde global faible (< 50 000 FCFA)',
        priorite: 'medium'
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
    const tendanceNegative =
      derniersMois.length === 3 && derniersMois.every(m => m.solde < 0);

    if (tendanceNegative) {
      alertes.push({
        type: 'warning',
        message: 'Tendance négative sur les 3 derniers mois',
        priorite: 'medium'
      });
    }

    return alertes;
  };

  const getRapportMensuel = async (dahiraId, mois) => {
    const [[dahira]] = await pool.query('SELECT nom FROM dahiras WHERE id = ?', [dahiraId]);

    const [cotisations] = await pool.query(
      `SELECT m.nom, m.prenom, s.date_seance, c.montant, c.mode_paiement
       FROM cotisations c
       JOIN membres m ON c.membre_id = m.id
       JOIN seances s  ON c.seance_id  = s.id
       WHERE c.dahira_id = ? AND c.statut = 'approved'
         AND DATE_FORMAT(c.created_at, '%Y-%m') = ?
       ORDER BY c.created_at ASC`,
      [dahiraId, mois]
    );

    const [depenses] = await pool.query(
      `SELECT d.description, d.categorie, d.montant, d.date_depense
       FROM depenses d
       WHERE d.dahira_id = ? AND d.statut = 'validee'
         AND DATE_FORMAT(d.date_depense, '%Y-%m') = ?
       ORDER BY d.date_depense ASC`,
      [dahiraId, mois]
    );

    const totalCotisations = cotisations.reduce((s, c) => s + Number(c.montant), 0);
    const totalDepenses    = depenses.reduce((s, d) => s + Number(d.montant), 0);

    return {
      dahiraNom: dahira?.nom ?? 'Dahira',
      mois,
      cotisations,
      depenses,
      totalCotisations,
      totalDepenses,
      soldeNet: totalCotisations - totalDepenses
    };
  };

  module.exports = {
    getSolde,
    getTransactions,
    getEvolution,
    getPrevisions,
    getAlertes,
    getRapportMensuel
  };
