const pool = require('../../config/db');
const fs = require('fs').promises;
const path = require('path');
// const { sendRecuEmail } = require('../../utils/email'); // À implémenter dans utils/email.js

// Note: PDFKit n'est pas encore installé. Pour l'installer : npm install pdfkit
// const PDFDocument = require('pdfkit');

/**
 * Générer un numéro de reçu unique
 */
const generateRecuNumber = (dahiraId, cotisationId) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `RECU-${dahiraId}-${year}${month}-${cotisationId}`;
};

/**
 * Générer un reçu PDF pour une cotisation
 * Note: Nécessite l'installation de pdfkit: npm install pdfkit
 */
const genererRecuPDF = async (cotisationId, dahiraId) => {
  // Récupérer les informations
  const [cotisation] = await pool.query(
    `SELECT c.*, m.nom, m.prenom, m.telephone, d.nom as dahira_nom, d.adresse as dahira_adresse,
            s.date_seance, s.type as seance_type
     FROM cotisations c
     JOIN membres m ON c.membre_id = m.id
     JOIN dahiras d ON c.dahira_id = d.id
     LEFT JOIN seances s ON c.seance_id = s.id
     WHERE c.id = ? AND c.dahira_id = ? AND c.statut = 'approved'`,
    [cotisationId, dahiraId]
  );

  if (cotisation.length === 0) {
    throw new Error('Cotisation non trouvée ou non approuvée');
  }

  const data = cotisation[0];
  const recuNumber = generateRecuNumber(dahiraId, cotisationId);

  // TODO: Implémenter la génération PDF avec PDFKit
  // Pour l'instant, retourner les données structurées
  return {
    numero_recu: recuNumber,
    cotisation: data,
    message: 'Génération PDF à implémenter avec PDFKit'
  };

  /* Code PDFKit à décommenter après installation:
  
  const recusDir = path.join('uploads', 'recus');
  await fs.mkdir(recusDir, { recursive: true });

  const filename = `${recuNumber}.pdf`;
  const filepath = path.join(recusDir, filename);

  const PDFDocument = require('pdfkit');
  
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const writeStream = require('fs').createWriteStream(filepath);

    doc.pipe(writeStream);

    // En-tête
    doc.fontSize(20)
       .text(data.dahira_nom, { align: 'center' })
       .fontSize(10)
       .text(data.dahira_adresse || '', { align: 'center' })
       .moveDown(2);

    // Titre
    doc.fontSize(16)
       .text('REÇU DE COTISATION', { align: 'center', underline: true })
       .moveDown();

    // Numéro de reçu
    doc.fontSize(10)
       .text(`Reçu N° : ${recuNumber}`, { align: 'right' })
       .text(`Date : ${new Date(data.created_at).toLocaleDateString('fr-FR')}`, { align: 'right' })
       .moveDown(2);

    // Informations du membre
    doc.fontSize(12)
       .text('Informations du membre', { underline: true })
       .moveDown(0.5)
       .fontSize(10)
       .text(`Nom complet : ${data.prenom} ${data.nom}`)
       .text(`Téléphone : ${data.telephone}`)
       .moveDown(1.5);

    // Détails de la cotisation
    doc.fontSize(12)
       .text('Détails de la cotisation', { underline: true })
       .moveDown(0.5)
       .fontSize(10)
       .text(`Montant : ${data.montant.toLocaleString('fr-FR')} FCFA`)
       .fontSize(10)
       .text(`Mode de paiement : ${data.mode_paiement === 'especes' ? 'Espèces' : data.mode_paiement === 'wave' ? 'Wave' : 'Orange Money'}`)
       .text(`Séance : ${data.seance_type || 'Non spécifiée'} ${data.date_seance ? `du ${new Date(data.date_seance).toLocaleDateString('fr-FR')}` : ''}`)
       .text(`Mois concerné : ${data.mois_concerne || 'Non spécifié'}`)
       .moveDown(1.5);

    if (data.note) {
      doc.fontSize(10)
         .text(`Note : ${data.note}`)
         .moveDown();
    }

    // Montant en gros
    doc.fontSize(16)
       .fillColor('#2ecc71')
       .text(`${data.montant.toLocaleString('fr-FR')} FCFA`, { align: 'center' })
       .fillColor('black')
       .moveDown(2);

    // Signature
    doc.fontSize(10)
       .text('Signature et cachet', 100, doc.page.height - 150)
       .moveDown(3)
       .text('_________________________', 100);

    // Pied de page
    doc.fontSize(8)
       .fillColor('#666')
       .text(
         'Ce reçu est généré automatiquement et fait foi de paiement.',
         50,
         doc.page.height - 50,
         { align: 'center', width: doc.page.width - 100 }
       );

    doc.end();

    writeStream.on('finish', () => {
      resolve({
        numero_recu: recuNumber,
        fichier: `/uploads/recus/${filename}`,
        path: filepath
      });
    });

    writeStream.on('error', reject);
  });
  */
};

