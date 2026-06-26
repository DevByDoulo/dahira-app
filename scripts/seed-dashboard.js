const pool = require('../src/config/db');

const seed = async () => {
  try {
    // ── Récupérer les ENUM valides pour seances.type ──────────────────────────
    const [[seanceTypeRow]] = await pool.query(
      `SELECT COLUMN_TYPE FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'seances' AND COLUMN_NAME = 'type'`
    );
    // COLUMN_TYPE ressemble à "enum('hebdomadaire','mensuelle','speciale',...)"
    const seanceTypeValues = seanceTypeRow.COLUMN_TYPE
      .replace(/^enum\(|\)$/g, '')
      .split(',')
      .map(v => v.replace(/'/g, ''));
    console.log('Valeurs ENUM seances.type :', seanceTypeValues);

    const typeA = seanceTypeValues[0] || 'hebdomadaire';
    const typeB = seanceTypeValues[1] || typeA;

    // ── Récupérer un user valide pour evenements.cree_par ─────────────────────
    const [[firstUser]] = await pool.query('SELECT id FROM users WHERE dahira_id = 1 LIMIT 1');
    if (!firstUser) {
      console.error('❌ Aucun utilisateur en dahira_id=1. Crée d\'abord un compte via POST /api/auth/register.');
      await pool.end();
      return;
    }
    const userId = firstUser.id;
    console.log(`✓ User id=${userId} utilisé pour cree_par`);

    // ── 5 Membres ─────────────────────────────────────────────────────────────
    const membres = [
      ['Diallo',  'Mamadou',  '771234567', null,        '2024-01-15', 'Président',  1],
      ['Ndiaye',  'Fatou',    '772345678', '769876543', '2024-02-20', 'Trésorière', 1],
      ['Sy',      'Ibrahima', '773456789', null,        '2024-03-10', 'Secrétaire', 1],
      ['Fall',    'Aïssatou', '774567890', null,        '2024-04-05', 'Membre',     1],
      ['Ba',      'Ousmane',  '775678901', '761234567', '2024-05-12', 'Membre',     1],
    ];

    const membreIds = [];
    for (const [nom, prenom, tel, tel2, date_adhesion, responsabilite, actif] of membres) {
      const [existing] = await pool.query(
        'SELECT id FROM membres WHERE dahira_id = 1 AND nom = ? AND prenom = ?',
        [nom, prenom]
      );
      if (existing.length > 0) {
        membreIds.push(existing[0].id);
        console.log(`  · Membre ${prenom} ${nom} existe déjà (id=${existing[0].id})`);
      } else {
        const [res] = await pool.query(
          `INSERT INTO membres
             (dahira_id, nom, prenom, telephone, telephone_secours, date_adhesion, responsabilite, actif)
           VALUES (1, ?, ?, ?, ?, ?, ?, ?)`,
          [nom, prenom, tel, tel2, date_adhesion, responsabilite, actif]
        );
        membreIds.push(res.insertId);
        console.log(`  · Membre ${prenom} ${nom} inséré (id=${res.insertId})`);
      }
    }
    console.log('✓ Membres OK');

    // ── 3 Séances ─────────────────────────────────────────────────────────────
    const seanceDates = [
      ['2026-05-10 14:00:00', typeA, 1],
      ['2026-05-24 14:00:00', typeB, 1],
      ['2026-06-07 14:00:00', typeA, 0],
    ];

    const seanceIds = [];
    for (const [date_seance, type, cloturee] of seanceDates) {
      const dateOnly = date_seance.slice(0, 10);
      const [existing] = await pool.query(
        'SELECT id FROM seances WHERE dahira_id = 1 AND DATE(date_seance) = ?',
        [dateOnly]
      );
      if (existing.length > 0) {
        seanceIds.push(existing[0].id);
        console.log(`  · Séance ${dateOnly} existe déjà (id=${existing[0].id})`);
      } else {
        const [res] = await pool.query(
          `INSERT INTO seances (dahira_id, date_seance, type, cloturee) VALUES (1, ?, ?, ?)`,
          [date_seance, type, cloturee]
        );
        seanceIds.push(res.insertId);
        console.log(`  · Séance ${dateOnly} [${type}] insérée (id=${res.insertId})`);
      }
    }
    console.log('✓ Séances OK');

    // ── 10 Cotisations approuvées ──────────────────────────────────────────────
    const cotisations = [
      [membreIds[0], seanceIds[0],  5000, 'especes'],
      [membreIds[1], seanceIds[0], 10000, 'wave'],
      [membreIds[2], seanceIds[0],  7500, 'orange_money'],
      [membreIds[3], seanceIds[1],  5000, 'especes'],
      [membreIds[4], seanceIds[1], 15000, 'wave'],
      [membreIds[0], seanceIds[2],  5000, 'especes'],
      [membreIds[1], seanceIds[2], 10000, 'orange_money'],
      [membreIds[2], seanceIds[2],  7500, 'wave'],
      [membreIds[3], seanceIds[2],  5000, 'especes'],
      [membreIds[4], seanceIds[2], 20000, 'wave'],
    ];

    for (const [membre_id, seance_id, montant, mode_paiement] of cotisations) {
      const [existing] = await pool.query(
        'SELECT id FROM cotisations WHERE dahira_id = 1 AND membre_id = ? AND seance_id = ? AND montant = ?',
        [membre_id, seance_id, montant]
      );
      if (existing.length > 0) {
        console.log(`  · Cotisation membre=${membre_id} séance=${seance_id} ${montant} FCFA existe déjà`);
      } else {
        await pool.query(
          `INSERT INTO cotisations (dahira_id, membre_id, seance_id, montant, mode_paiement, statut)
           VALUES (1, ?, ?, ?, ?, 'approved')`,
          [membre_id, seance_id, montant, mode_paiement]
        );
        console.log(`  · Cotisation ${montant} FCFA (${mode_paiement}) insérée`);
      }
    }
    console.log('✓ Cotisations OK');

    // ── 2 Événements à venir ──────────────────────────────────────────────────
    const evenements = [
      ['Assemblée Générale Mensuelle', 'Réunion mensuelle de tous les membres', '2026-07-15', '16:30:00', 'Siège Social, Dakar'],
      ['Dîner de Bienfaisance',        'Collecte de fonds annuelle',            '2026-07-22', '20:00:00', 'King Fahd Palace, Dakar'],
    ];

    for (const [titre, description, date_evenement, heure, lieu] of evenements) {
      const [existing] = await pool.query(
        'SELECT id FROM evenements WHERE dahira_id = 1 AND titre = ?',
        [titre]
      );
      if (existing.length > 0) {
        console.log(`  · Événement "${titre}" existe déjà`);
      } else {
        await pool.query(
          `INSERT INTO evenements (dahira_id, cree_par, titre, description, date_evenement, heure, lieu)
           VALUES (1, ?, ?, ?, ?, ?, ?)`,
          [userId, titre, description, date_evenement, heure, lieu]
        );
        console.log(`  · Événement "${titre}" inséré`);
      }
    }
    console.log('✓ Événements OK');

    console.log('\n✅ Seed terminé avec succès.');
  } catch (err) {
    console.error('❌ Erreur :', err.message);
  } finally {
    await pool.end();
  }
};

seed();
