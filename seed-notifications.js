/**
 * Script de seed : insère des notifications de test pour tous les utilisateurs actifs.
 * Usage : node seed-notifications.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function seed() {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  // Récupérer tous les utilisateurs actifs
  const [users] = await pool.query('SELECT id, dahira_id FROM users WHERE actif = TRUE LIMIT 10');

  if (users.length === 0) {
    console.log('Aucun utilisateur actif trouvé.');
    await pool.end();
    return;
  }

  const notifications = [
    {
      type: 'validation_cotisation',
      title: 'Cotisation Mensuelle Validée',
      message: 'Votre cotisation du mois de Juin 2026 (25 000 FCFA) a été enregistrée et validée par le bureau. Merci pour votre ponctualité.',
      link: '/cotisations',
      created_at: new Date(Date.now() - 1000 * 60 * 45), // il y a 45 min
    },
    {
      type: 'evenement_ajoute',
      title: 'Nouvel Événement : Assemblée Générale',
      message: "L'Assemblée Générale annuelle se tiendra le 28 juin 2026 à 15h au siège de la Dahira. Votre présence est vivement souhaitée.",
      link: '/evenements',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 3), // il y a 3h
    },
    {
      type: 'nouvelle_annonce',
      title: 'Annonce : Collecte de fonds spéciale',
      message: 'Le bureau lance une collecte de fonds pour la rénovation du local. Chaque membre est invité à contribuer selon ses moyens.',
      link: '/annonces',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24), // hier
    },
    {
      type: 'seance_rappel',
      title: 'Rappel : Séance hebdomadaire demain',
      message: "N'oubliez pas la séance de demain dimanche à 10h. Ordre du jour : lecture du Coran et bilan mensuel.",
      link: '/seances',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 48), // il y a 2 jours
      is_read: true,
    },
    {
      type: 'cotisation_retard',
      title: 'Cotisation en retard',
      message: "Votre cotisation du mois de Mai 2026 n'a pas encore été enregistrée. Veuillez régulariser votre situation auprès du trésorier.",
      link: '/cotisations',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 72), // il y a 3 jours
      is_read: true,
    },
    {
      type: 'message_bureau',
      title: 'Message du Bureau',
      message: 'Le bureau tient à remercier tous les membres pour leur engagement lors de la dernière collecte. Ensemble, nous avons réuni 450 000 FCFA.',
      link: null,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 96), // il y a 4 jours
      is_read: true,
    },
  ];

  let total = 0;

  for (const user of users) {
    for (const notif of notifications) {
      await pool.query(
        `INSERT INTO notifications (user_id, dahira_id, type, title, message, link, metadata, is_read, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          user.dahira_id,
          notif.type,
          notif.title,
          notif.message,
          notif.link || null,
          JSON.stringify({}),
          notif.is_read ? 1 : 0,
          notif.created_at,
        ],
      );
      total++;
    }
  }

  console.log(`✅ ${total} notifications insérées pour ${users.length} utilisateur(s).`);
  await pool.end();
}

seed().catch((err) => {
  console.error('Erreur :', err.message);
  process.exit(1);
});
