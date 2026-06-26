const pool = require('../../config/db');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
// const { sendRecuEmail } = require('../../utils/email'); // À implémenter dans utils/email.js

/**
 * Générer un numéro de reçu unique
 */
const generateRecuNumber = (dahiraId, cotisationId) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `RECU-${dahiraId}-${year}${month}-${cotisationId}`;
};

const MODE_LABELS = {
  especes: 'Espèces',
  wave: 'Wave',
  orange_money: 'Orange Money',
};

/**
 * Générer un reçu PDF pour une cotisation et retourner le chemin du fichier.
 */
const genererRecuPDF = async (cotisationId, dahiraId) => {
  const [rows] = await pool.query(
    `SELECT c.*, m.nom, m.prenom, m.telephone, d.nom as dahira_nom, d.adresse as dahira_adresse,
            s.date_seance, s.type as seance_type
     FROM cotisations c
     JOIN membres m ON c.membre_id = m.id
     JOIN dahiras d ON c.dahira_id = d.id
     LEFT JOIN seances s ON c.seance_id = s.id
     WHERE c.id = ? AND c.dahira_id = ? AND c.statut = 'approved'`,
    [cotisationId, dahiraId]
  );

  if (rows.length === 0) {
    throw new Error('Cotisation non trouvée ou non approuvée');
  }

  const data = rows[0];
  const recuNumber = generateRecuNumber(dahiraId, cotisationId);

  const recusDir = path.join(process.cwd(), 'uploads', 'recus');
  await fs.mkdir(recusDir, { recursive: true });

  const filename = `${recuNumber}.pdf`;
  const filepath = path.join(recusDir, filename);

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const writeStream = fsSync.createWriteStream(filepath);
    doc.pipe(writeStream);

    const accentColor = '#006a61';
    const textColor = '#0b1c30';

    // ── En-tête ────────────────────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 90).fill(accentColor);
    doc.fillColor('#ffffff')
       .fontSize(22).font('Helvetica-Bold')
       .text(data.dahira_nom, 50, 22, { align: 'center', width: doc.page.width - 100 });
    if (data.dahira_adresse) {
      doc.fontSize(10).font('Helvetica')
         .text(data.dahira_adresse, 50, 52, { align: 'center', width: doc.page.width - 100 });
    }
    doc.fillColor(textColor);

    // ── Titre ──────────────────────────────────────────────────────────────────
    doc.moveDown(3)
       .fontSize(18).font('Helvetica-Bold').fillColor(accentColor)
       .text('REÇU DE COTISATION', { align: 'center' });

    doc.moveDown(0.4)
       .moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y)
       .strokeColor(accentColor).lineWidth(1).stroke();

    // ── Métadonnées ────────────────────────────────────────────────────────────
    doc.moveDown(1)
       .fontSize(10).font('Helvetica').fillColor('#45464d')
       .text(`Reçu N° : ${recuNumber}`, { align: 'right' })
       .text(`Date : ${new Date(data.created_at).toLocaleDateString('fr-FR')}`, { align: 'right' });

    // ── Informations du membre ─────────────────────────────────────────────────
    doc.moveDown(1.5)
       .fontSize(12).font('Helvetica-Bold').fillColor(accentColor)
       .text('Informations du membre');
    doc.moveDown(0.3)
       .fontSize(10).font('Helvetica').fillColor(textColor)
       .text(`Nom complet : ${data.prenom} ${data.nom}`)
       .text(`Téléphone   : ${data.telephone || 'Non renseigné'}`);

    // ── Détails de la cotisation ───────────────────────────────────────────────
    doc.moveDown(1.2)
       .fontSize(12).font('Helvetica-Bold').fillColor(accentColor)
       .text('Détails du paiement');
    doc.moveDown(0.3)
       .fontSize(10).font('Helvetica').fillColor(textColor)
       .text(`Mode de paiement : ${MODE_LABELS[data.mode_paiement] || data.mode_paiement}`)
       .text(`Séance           : ${data.seance_type || 'Non spécifiée'}${data.date_seance ? ' du ' + new Date(data.date_seance).toLocaleDateString('fr-FR') : ''}`);
    if (data.mois_concerne) {
      doc.text(`Mois concerné    : ${data.mois_concerne}`);
    }
    if (data.note) {
      doc.text(`Note             : ${data.note}`);
    }

    // ── Montant (encadré) ──────────────────────────────────────────────────────
    doc.moveDown(2);
    const boxY = doc.y;
    doc.rect(50, boxY, doc.page.width - 100, 60).fillAndStroke('#f0faf9', accentColor);
    doc.fontSize(14).font('Helvetica-Bold').fillColor(accentColor)
       .text('Montant versé', 50, boxY + 10, { align: 'center', width: doc.page.width - 100 });
    doc.fontSize(24).font('Helvetica-Bold').fillColor(textColor)
       .text(`${Number(data.montant).toLocaleString('fr-FR')} FCFA`, 50, boxY + 30, { align: 'center', width: doc.page.width - 100 });

    // ── Signature ─────────────────────────────────────────────────────────────
    const sigY = doc.page.height - 130;
    doc.fontSize(10).font('Helvetica').fillColor('#45464d')
       .text('Signature et cachet du responsable', 50, sigY)
       .moveDown(2)
       .text('_________________________', 50);

    // ── Pied de page ──────────────────────────────────────────────────────────
    doc.rect(0, doc.page.height - 40, doc.page.width, 40).fill('#f8f9ff');
    doc.fontSize(8).font('Helvetica').fillColor('#45464d')
       .text(
         'Ce reçu est généré automatiquement par Dahira App et fait foi de paiement.',
         50, doc.page.height - 28,
         { align: 'center', width: doc.page.width - 100 }
       );

    doc.end();
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });

  return { numero_recu: recuNumber, fichier_path: filepath };
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