/**
 * Générer et envoyer un reçu par email
 * Note: Nécessite l'implémentation de sendRecuEmail dans utils/email.js
 */
const envoyerRecuEmail = async (cotisationId, dahiraId) => {
  // Générer le PDF
  const recu = await genererRecuPDF(cotisationId, dahiraId);

  // Récupérer l'email du membre
  const [cotisation] = await pool.query(
    `SELECT m.nom, m.prenom, u.email
     FROM cotisations c
     JOIN membres m ON c.membre_id = m.id
     LEFT JOIN users u ON m.id = u.membre_id
     WHERE c.id = ? AND c.dahira_id = ?`,
    [cotisationId, dahiraId]
  );

  if (cotisation.length === 0 || !cotisation[0].email) {
    throw new Error('Membre sans email associé');
  }

  const data = cotisation[0];

  // TODO: Implémenter sendRecuEmail dans utils/email.js
  // await sendRecuEmail(data.email, `${data.prenom} ${data.nom}`, recu.numero_recu, recu.path);

  return {
    ...recu,
    email_envoye: false, // Changer à true après implémentation
    email_destinataire: data.email,
    message: 'Email à implémenter dans utils/email.js'
  };
};

/**
 * Enregistrer un reçu dans la base de données
 */
const enregistrerRecu = async (cotisationId, dahiraId, fichierPath, numeroRecu) => {
  const [result] = await pool.query(
    `INSERT INTO recus (cotisation_id, dahira_id, numero_recu, fichier_path)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE fichier_path = VALUES(fichier_path)`,
    [cotisationId, dahiraId, numeroRecu, fichierPath]
  );

  return result;
};

/**
 * Récupérer un reçu par ID de cotisation
 */
const getRecuByCotisation = async (cotisationId, dahiraId) => {
  const [recu] = await pool.query(
    `SELECT r.*, c.montant, m.nom, m.prenom
     FROM recus r
     JOIN cotisations c ON r.cotisation_id = c.id
     JOIN membres m ON c.membre_id = m.id
     WHERE r.cotisation_id = ? AND r.dahira_id = ?`,
    [cotisationId, dahiraId]
  );

  if (recu.length === 0) {
    // Générer le reçu s'il n'existe pas
    const nouveauRecu = await genererRecuPDF(cotisationId, dahiraId);
    await enregistrerRecu(cotisationId, dahiraId, nouveauRecu.path, nouveauRecu.numero_recu);
    return nouveauRecu;
  }

  return recu[0];
};

/**
 * Lister tous les reçus d'un membre
 */
const getRecusMembre = async (membreId, dahiraId) => {
  const [recus] = await pool.query(
    `SELECT r.*, c.montant, c.mode_paiement, c.created_at as date_cotisation
     FROM recus r
     JOIN cotisations c ON r.cotisation_id = c.id
     WHERE c.membre_id = ? AND r.dahira_id = ?
     ORDER BY c.created_at DESC`,
    [membreId, dahiraId]
  );

  return recus;
};

module.exports = {
  genererRecuPDF,
  envoyerRecuEmail,
  enregistrerRecu,
  getRecuByCotisation,
  getRecusMembre
};
