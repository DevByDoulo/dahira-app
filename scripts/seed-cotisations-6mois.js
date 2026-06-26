const pool = require('../src/config/db');

// Une séance par mois (support pour les cotisations)
const SEANCES_PAR_MOIS = [
  { date: '2026-01-10 14:00:00', type: 'hebdomadaire' },
  { date: '2026-02-07 14:00:00', type: 'hebdomadaire' },
  { date: '2026-03-07 14:00:00', type: 'hebdomadaire' },
  { date: '2026-04-04 14:00:00', type: 'hebdomadaire' },
  { date: '2026-05-10 14:00:00', type: 'hebdomadaire' }, // peut exister déjà
  { date: '2026-06-07 14:00:00', type: 'hebdomadaire' }, // peut exister déjà
];

// Cotisations variées jan–juin 2026 (mois déduit de la date)
const COTISATIONS = [
  // Janvier — total 22 500 FCFA
  { membre_id: 1, montant: 5000,  mode: 'especes',     date: '2026-01-10' },
  { membre_id: 2, montant: 10000, mode: 'wave',         date: '2026-01-10' },
  { membre_id: 3, montant: 7500,  mode: 'orange_money', date: '2026-01-10' },

  // Février — total 37 500 FCFA
  { membre_id: 1, montant: 5000,  mode: 'especes',     date: '2026-02-07' },
  { membre_id: 2, montant: 10000, mode: 'wave',         date: '2026-02-07' },
  { membre_id: 3, montant: 7500,  mode: 'orange_money', date: '2026-02-07' },
  { membre_id: 4, montant: 15000, mode: 'wave',         date: '2026-02-07' },

  // Mars — total 30 000 FCFA
  { membre_id: 1, montant: 5000,  mode: 'especes',     date: '2026-03-07' },
  { membre_id: 2, montant: 10000, mode: 'wave',         date: '2026-03-07' },
  { membre_id: 5, montant: 15000, mode: 'orange_money', date: '2026-03-07' },

  // Avril — total 52 500 FCFA
  { membre_id: 1, montant: 5000,  mode: 'especes',     date: '2026-04-04' },
  { membre_id: 2, montant: 10000, mode: 'wave',         date: '2026-04-04' },
  { membre_id: 3, montant: 7500,  mode: 'orange_money', date: '2026-04-04' },
  { membre_id: 4, montant: 15000, mode: 'wave',         date: '2026-04-04' },
  { membre_id: 5, montant: 15000, mode: 'especes',      date: '2026-04-04' },

  // Mai — total 55 000 FCFA
  { membre_id: 1, montant: 5000,  mode: 'especes',     date: '2026-05-10' },
  { membre_id: 2, montant: 10000, mode: 'wave',         date: '2026-05-10' },
  { membre_id: 3, montant: 7500,  mode: 'orange_money', date: '2026-05-10' },
  { membre_id: 4, montant: 12500, mode: 'wave',         date: '2026-05-10' },
  { membre_id: 5, montant: 20000, mode: 'wave',         date: '2026-05-10' },

  // Juin — total 47 500 FCFA
  { membre_id: 1, montant: 5000,  mode: 'especes',     date: '2026-06-07' },
  { membre_id: 2, montant: 10000, mode: 'orange_money', date: '2026-06-07' },
  { membre_id: 3, montant: 7500,  mode: 'wave',         date: '2026-06-07' },
  { membre_id: 4, montant: 5000,  mode: 'especes',      date: '2026-06-07' },
  { membre_id: 5, montant: 20000, mode: 'wave',         date: '2026-06-07' },
];

const seed = async () => {
  let inseres = 0;
  let ignores = 0;

  try {
    // ── 1. Créer une séance par mois si elle n'existe pas ────────────────────
    const seanceIdParDate = {};

    for (const s of SEANCES_PAR_MOIS) {
      const dateOnly = s.date.slice(0, 10);
      const [existing] = await pool.query(
        'SELECT id FROM seances WHERE dahira_id = 1 AND DATE(date_seance) = ?',
        [dateOnly]
      );
      if (existing.length > 0) {
        seanceIdParDate[dateOnly] = existing[0].id;
      } else {
        const [res] = await pool.query(
          'INSERT INTO seances (dahira_id, date_seance, type, cloturee) VALUES (1, ?, ?, 1)',
          [s.date, s.type]
        );
        seanceIdParDate[dateOnly] = res.insertId;
        console.log(`  · Séance ${dateOnly} créée (id=${res.insertId})`);
      }
    }

    // ── 2. Insérer les cotisations ────────────────────────────────────────────
    for (const row of COTISATIONS) {
      const seance_id = seanceIdParDate[row.date];
      const mois = row.date.slice(0, 7);

      const [existing] = await pool.query(
        `SELECT id FROM cotisations
         WHERE dahira_id = 1
           AND membre_id = ?
           AND seance_id = ?
           AND montant = ?`,
        [row.membre_id, seance_id, row.montant]
      );

      if (existing.length > 0) {
        ignores++;
        continue;
      }

      await pool.query(
        `INSERT INTO cotisations
           (dahira_id, membre_id, seance_id, montant, mode_paiement, statut, created_at)
         VALUES (1, ?, ?, ?, ?, 'approved', ?)`,
        [row.membre_id, seance_id, row.montant, row.mode, row.date]
      );
      inseres++;
    }

    // ── 3. Récapitulatif ──────────────────────────────────────────────────────
    const [totaux] = await pool.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') as mois,
              COUNT(*) as nb,
              SUM(montant) as total
       FROM cotisations
       WHERE dahira_id = 1 AND statut = 'approved'
         AND created_at BETWEEN '2026-01-01' AND '2026-12-31'
       GROUP BY mois
       ORDER BY mois`
    );

    console.log(`\n✅ ${inseres} cotisations insérées, ${ignores} ignorées\n`);
    console.log('Mois       Nb    Total FCFA   Graphe');
    console.log('─────────────────────────────────────────────');
    const maxTotal = Math.max(...totaux.map(r => Number(r.total)));
    for (const r of totaux) {
      const pct = Math.round((Number(r.total) / maxTotal) * 20);
      const bar = '█'.repeat(pct);
      console.log(
        `${r.mois}   ${String(r.nb).padStart(2)} cot.   ${String(Number(r.total)).padStart(8)} FCFA   ${bar}`
      );
    }
    console.log('─────────────────────────────────────────────');
  } catch (err) {
    console.error('❌ Erreur :', err.message);
  } finally {
    await pool.end();
  }
};

seed();
