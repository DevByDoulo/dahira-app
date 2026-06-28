const {
  encaisserCotisation,
  encaisserCotisationsBatch,
  declarerCotisation,
  getAllCotisations,
  getPendingCotisations,
  validerCotisation,
  rejeterCotisation,
  getMesCotisations,
  getDashboard,
  getCotisationsForExport,
  getMembresPendingRelance
} = require('./cotisations.service');
const PDFDocument = require('pdfkit');
const { sendRelanceEmail } = require('../../utils/email');
const { success, error } = require('../../utils/response');
const { body, validationResult, query } = require('express-validator');

const encaisserCotisationController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg, 400);
    }

    const cotisation = await encaisserCotisation(req.dahira_id, req.body, req.user.id);
    return success(res, cotisation, 201);
  } catch (err) {
    next(err);
  }
};

const encaisserCotisationsBatchController = async (req, res, next) => {
  try {
    const { cotisations } = req.body;

    if (!cotisations || !Array.isArray(cotisations) || cotisations.length === 0) {
      return error(res, 'Le tableau cotisations est requis et ne doit pas être vide', 400);
    }

    const result = await encaisserCotisationsBatch(req.dahira_id, cotisations, req.user.id);
    return success(res, result, 201);
  } catch (err) {
    next(err);
  }
};

const declarerCotisationController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg, 400);
    }

    const cotisation = await declarerCotisation(req.dahira_id, req.user.id, req.body, req.user.id);
    return success(res, cotisation, 201);
  } catch (err) {
    next(err);
  }
};

const getAllCotisationsController = async (req, res, next) => {
  try {
    const { statut, seance_id, membre_id } = req.query;
    const cotisations = await getAllCotisations(
      req.dahira_id,
      statut || null,
      seance_id ? Number(seance_id) : null,
      membre_id ? Number(membre_id) : null,
    );
    return success(res, cotisations, 200);
  } catch (err) {
    next(err);
  }
};

const getAllCotisationsValidation = [
  query('statut').optional().isIn(['pending', 'approved', 'rejected']).withMessage('statut doit être pending, approved ou rejected'),
  query('seance_id').optional().isInt({ min: 1 }).withMessage('seance_id doit être un entier positif'),
  query('membre_id').optional().isInt({ min: 1 }).withMessage('membre_id doit être un entier positif')
];

const getPendingCotisationsController = async (req, res, next) => {
  try {
    const cotisations = await getPendingCotisations(req.dahira_id);
    return success(res, cotisations, 200);
  } catch (err) {
    next(err);
  }
};

const validerCotisationController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cotisation = await validerCotisation(id, req.dahira_id, req.user.id);
    return success(res, cotisation, 200);
  } catch (err) {
    next(err);
  }
};

const rejeterCotisationController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const cotisation = await rejeterCotisation(id, req.dahira_id, req.user.id, note);
    return success(res, cotisation, 200);
  } catch (err) {
    next(err);
  }
};

const getMesCotisationsController = async (req, res, next) => {
  try {
    const cotisations = await getMesCotisations(req.dahira_id, req.user.id);
    return success(res, cotisations, 200);
  } catch (err) {
    next(err);
  }
};

const getDashboardController = async (req, res, next) => {
  try {
    const { seance_id } = req.query;
    const dashboard = await getDashboard(req.dahira_id, seance_id);
    return success(res, dashboard, 200);
  } catch (err) {
    next(err);
  }
};

const encaisserCotisationValidation = [
  body('membre_id').notEmpty().withMessage('Le membre_id est requis'),
  body('seance_id').notEmpty().withMessage('Le seance_id est requis'),
  body('montant').notEmpty().withMessage('Le montant est requis'),
  body('mode_paiement')
    .notEmpty().withMessage('Le mode_paiement est requis')
    .isIn(['especes', 'wave', 'orange_money']).withMessage('Le mode_paiement doit être especes, wave ou orange_money')
];

const encaisserCotisationsBatchValidation = [
  body('cotisations').isArray().withMessage('cotisations doit être un tableau')
];

const declarerCotisationValidation = [
  body('seance_id').notEmpty().withMessage('Le seance_id est requis'),
  body('montant').notEmpty().withMessage('Le montant est requis'),
  body('mode_paiement')
    .notEmpty().withMessage('Le mode_paiement est requis')
    .isIn(['wave', 'orange_money']).withMessage('Le mode_paiement doit être wave ou orange_money')
];

