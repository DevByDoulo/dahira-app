/**
 * Script de création du premier compte Super Admin.
 * Exécuter une seule fois : node database/seeds/create-super-admin.js
 */
require('dotenv').config();
const pool = require('../../src/config/db');
const bcrypt = require('bcrypt');

const TELEPHONE = '000000000';
const PASSWORD  = 'SuperAdmin2024!';
const NOM       = 'Super Admin';
const EMAIL     = 'superadmin@dahira.app';

(async () => {
  try {
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE telephone = ? OR role = 'super_admin'",
      [TELEPHONE]
    );

    if (existing.length > 0) {
      console.log('⚠️  Un compte super_admin existe déjà.');
      process.exit(0);
    }

    const hash = await bcrypt.hash(PASSWORD, 10);
    await pool.query(
      `INSERT INTO users (dahira_id, nom, telephone, email, password_hash, role, actif)
       VALUES (NULL, ?, ?, ?, ?, 'super_admin', TRUE)`,
      [NOM, TELEPHONE, EMAIL, hash]
    );

    console.log('✅ Compte Super Admin créé avec succès.');
    console.log(`   Téléphone : ${TELEPHONE}`);
    console.log(`   Mot de passe : ${PASSWORD}`);
    console.log('   ⚠️  CHANGEZ le mot de passe après la première connexion !');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur :', err.message);
    process.exit(1);
  }
})();
