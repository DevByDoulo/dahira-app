require('dotenv').config();
const mysql = require('mysql2/promise');

async function clean() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST, port: process.env.DB_PORT,
    user: process.env.DB_USER, password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const tables = ['notifications', 'participations', 'recus', 'cotisations', 'depenses', 'annonces', 'evenements', 'seances'];
  for (const t of tables) {
    await conn.execute('SET FOREIGN_KEY_CHECKS=0');
    await conn.execute('TRUNCATE TABLE ' + t);
    await conn.execute('SET FOREIGN_KEY_CHECKS=1');
    console.log('Nettoyé:', t);
  }

  // Supprimer membres ajoutés par seed (garder bureau, tresorier, super_admin)
  const [r] = await conn.execute(
    'DELETE FROM membres WHERE role = "membre" AND telephone LIKE "771000%"'
  );
  console.log('Membres de test supprimés:', r.affectedRows);

  await conn.end();
  console.log('✓ Base nettoyée');
}

clean().catch(e => { console.error(e.message); process.exit(1); });
