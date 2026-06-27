// Point d'entrée - démarre le serveur
const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur démarré sur le port ${PORT} (réseau local accessible)`);
});

// Gestion d'erreurs au démarrage du serveur
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Le port ${PORT} est déjà utilisé`);
  } else {
    console.error('Erreur du serveur:', error);
  }
  process.exit(1);
});

// Arrêt gracieux du serveur
process.on('SIGTERM', () => {
  console.log('SIGTERM reçu, arrêt du serveur...');
  server.close(() => {
    console.log('Serveur arrêté');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT reçu, arrêt du serveur...');
  server.close(() => {
    console.log('Serveur arrêté');
    process.exit(0);
  });
});
