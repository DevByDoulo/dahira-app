const {
  getAllMembres,
  getMembresAvecCompte,
  getMembreById,
  createMembre,
  updateMembre,
  updateRole,
  desactiverMembre,
  activerMembre,
  updateMembrePhoto,
} = require('./membres.service');
const { success, error } = require('../../utils/response');
const { body, validationResult } = require('express-validator');
const upload = require('../../middlewares/upload.middleware');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const pool = require('../../config/db');

const UPLOADS_BASE = path.resolve(__dirname, '..', '..', '..', 'uploads');

const getAllMembresController = async (req, res, next) => {
  try {
    const membres = await getAllMembres(req.dahira_id);
    return success(res, membres, 200);
  } catch (err) {
    next(err);
  }
};

const getMembresAvecCompteController = async (req, res, next) => {
  try {
    const membres = await getMembresAvecCompte(req.dahira_id);
    return success(res, membres, 200);
  } catch (err) {
    next(err);
  }
};

const getMembreByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;

    if (role !== 'secretaire_general' && role !== 'adjoint' && role !== 'tresorier' && userId !== parseInt(id)) {
      return error(res, 'Rôle insuffisant pour accéder à cette ressource', 403);
    }

    const membre = await getMembreById(id, req.dahira_id);
    return success(res, membre, 200);
  } catch (err) {
    next(err);
  }
};

const createMembreController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return error(res, errors.array()[0].msg, 400);

    const membre = await createMembre(req.dahira_id, req.body);
    return success(res, membre, 201);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return error(res, 'Ce numéro de téléphone est déjà utilisé', 409);
    if (err.code === 'ER_DUP_EMAIL') return error(res, err.message, 409);
    next(err);
  }
};

const updateMembreController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return error(res, errors.array()[0].msg, 400);

    const { id } = req.params;
    const membre = await updateMembre(id, req.dahira_id, req.body, req.user);
    return success(res, membre, 200);
  } catch (err) {
    if (err.message.startsWith('Action non autorisée')) return error(res, err.message, 403);
    if (err.code === 'ER_DUP_EMAIL') return error(res, err.message, 409);
    next(err);
  }
};

const updateRoleController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!role) return error(res, 'Le rôle est requis', 400);
    const membre = await updateRole(id, req.dahira_id, role, req.user);
    return success(res, membre, 200);
  } catch (err) {
    if (err.message.startsWith('Action non autorisée')) return error(res, err.message, 403);
    next(err);
  }
};

const desactiverMembreController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const membre = await desactiverMembre(id, req.dahira_id, req.user);
    return success(res, membre, 200);
  } catch (err) {
    if (err.message.startsWith('Action non autorisée')) return error(res, err.message, 403);
    next(err);
  }
};

const activerMembreController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const membre = await activerMembre(id, req.dahira_id, req.user);
    return success(res, membre, 200);
  } catch (err) {
    if (err.message.startsWith('Action non autorisée')) return error(res, err.message, 403);
    next(err);
  }
};

const uploadMembrePhotoController = [
  upload.single('photo'),
  async (req, res, next) => {
    try {
      if (!req.file) return error(res, 'Aucun fichier fourni', 400);

      const uploadsDir = path.join(process.cwd(), 'uploads', 'membres');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

      const { id } = req.params;
      const filename = `membre_${id}_${Date.now()}`;
      const photoPath = path.join(uploadsDir, `${filename}.webp`);
      const thumbPath = path.join(uploadsDir, `${filename}_thumb.webp`);

      await sharp(req.file.buffer).resize(800, 800, { fit: 'inside' }).webp({ quality: 85 }).toFile(photoPath);
      await sharp(req.file.buffer).resize(150, 150, { fit: 'cover' }).webp({ quality: 80 }).toFile(thumbPath);

      const photoUrl = `/uploads/membres/${filename}.webp`;
      const thumbnailUrl = `/uploads/membres/${filename}_thumb.webp`;

      const membre = await updateMembrePhoto(id, req.dahira_id, photoUrl, thumbnailUrl);
      return success(res, membre, 200);
    } catch (err) {
      next(err);
    }
  },
];

const createMembreValidation = [
  body('nom').notEmpty().withMessage('Le nom est requis'),
  body('telephone').notEmpty().withMessage('Le téléphone est requis'),
];

const updateMembreValidation = [
  body('nom').notEmpty().withMessage('Le nom est requis'),
  body('telephone').notEmpty().withMessage('Le téléphone est requis'),
];