/**
 * Lister tous les reçus d'un dahira
 */
const getRecusDahira = async (dahiraId) => {
  const [recus] = await pool.query(
    `SELECT r.id, r.cotisation_id, r.dahira_id, r.numero_recu, r.fichier_path,
            c.montant, c.mode_paiement, c.created_at as date_cotisation,
            m.nom, m.prenom, m.telephone,
            u.email
     FROM recus r
     JOIN cotisations c ON r.cotisation_id = c.id
     JOIN membres m ON c.membre_id = m.id
     LEFT JOIN users u ON m.id = u.membre_id
     WHERE r.dahira_id = ?
     ORDER BY c.created_at DESC`,
    [dahiraId]
  );

  return recus;
};

/**
 * Récupérer un reçu par ID pour téléchargement/impression
 */
const getRecuForDownload = async (recuId, dahiraId) => {
  const [rows] = await pool.query(
    `SELECT r.id, r.numero_recu, r.fichier_path,
            c.montant, c.mode_paiement, c.created_at as date_cotisation,
            m.nom, m.prenom, m.telephone,
            d.nom as dahira_nom
     FROM recus r
     JOIN cotisations c ON r.cotisation_id = c.id
     JOIN membres m ON c.membre_id = m.id
     JOIN dahiras d ON r.dahira_id = d.id
     WHERE r.id = ? AND r.dahira_id = ?`,
    [recuId, dahiraId]
  );

  if (rows.length === 0) {
    throw new Error('Reçu introuvable');
  }

  const recu = rows[0];

  if (!recu.fichier_path) {
    throw new Error('Fichier PDF non disponible. Générez d\'abord le reçu depuis la page Cotisations.');
  }

  if (!fsSync.existsSync(recu.fichier_path)) {
    throw new Error('Fichier PDF introuvable sur le serveur.');
  }

  return recu;
};

/**
 * Générer un PDF récapitulatif de toutes les cotisations d'une séance et le streamer.
 * Retourne un Buffer (pas de sauvegarde disque).
 */
