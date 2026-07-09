const {
  getSolde,
  getTransactions,
  getEvolution,
  getPrevisions,
  getAlertes,
  getRapportMensuel
} = require('./tresorerie.service');
const { success, error } = require('../../utils/response');
const PDFDocument = require('pdfkit');

/**
 * Récupérer le solde actuel
 */
const getSoldeController = async (req, res, next) => {
  try {
    const dahiraId = req.user.dahira_id;
    const solde = await getSolde(dahiraId);
    return success(res, solde, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Récupérer l'historique des transactions
 */
const getTransactionsController = async (req, res, next) => {
  try {
    const dahiraId = req.user.dahira_id;
    const filters = {
      type: req.query.type,
      mode_paiement: req.query.mode_paiement,
      date_debut: req.query.date_debut,
      date_fin: req.query.date_fin,
      limit: req.query.limit === 'all' ? 0 : parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0
    };

    const transactions = await getTransactions(dahiraId, filters);
    return success(res, transactions, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Récupérer l'évolution de la trésorerie
 */
const getEvolutionController = async (req, res, next) => {
  try {
    const dahiraId = req.user.dahira_id;
    const periode = req.query.periode || 'mois'; // jour, semaine, mois
    const evolution = await getEvolution(dahiraId, periode);
    return success(res, evolution, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Récupérer les prévisions de trésorerie
 */
const getPrevisionsController = async (req, res, next) => {
  try {
    const dahiraId = req.user.dahira_id;
    const moisFuturs = parseInt(req.query.mois) || 3;
    const previsions = await getPrevisions(dahiraId, moisFuturs);
    return success(res, previsions, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Récupérer les alertes trésorerie
 */
const getAlertesController = async (req, res, next) => {
  try {
    const dahiraId = req.user.dahira_id;
    const alertes = await getAlertes(dahiraId);
    return success(res, alertes, 200);
  } catch (err) {
    next(err);
  }
};

const getRapportMensuelController = async (req, res, next) => {
  try {
    const { mois } = req.query;
    if (!mois || !/^\d{4}-\d{2}$/.test(mois)) {
      return error(res, 'Le paramètre mois est requis au format YYYY-MM', 400);
    }

    const data = await getRapportMensuel(req.dahira_id, mois);

    const fmt = (n) =>
      Math.round(Number(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';
    const fmtDate = (d) =>
      d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
    const modeLabel = { especes: 'Espèces', wave: 'Wave', orange_money: 'Orange Money' };
    const categorieLabel = {
      alimentation: 'Alimentation', transport: 'Transport', location: 'Location',
      materiel: 'Matériel', communication: 'Communication', don: 'Don',
      maintenance: 'Maintenance', autre: 'Autre'
    };

    const [annee, moisNum] = mois.split('-');
    const moisNoms = ['Janvier','Février','Mars','Avril','Mai','Juin',
                      'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
    const moisLabel = `${moisNoms[parseInt(moisNum, 10) - 1]} ${annee}`;

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="rapport-${mois}.pdf"`);
    doc.pipe(res);

    const W = 495;

    // ── En-tête ──────────────────────────────────────────────────────────────
    doc.rect(50, 50, W, 75).fill('#0f172a');
    doc.fillColor('#ffffff').fontSize(18).font('Helvetica-Bold')
       .text(data.dahiraNom, 66, 62, { width: W - 30 });
    doc.fontSize(12).font('Helvetica')
       .text(`Rapport Mensuel — ${moisLabel}`, 66, 84);
    doc.fontSize(8)
       .text(`Généré le ${fmtDate(new Date().toISOString())}`, 66, 101);
    doc.fillColor('#000000');

    // ── KPI ──────────────────────────────────────────────────────────────────
    let y = 147;
    const soldePos = data.soldeNet >= 0;
    const cards = [
      { label: 'Cotisations collectées', value: fmt(data.totalCotisations), color: '#16a34a' },
      { label: 'Dépenses validées',       value: fmt(data.totalDepenses),    color: '#dc2626' },
      { label: 'Solde net du mois',       value: fmt(Math.abs(data.soldeNet)), color: soldePos ? '#16a34a' : '#dc2626',
        prefix: soldePos ? '+' : '−' },
    ];
    const cW = (W - 20) / 3;
    cards.forEach((card, i) => {
      const x = 50 + i * (cW + 10);
      doc.rect(x, y, cW, 56).fill('#f8fafc').stroke('#e2e8f0');
      doc.fillColor('#64748b').fontSize(7.5).font('Helvetica')
         .text(card.label, x + 10, y + 10, { width: cW - 14 });
      doc.fillColor(card.color).fontSize(13).font('Helvetica-Bold')
         .text((card.prefix ?? '') + card.value, x + 10, y + 26, { width: cW - 14 });
    });

    // ── Section Cotisations ──────────────────────────────────────────────────
    y = 225;
    doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold').text('Cotisations', 50, y);
    doc.fillColor('#64748b').fontSize(8).font('Helvetica')
       .text(`${data.cotisations.length} paiement${data.cotisations.length !== 1 ? 's' : ''} validé${data.cotisations.length !== 1 ? 's' : ''}`, 50, y + 14);
    y += 30;

    if (data.cotisations.length === 0) {
      doc.rect(50, y, W, 28).fill('#f8fafc').stroke('#e2e8f0');
      doc.fillColor('#94a3b8').fontSize(9).font('Helvetica')
         .text('Aucune cotisation ce mois-ci.', 60, y + 9);
      y += 36;
    } else {
      const cCols = [
        { label: 'Membre',          w: 155 },
        { label: 'Date séance',     w: 90  },
        { label: 'Montant',         w: 120 },
        { label: 'Mode',            w: 130 },
      ];
      doc.rect(50, y, W, 20).fill('#1e293b');
      let cx = 50;
      cCols.forEach(col => {
        doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold')
           .text(col.label, cx + 6, y + 6, { width: col.w - 8, lineBreak: false });
        cx += col.w;
      });
      y += 20;

      data.cotisations.forEach((c, idx) => {
        if (y > 760) { doc.addPage(); y = 50; }
        doc.rect(50, y, W, 17).fill(idx % 2 === 0 ? '#ffffff' : '#f8fafc').stroke('#e2e8f0');
        const cells = [
          `${c.prenom ?? ''} ${c.nom ?? ''}`.trim(),
          fmtDate(c.date_seance),
          fmt(c.montant),
          modeLabel[c.mode_paiement] ?? c.mode_paiement,
        ];
        cx = 50;
        cells.forEach((text, ci) => {
          doc.fillColor(ci === 0 ? '#0f172a' : '#475569').fontSize(8)
             .font(ci === 0 ? 'Helvetica-Bold' : 'Helvetica')
             .text(text, cx + 6, y + 4, { width: cCols[ci].w - 10, lineBreak: false });
          cx += cCols[ci].w;
        });
        y += 17;
      });

      // Total cotisations
      doc.rect(50, y, W, 20).fill('#f0fdf4').stroke('#bbf7d0');
      doc.fillColor('#15803d').fontSize(8.5).font('Helvetica-Bold')
         .text('Total cotisations', 56, y + 6, { width: 250, lineBreak: false });
      doc.text(fmt(data.totalCotisations), 310, y + 6, { width: 230, align: 'right', lineBreak: false });
      y += 28;
    }

    // ── Section Dépenses ─────────────────────────────────────────────────────
    if (y > 680) { doc.addPage(); y = 50; }
    doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold').text('Dépenses', 50, y);
    doc.fillColor('#64748b').fontSize(8).font('Helvetica')
       .text(`${data.depenses.length} dépense${data.depenses.length !== 1 ? 's' : ''} validée${data.depenses.length !== 1 ? 's' : ''}`, 50, y + 14);
    y += 30;

    if (data.depenses.length === 0) {
      doc.rect(50, y, W, 28).fill('#f8fafc').stroke('#e2e8f0');
      doc.fillColor('#94a3b8').fontSize(9).font('Helvetica')
         .text('Aucune dépense ce mois-ci.', 60, y + 9);
      y += 36;
    } else {
      const dCols = [
        { label: 'Description',     w: 185 },
        { label: 'Catégorie',       w: 100 },
        { label: 'Date',            w: 90  },
        { label: 'Montant',         w: 120 },
      ];
      doc.rect(50, y, W, 20).fill('#1e293b');
      let cx = 50;
      dCols.forEach(col => {
        doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold')
           .text(col.label, cx + 6, y + 6, { width: col.w - 8, lineBreak: false });
        cx += col.w;
      });
      y += 20;

      data.depenses.forEach((d, idx) => {
        if (y > 760) { doc.addPage(); y = 50; }
        doc.rect(50, y, W, 17).fill(idx % 2 === 0 ? '#ffffff' : '#f8fafc').stroke('#e2e8f0');
        const cells = [
          d.description ?? '—',
          categorieLabel[d.categorie] ?? (d.categorie ?? '—'),
          fmtDate(d.date_depense),
          fmt(d.montant),
        ];
        cx = 50;
        cells.forEach((text, ci) => {
          doc.fillColor(ci === 0 ? '#0f172a' : '#475569').fontSize(8)
             .font(ci === 0 ? 'Helvetica-Bold' : 'Helvetica')
             .text(text, cx + 6, y + 4, { width: dCols[ci].w - 10, lineBreak: false });
          cx += dCols[ci].w;
        });
        y += 17;
      });

      // Total dépenses
      doc.rect(50, y, W, 20).fill('#fef2f2').stroke('#fecaca');
      doc.fillColor('#dc2626').fontSize(8.5).font('Helvetica-Bold')
         .text('Total dépenses', 56, y + 6, { width: 250, lineBreak: false });
      doc.text(fmt(data.totalDepenses), 310, y + 6, { width: 230, align: 'right', lineBreak: false });
      y += 28;
    }

    // ── Bilan final ──────────────────────────────────────────────────────────
    if (y > 740) { doc.addPage(); y = 50; }
    y += 4;
    const bilanColor = data.soldeNet >= 0 ? '#f0fdf4' : '#fef2f2';
    const bilanBorder = data.soldeNet >= 0 ? '#86efac' : '#fca5a5';
    const bilanText = data.soldeNet >= 0 ? '#15803d' : '#dc2626';
    doc.rect(50, y, W, 26).fill(bilanColor).stroke(bilanBorder);
    doc.fillColor(bilanText).fontSize(10).font('Helvetica-Bold')
       .text('Solde net du mois', 56, y + 8, { width: 250, lineBreak: false });
    const prefixe = data.soldeNet >= 0 ? '+' : '−';
    doc.text(`${prefixe}${fmt(Math.abs(data.soldeNet))}`, 310, y + 8, { width: 230, align: 'right', lineBreak: false });

    // ── Pied de page ─────────────────────────────────────────────────────────
    doc.fillColor('#94a3b8').fontSize(7).font('Helvetica')
       .text(`Dahira App  •  ${data.dahiraNom}  •  ${moisLabel}`, 50, 828, { width: W, align: 'center' });

    doc.end();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSoldeController,
  getTransactionsController,
  getEvolutionController,
  getPrevisionsController,
  getAlertesController,
  getRapportMensuelController
};