const fichePdfController = async (req, res, next) => {
  try {
    const membreId = parseInt(req.params.id, 10);

    const [[membre]] = await pool.query(
      `SELECT id, nom, prenom, telephone, telephone_secours, email, role, actif,
              photo_url, date_adhesion, date_naissance, responsabilites, sexe, created_at
       FROM membres WHERE id = ? AND dahira_id = ?`,
      [membreId, req.dahira_id]
    );
    if (!membre) return error(res, 'Membre introuvable', 404);

    const [[dahira]] = await pool.query('SELECT nom FROM dahiras WHERE id = ?', [req.dahira_id]);

    const [cotisations] = await pool.query(
      `SELECT c.montant, c.mode_paiement, c.statut, s.date_seance, s.type
       FROM cotisations c
       JOIN seances s ON c.seance_id = s.id
       WHERE c.membre_id = ? AND c.dahira_id = ?
       ORDER BY s.date_seance DESC LIMIT 20`,
      [membreId, req.dahira_id]
    );

    const fmt = (n) =>
      Math.round(Number(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';
    const fmtDate = (d) =>
      d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
    const modeLabel = { especes: 'Espèces', wave: 'Wave', orange_money: 'Orange Money' };
    const roleLabel = { secretaire_general: 'Secrétaire Général', adjoint: 'Adjoint', tresorier: 'Trésorier', membre: 'Membre', responsable_org: 'Responsable' };

    const cotisApprouvees = cotisations.filter(c => c.statut === 'approved');
    const totalCotise = cotisApprouvees.reduce((s, c) => s + Number(c.montant), 0);

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    const nomFichier = `fiche-${membre.prenom}-${membre.nom}.pdf`.replace(/\s+/g, '-').toLowerCase();
    res.setHeader('Content-Disposition', `attachment; filename="${nomFichier}"`);
    doc.pipe(res);

    const W = 495;

    // ── En-tête ──────────────────────────────────────────────────────────────
    doc.rect(50, 50, W, 68).fill('#0f172a');
    doc.fillColor('#ffffff').fontSize(9).font('Helvetica')
       .text(dahira?.nom ?? 'Dahira', 66, 58);
    doc.fontSize(18).font('Helvetica-Bold')
       .text('Fiche Membre', 66, 70);
    doc.fontSize(8).font('Helvetica')
       .text(`Généré le ${fmtDate(new Date().toISOString())}`, 66, 92);

    // ── Card membre ──────────────────────────────────────────────────────────
    let y = 138;
    doc.rect(50, y, W, 90).fill('#f8fafc').stroke('#e2e8f0');

    // Avatar (photo ou initiales)
    const avatarX = 66, avatarY = y + 15, avatarR = 30;
    let photoOk = false;
    if (membre.photo_url) {
      const photoAbs = path.join(UPLOADS_BASE, membre.photo_url.replace(/^\/uploads\//, ''));
      if (fs.existsSync(photoAbs)) {
        try {
          doc.save();
          doc.circle(avatarX + avatarR, avatarY + avatarR, avatarR).clip();
          doc.image(photoAbs, avatarX, avatarY, { width: avatarR * 2, height: avatarR * 2 });
          doc.restore();
          photoOk = true;
        } catch (_) {}
      }
    }
    if (!photoOk) {
      doc.circle(avatarX + avatarR, avatarY + avatarR, avatarR).fill('#cbd5e1');
      const initiales = `${(membre.prenom ?? '?')[0]}${(membre.nom ?? '?')[0]}`.toUpperCase();
      doc.fillColor('#475569').fontSize(16).font('Helvetica-Bold')
         .text(initiales, avatarX, avatarY + avatarR - 10, { width: avatarR * 2, align: 'center' });
    }

    // Infos texte à droite de l'avatar
    const infoX = avatarX + avatarR * 2 + 16;
    doc.fillColor('#0f172a').fontSize(15).font('Helvetica-Bold')
       .text(`${membre.prenom} ${membre.nom}`, infoX, y + 14, { width: 260 });

    const badgeColor = membre.actif ? '#16a34a' : '#94a3b8';
    const badgeLabel = membre.actif ? 'Actif' : 'Inactif';
    doc.fillColor(badgeColor).fontSize(8).font('Helvetica-Bold')
       .text(`● ${badgeLabel}  ·  ${roleLabel[membre.role] ?? membre.role}`, infoX, y + 33);

    doc.fillColor('#475569').fontSize(8).font('Helvetica');
    const col2X = infoX + 185;
    doc.text(`Tél : ${membre.telephone ?? '—'}`, infoX, y + 48);
    doc.text(`Adhésion : ${fmtDate(membre.date_adhesion)}`, infoX, y + 60);
    if (membre.responsabilites) {
      doc.text(`Rôle : ${membre.responsabilites}`, col2X, y + 48, { width: 140 });
    }
    if (membre.email) {
      doc.text(membre.email, col2X, y + 60, { width: 140 });
    }

    // ── KPI ──────────────────────────────────────────────────────────────────
    y += 106;
    const cards = [
      { label: 'Total cotisé',             value: fmt(totalCotise),              color: '#16a34a' },
      { label: 'Cotisations validées',      value: String(cotisApprouvees.length), color: '#0f172a' },
    ];
    const cW = (W - 10) / 2;
    cards.forEach((card, i) => {
      const x = 50 + i * (cW + 10);
      doc.rect(x, y, cW, 52).fill('#ffffff').stroke('#e2e8f0');
      doc.fillColor('#64748b').fontSize(7.5).font('Helvetica')
         .text(card.label, x + 10, y + 10, { width: cW - 14 });
      doc.fillColor(card.color).fontSize(14).font('Helvetica-Bold')
         .text(card.value, x + 10, y + 25, { width: cW - 14 });
    });

    // ── Tableau cotisations ───────────────────────────────────────────────────
    y += 68;
    doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold')
       .text(`Historique des cotisations (${cotisations.length})`, 50, y);
    y += 18;

    if (cotisations.length === 0) {
      doc.rect(50, y, W, 28).fill('#f8fafc').stroke('#e2e8f0');
      doc.fillColor('#94a3b8').fontSize(9).font('Helvetica')
         .text('Aucune cotisation enregistrée.', 60, y + 9);
      y += 36;
    } else {
      const cols = [
        { label: 'Date séance', w: 110 },
        { label: 'Type',        w: 110 },
        { label: 'Montant',     w: 115 },
        { label: 'Mode',        w: 100 },
        { label: 'Statut',      w: 60  },
      ];
      doc.rect(50, y, W, 20).fill('#1e293b');
      let cx = 50;
      cols.forEach(col => {
        doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold')
           .text(col.label, cx + 6, y + 6, { width: col.w - 8, lineBreak: false });
        cx += col.w;
      });
      y += 20;

      const statutColor = { approved: '#16a34a', pending: '#d97706', rejected: '#dc2626' };
      const statutLabel2 = { approved: 'Validée', pending: 'En attente', rejected: 'Rejetée' };
      const typeLabel = {
        hebdomadaire: 'Hebdo', mensuelle: 'Mensuelle', gamou: 'Gamou',
        magal: 'Magal', safar: 'Safar', adiya: 'Adiya', autre: 'Autre',
      };

      cotisations.forEach((c, idx) => {
        if (y > 760) { doc.addPage(); y = 50; }
        doc.rect(50, y, W, 17).fill(idx % 2 === 0 ? '#ffffff' : '#f8fafc').stroke('#e2e8f0');
        const cells = [
          { text: fmtDate(c.date_seance).replace(/ /g, ' '), color: '#475569' },
          { text: typeLabel[c.type] ?? c.type,                    color: '#475569' },
          { text: fmt(c.montant),                                  color: '#0f172a' },
          { text: modeLabel[c.mode_paiement] ?? c.mode_paiement,  color: '#475569' },
          { text: statutLabel2[c.statut] ?? c.statut,             color: statutColor[c.statut] ?? '#475569' },
        ];
        cx = 50;
        cells.forEach((cell, ci) => {
          doc.fillColor(cell.color).fontSize(8)
             .font(ci === 2 ? 'Helvetica-Bold' : 'Helvetica')
             .text(cell.text, cx + 6, y + 4, { width: cols[ci].w - 10, lineBreak: false });
          cx += cols[ci].w;
        });
        y += 17;
      });
    }

    // ── Pied de page ─────────────────────────────────────────────────────────
    doc.fillColor('#94a3b8').fontSize(7).font('Helvetica')
       .text(`Dahira App  •  ${dahira?.nom ?? ''}  •  ${membre.prenom} ${membre.nom}`, 50, 828, { width: W, align: 'center' });

    doc.end();
  } catch (err) { next(err); }
};

module.exports = {
  getAllMembresController,
  getMembresAvecCompteController,
  getMembreByIdController,
  createMembreController,
  updateMembreController,
  updateRoleController,
  desactiverMembreController,
  activerMembreController,
  uploadMembrePhotoController,
  fichePdfController,
  createMembreValidation,
  updateMembreValidation,
};