const genererPDFSeance = async (seanceId, dahiraId) => {
  const [seances] = await pool.query(
    `SELECT s.*, d.nom as dahira_nom FROM seances s JOIN dahiras d ON s.dahira_id = d.id WHERE s.id = ? AND s.dahira_id = ?`,
    [seanceId, dahiraId]
  );
  if (seances.length === 0) throw new Error('Séance non trouvée');
  const seance = seances[0];

  const [cotisations] = await pool.query(
    `SELECT c.montant, c.mode_paiement, c.statut, c.created_at, m.nom, m.prenom
     FROM cotisations c
     JOIN membres m ON c.membre_id = m.id
     WHERE c.seance_id = ? AND c.dahira_id = ? AND c.statut = 'approved'
     ORDER BY c.created_at ASC`,
    [seanceId, dahiraId]
  );

  const total = cotisations.reduce((sum, c) => sum + Number(c.montant), 0);
  const dateSeance = new Date(seance.date_seance).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const typeLabels = { hebdomadaire: 'Hebdomadaire', mensuelle: 'Mensuelle', gamou: 'Gamou', magal: 'Magal', safar: 'Safar', adiya: 'Adiya', autre: 'Autre' };

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // En-tête
    doc.rect(0, 0, doc.page.width, 80).fill('#131b2e');
    doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold').text(seance.dahira_nom, 50, 20);
    doc.fontSize(12).font('Helvetica').text(`Récapitulatif de séance — ${dateSeance}`, 50, 46);
    doc.fillColor('#000000');

    // Infos séance
    doc.moveDown(3);
    doc.fontSize(11).font('Helvetica-Bold').text('Informations de la séance');
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#c6c6cd').stroke();
    doc.moveDown(0.4);
    doc.font('Helvetica').fontSize(10)
      .text(`Type : ${typeLabels[seance.type] || seance.type}`, { continued: true })
      .text(`   |   Date : ${dateSeance}`, { continued: false });
    if (seance.lieu) doc.text(`Lieu : ${seance.lieu}`);
    if (seance.theme) doc.text(`Thème : ${seance.theme}`);

    // Tableau cotisations
    doc.moveDown(1.5);
    doc.fontSize(11).font('Helvetica-Bold').text(`Cotisations approuvées (${cotisations.length})`);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#c6c6cd').stroke();
    doc.moveDown(0.4);

    const colX = [50, 220, 340, 450];
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#45464d');
    doc.text('Membre', colX[0], doc.y, { width: 160 });
    doc.text('Mode', colX[1], doc.y - 9, { width: 110 });
    doc.text('Date', colX[2], doc.y - 9, { width: 100 });
    doc.text('Montant', colX[3], doc.y - 9, { width: 90, align: 'right' });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e5eeff').stroke();
    doc.moveDown(0.3);

    doc.font('Helvetica').fontSize(10).fillColor('#0b1c30');
    cotisations.forEach((c, i) => {
      const y = doc.y;
      if (i % 2 === 0) doc.rect(50, y - 2, 495, 16).fill('#f8f9ff').fillColor('#0b1c30');
      const dateC = new Date(c.created_at).toLocaleDateString('fr-FR');
      const montantStr = Math.round(Number(c.montant)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';
      doc.text(`${c.prenom} ${c.nom}`, colX[0], y, { width: 160 });
      doc.text(MODE_LABELS[c.mode_paiement] || c.mode_paiement, colX[1], y, { width: 110 });
      doc.text(dateC, colX[2], y, { width: 100 });
      doc.text(montantStr, colX[3], y, { width: 90, align: 'right' });
      doc.moveDown(0.9);
    });

    // Total
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#131b2e').stroke();
    doc.moveDown(0.3);
    const totalStr = Math.round(total).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';
    doc.font('Helvetica-Bold').fontSize(12)
      .text(`Total collecté : ${totalStr}`, 50, doc.y, { align: 'right' });

    // Pied de page
    doc.fontSize(8).font('Helvetica').fillColor('#45464d')
      .text(`Généré le ${new Date().toLocaleDateString('fr-FR')} — ${seance.dahira_nom}`, 50, doc.page.height - 40, { align: 'center' });

    doc.end();
  });
};

module.exports = {
  genererRecuPDF,
  envoyerRecuEmail,
  enregistrerRecu,
  getRecuByCotisation,
  getRecusMembre,
  getRecusDahira,
  getRecuForDownload,
  genererPDFSeance
};
