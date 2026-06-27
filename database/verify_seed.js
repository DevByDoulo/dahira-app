require('dotenv').config();
const pool = require('../src/config/db');

async function verify() {
  const dahiraId = 1;

  const checks = [
    ['Membres',     'SELECT COUNT(*) AS n FROM membres WHERE dahira_id = ?', [dahiraId]],
    ['Séances',     'SELECT COUNT(*) AS n FROM seances WHERE dahira_id = ?', [dahiraId]],
    ['Cotisations', 'SELECT COUNT(*) AS n FROM cotisations WHERE dahira_id = ?', [dahiraId]],
    ['Dépenses',    'SELECT COUNT(*) AS n FROM depenses WHERE dahira_id = ?', [dahiraId]],
    ['Annonces',    'SELECT COUNT(*) AS n FROM annonces WHERE dahira_id = ?', [dahiraId]],
    ['Événements',  'SELECT COUNT(*) AS n FROM evenements WHERE dahira_id = ?', [dahiraId]],
    ['Participations', 'SELECT COUNT(*) AS n FROM participations WHERE dahira_id = ?', [dahiraId]],
    ['Notifications', 'SELECT COUNT(*) AS n FROM notifications WHERE dahira_id = ?', [dahiraId]],
  ];

  console.log('\n═══════ Contenu de la base ═══════');
  for (const [label, sql, params] of checks) {
    const [[row]] = await pool.query(sql, params);
    console.log(`  ${label.padEnd(15)}: ${row.n}`);
  }

  // Détail dépenses
  const [deps] = await pool.query(
    'SELECT description, montant, statut FROM depenses WHERE dahira_id = ? LIMIT 5', [dahiraId]
  );
  console.log('\n5 premières dépenses :');
  deps.forEach(d => console.log(`  [${d.statut}] ${d.description} — ${d.montant} FCFA`));

  // Cotisations par statut
  const [cotisStats] = await pool.query(
    'SELECT statut, COUNT(*) AS n, SUM(montant) AS total FROM cotisations WHERE dahira_id = ? GROUP BY statut', [dahiraId]
  );
  console.log('\nCotisations par statut :');
  cotisStats.forEach(s => console.log(`  ${s.statut}: ${s.n} (${(s.total/1000).toFixed(0)} 000 FCFA)`));

  console.log('\n✅ Vérification terminée\n');
  process.exit(0);
}

verify().catch(e => { console.error('❌', e.message); process.exit(1); });