const exportPdfController = async (req, res, next) => {
  try {
    const { statut } = req.query;
    const { dahiraNom, cotisations } = await getCotisationsForExport(req.dahira_id, statut || null);

    const fmt = (n) => Math.round(Number(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
    const modeLabel = { especes: 'Espèces', wave: 'Wave', orange_money: 'Orange Money' };
    const statutLabel = { approved: 'Validée', pending: 'En attente', rejected: 'Rejetée' };

    const totalCollecte = cotisations.filter(c => c.statut === 'approved').reduce((s, c) => s + Number(c.montant), 0);
    const nbAttente = cotisations.filter(c => c.statut === 'pending').length;

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="cotisations-${Date.now()}.pdf"`);
    doc.pipe(res);

    // ── En-tête ──
    const W = 495; // largeur utile
    doc.rect(50, 50, W, 70).fill('#0f172a');
    doc.fillColor('#ffffff').fontSize(18).font('Helvetica-Bold')
       .text(dahiraNom, 65, 62, { width: W - 30 });
    doc.fontSize(10).font('Helvetica')
       .text('Rapport des Cotisations', 65, 84)
       .text(`Exporté le ${fmtDate(new Date().toISOString())}`, 65, 98);
    doc.fillColor('#000000');

    // ── Résumé ──
    let y = 140;
    const cards = [
      { label: 'Total collecté', value: fmt(totalCollecte) },
      { label: 'Cotisations', value: cotisations.length.toString() },
      { label: 'En attente', value: nbAttente.toString() },
    ];
    const cardW = (W - 20) / 3;
    cards.forEach((card, i) => {
      const x = 50 + i * (cardW + 10);
      doc.rect(x, y, cardW, 52).fill('#f8fafc').stroke('#e2e8f0');
      doc.fillColor('#64748b').fontSize(8).font('Helvetica').text(card.label, x + 10, y + 10, { width: cardW - 20 });
      doc.fillColor('#0f172a').fontSize(14).font('Helvetica-Bold').text(card.value, x + 10, y + 24, { width: cardW - 20 });
      doc.fillColor('#000000');
    });

    // ── Table header ──
    y = 212;
    const cols = [
      { label: '#',          w: 28 },
      { label: 'Membre',     w: 130 },
      { label: 'Séance',     w: 76 },
      { label: 'Montant',    w: 82 },
      { label: 'Mode',       w: 88 },
      { label: 'Statut',     w: 91 },
    ];
    doc.rect(50, y, W, 20).fill('#1e293b');
    let cx = 50;
    cols.forEach(col => {
      doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold')
         .text(col.label, cx + 5, y + 6, { width: col.w - 8, align: 'left' });
      cx += col.w;
    });

    // ── Lignes ──
    y += 20;
    if (cotisations.length === 0) {
      doc.fillColor('#64748b').fontSize(10).font('Helvetica')
         .text('Aucune cotisation trouvée.', 50, y + 15, { width: W, align: 'center' });
    }

    cotisations.forEach((c, idx) => {
      if (y > 750) { doc.addPage(); y = 50; }
      const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
      doc.rect(50, y, W, 18).fill(bg).stroke('#e2e8f0');

      const statutColor = { approved: '#16a34a', pending: '#d97706', rejected: '#dc2626' };
      const cells = [
        { text: String(idx + 1),                            color: '#64748b' },
        { text: `${c.prenom ?? ''} ${c.nom ?? ''}`.trim(), color: '#0f172a' },
        { text: fmtDate(c.date_seance),                     color: '#475569' },
        { text: fmt(c.montant),                             color: '#0f172a' },
        { text: modeLabel[c.mode_paiement] ?? c.mode_paiement, color: '#475569' },
        { text: statutLabel[c.statut] ?? c.statut,          color: statutColor[c.statut] ?? '#475569' },
      ];

      cx = 50;
      cells.forEach((cell, ci) => {
        doc.fillColor(cell.color).fontSize(8).font(ci === 1 ? 'Helvetica-Bold' : 'Helvetica')
           .text(cell.text, cx + 5, y + 5, { width: cols[ci].w - 8, align: 'left', lineBreak: false });
        cx += cols[ci].w;
      });
      y += 18;
    });

    // ── Pied de page ──
    doc.fillColor('#94a3b8').fontSize(7).font('Helvetica')
       .text(`Dahira App • ${cotisations.length} cotisation${cotisations.length > 1 ? 's' : ''}`, 50, 820, { width: W, align: 'center' });

    doc.end();
  } catch (err) { next(err); }
};

const rejeterCotisationValidation = [
  body('note').optional()
];

const getDashboardValidation = [
  query('seance_id').optional().isInt().withMessage('seance_id doit être un entier')
];

const relancerController = async (req, res, next) => {
  try {
    const jours = Math.max(1, parseInt(req.body.jours ?? 3, 10));
    const { dahiraNom, membres } = await getMembresPendingRelance(req.dahira_id, jours);

    let envoyes = 0;
    let sansEmail = 0;
    const erreurs = [];

    for (const m of membres) {
      if (!m.email) { sansEmail++; continue; }
      try {
        await sendRelanceEmail(m.email, m.prenom, dahiraNom, m.cotisations);
        envoyes++;
      } catch (e) {
        erreurs.push(`${m.prenom} ${m.nom} : ${e.message}`);
      }
    }

    return res.json({
      success: true,
      data: {
        envoyes,
        sansEmail,
        total: membres.length,
        erreurs: erreurs.length > 0 ? erreurs : undefined,
      },
    });
  } catch (err) { next(err); }
};

module.exports = {
  encaisserCotisationController,
  encaisserCotisationsBatchController,
  declarerCotisationController,
  getAllCotisationsController,
  getPendingCotisationsController,
  validerCotisationController,
  rejeterCotisationController,
  getMesCotisationsController,
  getDashboardController,
  exportPdfController,
  relancerController,
  encaisserCotisationValidation,
  encaisserCotisationsBatchValidation,
  declarerCotisationValidation,
  rejeterCotisationValidation,
  getDashboardValidation,
  getAllCotisationsValidation
};
