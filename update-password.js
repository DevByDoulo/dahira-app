const pool = require('./src/config/db');
const bcrypt = require('bcrypt');

async function updatePassword() {
  const hash = await bcrypt.hash('Dahira2025', 10);
  const verify = await bcrypt.compare('Dahira2025', hash);
  console.log('Hash:', hash);
  console.log('Vérification:', verify);
  await pool.query('UPDATE users SET password_hash = ? WHERE id = 1', [hash]);
  console.log('Mot de passe mis à jour');
  process.exit(0);
}

updatePassword().catch(console.error);