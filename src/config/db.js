// Connexion MySQL avec pool (mysql2/promise)
// Lit les variables d'environnement via dotenv

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Vérification de la connexion au démarrage
pool.getConnection()
  .then(connection => {
    console.log('Connexion à la base de données réussie');
    connection.release();
  })
  .catch(error => {
    console.error('Erreur de connexion à la base de données:', error.message);
    process.exit(1);
  });

// Gestion des erreurs de connexion du pool
pool.on('connection', (connection) => {
  console.log('Nouvelle connexion MySQL établie');
});

pool.on('error', (error) => {
  console.error('Erreur du pool de connexions MySQL:', error.message);
  if (error.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Connexion à la base de données perdue');
  }
});

module.exports = pool;
