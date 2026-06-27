/**
 * Seed réaliste — Dahira App
 * Ajoute des données de test représentatives d'un vrai dahira sénégalais.
 * Exécuter : node database/seed_realistic.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const DB = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dahira_app',
};

// ─── Données ────────────────────────────────────────────────────────────────

const HASH_MEMBRE = '$2b$10$YXy6q7k8m5n3p2r1s0t4uOvWxYzA1B2C3D4E5F6G7H8I9J0K1L2M3'; // "membre123"

async function freshHash(pwd) {
  return bcrypt.hash(pwd, 10);
}

// Membres supplémentaires du dahira (sans compte app = password_hash NULL)
const MEMBRES_SANS_COMPTE = [
  { nom: 'Diop',    prenom: 'Amadou',    telephone: '771000001', sexe: 'M', date_adhesion: '2021-03-15', responsabilites: null },
  { nom: 'Ndiaye',  prenom: 'Rokhaya',   telephone: '771000002', sexe: 'F', date_adhesion: '2021-03-15', responsabilites: null },
  { nom: 'Gueye',   prenom: 'Cheikh',    telephone: '771000003', sexe: 'M', date_adhesion: '2021-05-20', responsabilites: 'Secrétaire' },
  { nom: 'Sow',     prenom: 'Adja',      telephone: '771000004', sexe: 'F', date_adhesion: '2021-05-20', responsabilites: null },
  { nom: 'Thiaw',   prenom: 'Mamadou',   telephone: '771000005', sexe: 'M', date_adhesion: '2021-07-10', responsabilites: null },
  { nom: 'Sarr',    prenom: 'Khady',     telephone: '771000006', sexe: 'F', date_adhesion: '2021-07-10', responsabilites: null },
  { nom: 'Cissé',   prenom: 'Ousmane',   telephone: '771000007', sexe: 'M', date_adhesion: '2021-09-01', responsabilites: null },
  { nom: 'Touré',   prenom: 'Aissatou',  telephone: '771000008', sexe: 'F', date_adhesion: '2021-09-01', responsabilites: null },
  { nom: 'Diallo',  prenom: 'Ibrahima',  telephone: '771000009', sexe: 'M', date_adhesion: '2022-01-12', responsabilites: 'Chargé communication' },
  { nom: 'Diouf',   prenom: 'Sokhna',    telephone: '771000010', sexe: 'F', date_adhesion: '2022-01-12', responsabilites: null },
  { nom: 'Kane',    prenom: 'Modou',     telephone: '771000011', sexe: 'M', date_adhesion: '2022-03-08', responsabilites: null },
  { nom: 'Sy',      prenom: 'Mariama',   telephone: '771000012', sexe: 'F', date_adhesion: '2022-03-08', responsabilites: null },
  { nom: 'Mbodj',   prenom: 'Pape',      telephone: '771000013', sexe: 'M', date_adhesion: '2022-06-20', responsabilites: null },
  { nom: 'Faye',    prenom: 'Ndéye',     telephone: '771000014', sexe: 'F', date_adhesion: '2022-06-20', responsabilites: null },
  { nom: 'Badji',   prenom: 'Lamine',    telephone: '771000015', sexe: 'M', date_adhesion: '2022-09-15', responsabilites: null },
  { nom: 'Diagne',  prenom: 'Fatou',     telephone: '771000016', sexe: 'F', date_adhesion: '2022-09-15', responsabilites: null },
  { nom: 'Bâ',      prenom: 'Alioune',   telephone: '771000017', sexe: 'M', date_adhesion: '2023-01-05', responsabilites: null },
  { nom: 'Lô',      prenom: 'Mame',      telephone: '771000018', sexe: 'F', date_adhesion: '2023-01-05', responsabilites: null },
  { nom: 'Traoré',  prenom: 'Seydou',    telephone: '771000019', sexe: 'M', date_adhesion: '2023-04-10', responsabilites: null },
  { nom: 'Konaté',  prenom: 'Aminata',   telephone: '771000020', sexe: 'F', date_adhesion: '2023-04-10', responsabilites: null },
];

// Séances des 6 derniers mois (vendredis)
function seancesPassees(dahiraId) {
  const seances = [];
  const today = new Date('2026-06-27');
  for (let i = 24; i >= 1; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i * 7);
    const dateStr = d.toISOString().slice(0, 10);
    seances.push({
      dahira_id: dahiraId,
      type: 'hebdomadaire',
      date_seance: dateStr + ' 20:00:00',
      heure_debut: '20:00:00',
      heure_fin: '22:30:00',
      lieu: i % 4 === 0 ? 'Mosquée Omarienne' : i % 4 === 1 ? 'Domicile Cheikh Gueye' : i % 4 === 2 ? 'Centre Islamique Médina' : 'Domicile Amadou Diop',
      theme: i % 6 === 0 ? 'Recitation du Coran' : i % 6 === 1 ? 'Bienfaits de la Zakat' : i % 6 === 2 ? 'Hadith sur la fraternité' : i % 6 === 3 ? 'L\'importance du dhikr' : i % 6 === 4 ? 'Les piliers de l\'Islam' : 'Tafsir Sourate Al-Fatiha',
      cloturee: true,
    });
  }
  // Séance en cours
  seances.push({
    dahira_id: dahiraId,
    type: 'hebdomadaire',
    date_seance: '2026-06-27 20:00:00',
    heure_debut: '20:00:00',
    heure_fin: '22:30:00',
    lieu: 'Mosquée de la Médina',
    theme: 'Les vertus du vendredi',
    cloturee: false,
  });
  return seances;
}

async function run() {
  const conn = await mysql.createConnection({ ...DB, multipleStatements: false });
  console.log('✓ Connecté\n');

  // ── Récupérer les IDs existants ──────────────────────────────────────────
  const [[dahira]] = await conn.execute('SELECT id FROM dahiras LIMIT 1');
  if (!dahira) { console.error('Aucun dahira trouvé. Lancez d\'abord apply_schema.js'); process.exit(1); }
  const dahiraId = dahira.id;

  const [[bureau]] = await conn.execute(
    'SELECT id FROM membres WHERE dahira_id = ? AND role = "bureau" AND is_owner = 1 LIMIT 1', [dahiraId]
  );
  const [[tresorier]] = await conn.execute(
    'SELECT id FROM membres WHERE dahira_id = ? AND role = "tresorier" LIMIT 1', [dahiraId]
  );
  const bureauId    = bureau?.id ?? 2;
  const tresorieId  = tresorier?.id ?? 3;

  // ── 1. Membres supplémentaires ───────────────────────────────────────────
  console.log('⏳ Ajout des membres...');
  const membreIds = [];

  for (const m of MEMBRES_SANS_COMPTE) {
    const [r] = await conn.execute(
      `INSERT IGNORE INTO membres (dahira_id, nom, prenom, telephone, sexe, date_adhesion, responsabilites, role, actif)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'membre', TRUE)`,
      [dahiraId, m.nom, m.prenom, m.telephone, m.sexe, m.date_adhesion, m.responsabilites]
    );
    if (r.insertId) membreIds.push(r.insertId);
  }

  // Récupérer tous les IDs de membres du dahira
  const [tousLesMembres] = await conn.execute(
    'SELECT id, nom, prenom FROM membres WHERE dahira_id = ? ORDER BY id', [dahiraId]
  );
  console.log(`✓ ${tousLesMembres.length} membres au total`);

  // ── 2. Séances ───────────────────────────────────────────────────────────
  console.log('⏳ Ajout des séances...');
  const seancesList = seancesPassees(dahiraId);
  const seanceIds = [];

  for (const s of seancesList) {
    const [r] = await conn.execute(
      `INSERT INTO seances (dahira_id, type, date_seance, heure_debut, heure_fin, lieu, theme, cloturee, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [s.dahira_id, s.type, s.date_seance, s.heure_debut, s.heure_fin, s.lieu, s.theme, s.cloturee, bureauId]
    );
    seanceIds.push(r.insertId);
  }
  console.log(`✓ ${seanceIds.length} séances créées`);

  // ── 3. Cotisations ───────────────────────────────────────────────────────
  console.log('⏳ Ajout des cotisations...');
  let cotisCount = 0;
  const allMembresIds = tousLesMembres.map(m => m.id);
  const MONTANTS = [1000, 2000, 2500, 5000];
  const MODES = ['especes', 'wave', 'orange_money', 'virement'];

  // Pour chaque séance clôturée, ~70% des membres paient
  for (let si = 0; si < seanceIds.length - 1; si++) {
    const seanceId = seanceIds[si];
    const seanceDateStr = seancesList[si].date_seance;

    for (const membreId of allMembresIds) {
      if (Math.random() > 0.70) continue; // 70% de participation

      const montant = MONTANTS[Math.floor(Math.random() * MONTANTS.length)];
      const mode = MODES[Math.floor(Math.random() * MODES.length)];
      const isApproved = Math.random() > 0.05; // 95% approuvées

      await conn.execute(
        `INSERT INTO cotisations (dahira_id, membre_id, seance_id, montant, mode_paiement, statut, valide_par, valide_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          dahiraId, membreId, seanceId, montant, mode,
          isApproved ? 'approved' : 'pending',
          isApproved ? tresorieId : null,
          isApproved ? seanceDateStr.slice(0, 10) + ' 21:00:00' : null,
          seanceDateStr.slice(0, 10) + ' 20:30:00',
        ]
      );
      cotisCount++;
    }
  }
  console.log(`✓ ${cotisCount} cotisations créées`);

  // ── 4. Dépenses ──────────────────────────────────────────────────────────
  console.log('⏳ Ajout des dépenses...');
  const DEPENSES = [
    { description: 'Location salle pour Gamou annuel',        montant: 150000, categorie: 'location',    statut: 'validee', date: '2025-10-15' },
    { description: 'Achat de thé Gunpowder et café Touba',    montant: 25000,  categorie: 'nourriture',  statut: 'validee', date: '2025-11-01' },
    { description: 'Impression flyers Gamou 2025',             montant: 18000,  categorie: 'evenements',  statut: 'validee', date: '2025-11-10' },
    { description: 'Sono et micros pour cérémonie',            montant: 75000,  categorie: 'evenements',  statut: 'validee', date: '2025-11-28' },
    { description: 'Repas des invités d\'honneur',              montant: 95000,  categorie: 'nourriture',  statut: 'validee', date: '2025-11-29' },
    { description: 'Achat tapis de prière × 20',               montant: 60000,  categorie: 'autres',      statut: 'validee', date: '2025-12-05' },
    { description: 'Transport matériel son',                    montant: 15000,  categorie: 'evenements',  statut: 'validee', date: '2025-12-05' },
    { description: 'Réparation climatiseur salle réunion',     montant: 45000,  categorie: 'maintenance', statut: 'validee', date: '2026-01-10' },
    { description: 'Don pour famille nécessiteuse (Médina)',    montant: 30000,  categorie: 'donations',   statut: 'validee', date: '2026-02-14' },
    { description: 'Achat livres religieux pour bibliothèque', montant: 40000,  categorie: 'autres',      statut: 'validee', date: '2026-03-01' },
    { description: 'Thé et rafraîchissements séances',          montant: 12000,  categorie: 'nourriture',  statut: 'validee', date: '2026-04-15' },
    { description: 'Visite solidarité famille Sow (deuil)',     montant: 25000,  categorie: 'donations',   statut: 'validee', date: '2026-05-03' },
    { description: 'Frais impression attestations membres',    montant: 8000,   categorie: 'autres',      statut: 'validee', date: '2026-05-20' },
    { description: 'Location vidéoprojecteur conférence',      montant: 20000,  categorie: 'location',    statut: 'en_attente',  date: '2026-06-10' },
    { description: 'Renouvellement domaine site web dahira',    montant: 15000,  categorie: 'autres',      statut: 'en_attente',  date: '2026-06-20' },
  ];

  for (const d of DEPENSES) {
    await conn.execute(
      `INSERT INTO depenses (dahira_id, description, montant, categorie, mode_paiement, date_depense, statut, cree_par, valide_par, valide_at, created_at)
       VALUES (?, ?, ?, ?, 'especes', ?, ?, ?, ?, ?, ?)`,
      [
        dahiraId, d.description, d.montant, d.categorie, d.date,
        d.statut,
        bureauId,
        d.statut === 'validee' ? tresorieId : null,
        d.statut === 'validee' ? d.date + ' 10:00:00' : null,
        d.date + ' 09:00:00',
      ]
    );
  }
  console.log(`✓ ${DEPENSES.length} dépenses créées`);

  // ── 5. Annonces ──────────────────────────────────────────────────────────
  console.log('⏳ Ajout des annonces...');
  const ANNONCES = [
    { titre: 'Gamou annuel 2025 — Save the date !', contenu: 'Nous avons le plaisir de vous annoncer que le Gamou annuel de notre dahira se tiendra le 29 novembre 2025 à la salle polyvalente de la Médina. Tous les membres sont attendus. Préparez vos habits et venez nombreux honorer notre Cheikh.', created_at: '2025-10-01 10:00:00' },
    { titre: 'Collecte spéciale pour famille dans le besoin', contenu: 'Suite à l\'incendie qui a touché la famille Sow de notre quartier, nous organisons une collecte de solidarité. Merci d\'apporter vos contributions lors de la prochaine séance ou de contacter le trésorier.', created_at: '2025-10-20 14:30:00' },
    { titre: 'Changement de lieu — Séance du 7 novembre', contenu: 'En raison de travaux dans la mosquée, la séance du 7 novembre 2025 se tiendra exceptionnellement au domicile de notre frère Cheikh Gueye. L\'heure reste inchangée : 20h.', created_at: '2025-11-05 08:00:00' },
    { titre: 'Compte-rendu Gamou 2025', contenu: 'Alhamdoulillah ! Notre Gamou annuel a été un franc succès. Plus de 200 fidèles ont répondu présent. Nous remercions tous les membres qui ont contribué à l\'organisation. Le bilan financier sera présenté lors de la prochaine séance.', created_at: '2025-12-01 09:00:00' },
    { titre: 'Cotisation annuelle 2026 — Rappel', contenu: 'Nous rappelons à tous les membres que la cotisation annuelle 2026 est fixée à 12 000 FCFA (1 000 FCFA/mois). Merci de vous mettre à jour avant la fin du mois de janvier. Contact trésorier : 770111222.', created_at: '2026-01-05 10:00:00' },
    { titre: 'Conférence islamique — Samedi 15 mars 2026', contenu: 'Notre dahira organise une grande conférence sur le thème "La famille musulmane au XXIe siècle". Intervenant : Professeur Abdou Khadre Lô. Entrée libre. Venez accompagnés de vos familles !', created_at: '2026-03-10 11:00:00' },
    { titre: 'Séance exceptionnelle — Nuit du Destin', contenu: 'À l\'occasion de la Nuit du Destin (Laylat al-Qadr), une séance spéciale de dhikr et récitation du Coran est organisée. Rendez-vous à la mosquée de la Médina dès 23h. Que Allah nous accorde Sa grâce.', created_at: '2026-04-01 12:00:00' },
    { titre: 'Bienvenue à nos nouveaux membres !', contenu: 'Notre dahira accueille avec joie 8 nouveaux membres ce trimestre. Qu\'Allah bénisse leur démarche et renforce les liens de fraternité au sein de notre communauté. Nous leur souhaitons une belle aventure spirituelle.', created_at: '2026-05-15 10:00:00' },
  ];

  for (const a of ANNONCES) {
    await conn.execute(
      `INSERT INTO annonces (dahira_id, publie_par, titre, contenu, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [dahiraId, bureauId, a.titre, a.contenu, a.created_at, a.created_at]
    );
  }
  console.log(`✓ ${ANNONCES.length} annonces créées`);

  // ── 6. Événements ────────────────────────────────────────────────────────
  console.log('⏳ Ajout des événements...');
  const EVENEMENTS = [
    {
      titre: 'Gamou Annuel 2025',
      description: 'Grand rassemblement annuel du dahira en l\'honneur de notre vénéré Cheikh. Au programme : récitation du Coran, conférences, repas communautaire et chants religieux.',
      date_debut: '2025-11-29',
      date_fin: '2025-11-30',
      lieu: 'Salle polyvalente de la Médina, Dakar',
      type: 'ceremonie',
      inscriptions_ouvertes: false,
      cree_par: bureauId,
      created_at: '2025-10-01 10:00:00',
    },
    {
      titre: 'Conférence — La Famille Musulmane',
      description: 'Conférence organisée par notre dahira sur le thème "La famille musulmane au XXIe siècle". Intervenant : Professeur Abdou Khadre Lô, enseignant à l\'Université Cheikh Anta Diop.',
      date_debut: '2026-03-15',
      date_fin: '2026-03-15',
      lieu: 'Centre Islamique de la Médina',
      type: 'conference',
      inscriptions_ouvertes: false,
      cree_par: bureauId,
      created_at: '2026-03-01 10:00:00',
    },
    {
      titre: 'Sortie spirituelle — Touba',
      description: 'Pèlerinage et visite de la Grande Mosquée de Touba. Départ en bus depuis Dakar. Places limitées à 45 personnes.',
      date_debut: '2026-07-15',
      date_fin: '2026-07-16',
      lieu: 'Touba, Sénégal',
      type: 'sortie',
      inscriptions_ouvertes: true,
      cree_par: bureauId,
      created_at: '2026-06-01 10:00:00',
    },
    {
      titre: 'Formation — Tajwid pour débutants',
      description: 'Série de 4 cours de Tajwid (règles de récitation du Coran) animés par notre professeur Hafiz Ibrahima Kane. Ouverts à tous les niveaux.',
      date_debut: '2026-08-01',
      date_fin: '2026-08-22',
      lieu: 'Salle de cours mosquée Médina',
      type: 'formation',
      inscriptions_ouvertes: true,
      cree_par: bureauId,
      created_at: '2026-06-20 10:00:00',
    },
  ];

  const evenementIds = [];
  for (const e of EVENEMENTS) {
    const [r] = await conn.execute(
      `INSERT INTO evenements (dahira_id, cree_par, titre, description, date_debut, date_fin, lieu, type, inscriptions_ouvertes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [dahiraId, e.cree_par, e.titre, e.description, e.date_debut, e.date_fin, e.lieu, e.type, e.inscriptions_ouvertes, e.created_at, e.created_at]
    );
    evenementIds.push(r.insertId);
  }

  // Participations au Gamou (événement passé, tous présents)
  if (evenementIds[0]) {
    for (const membreId of allMembresIds) {
      const wasPresent = Math.random() > 0.2;
      await conn.execute(
        `INSERT INTO participations (evenement_id, membre_id, dahira_id, statut, created_at)
         VALUES (?, ?, ?, ?, '2025-11-29 19:00:00')`,
        [evenementIds[0], membreId, dahiraId, wasPresent ? 'present' : 'inscrit']
      );
    }
  }

  // Participations à la sortie Touba (à venir, quelques inscrits)
  if (evenementIds[2]) {
    const inscrits = allMembresIds.filter(() => Math.random() > 0.5);
    for (const membreId of inscrits) {
      await conn.execute(
        `INSERT INTO participations (evenement_id, membre_id, dahira_id, statut, created_at)
         VALUES (?, ?, ?, 'inscrit', '2026-06-15 10:00:00')`,
        [evenementIds[2], membreId, dahiraId]
      );
    }
    console.log(`✓ ${inscrits.length} inscrits pour la sortie Touba`);
  }

  console.log(`✓ ${EVENEMENTS.length} événements créés`);

  // ── 7. Notifications ─────────────────────────────────────────────────────
  console.log('⏳ Ajout des notifications...');
  const membresAvecCompte = tousLesMembres.filter(m => [bureauId, tresorieId].includes(m.id));

  for (const m of membresAvecCompte) {
    const notifs = [
      { type: 'cotisation_validee', title: 'Cotisation validée', message: 'Votre cotisation de 2 000 FCFA a été validée par le trésorier.', is_read: true,  created_at: '2026-05-10 10:00:00' },
      { type: 'seance_rappel',      title: 'Rappel séance',      message: 'La séance hebdomadaire aura lieu ce soir à 20h à la Mosquée de la Médina.', is_read: true, created_at: '2026-06-20 08:00:00' },
      { type: 'annonce',            title: 'Nouvelle annonce',   message: 'Bienvenue à nos nouveaux membres !', is_read: false, created_at: '2026-05-15 10:00:00' },
    ];
    for (const n of notifs) {
      await conn.execute(
        `INSERT INTO notifications (membre_id, dahira_id, type, title, message, is_read, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [m.id, dahiraId, n.type, n.title, n.message, n.is_read, n.created_at]
      );
    }
  }
  console.log(`✓ Notifications créées`);

  await conn.end();

  // ── Résumé ───────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('✅ Seed réaliste terminé !');
  console.log('\nRésumé :');
  console.log(`  Dahira      : "Dahira Test Médina" (id=${dahiraId})`);
  console.log(`  Membres     : ${tousLesMembres.length} (dont 2 avec compte app)`);
  console.log(`  Séances     : ${seanceIds.length} (24 passées + 1 en cours)`);
  console.log(`  Cotisations : ~${cotisCount}`);
  console.log(`  Dépenses    : ${DEPENSES.length}`);
  console.log(`  Annonces    : ${ANNONCES.length}`);
  console.log(`  Événements  : ${EVENEMENTS.length}`);
  console.log('\nComptes de connexion :');
  console.log('  Bureau    : 221771234567 / bureau123');
  console.log('  Trésorier : 770111222   / membre123');
  console.log('  SuperAdmin: 786347312   / admin123');
  console.log('═══════════════════════════════════════════════════════');
}

run().catch(e => {
  console.error('❌ ERREUR:', e.message);
  if (e.sql) console.error('SQL:', e.sql.substring(0, 200));
  process.exit(1);
});
