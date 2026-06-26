const path = require('path');
const fsSync = require('fs');
const {
  genererRecuPDF,
  envoyerRecuEmail,
  enregistrerRecu,
  getRecuByCotisation,
  getRecusMembre,
  getRecusDahira,
  getRecuForDownload,
  genererPDFSeance
} = require('./recus.service');
const { success, error } = require('../../utils/response');

/**
 * Générer un reçu PDF pour une cotisation
 */
const genererRecuController = async (req, res, next) => {
  try {
    const dahiraId = req.user.dahira_id;
    const { cotisation_id } = req.params;

    const recu = await genererRecuPDF(cotisation_id, dahiraId);
    await enregistrerRecu(cotisation_id, dahiraId, recu.fichier_path, recu.numero_recu);
    return success(res, { numero_recu: recu.numero_recu }, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Générer et envoyer un reçu par email
 */
const envoyerRecuController = async (req, res, next) => {
  try {
    const dahiraId = req.user.dahira_id;
    const { cotisation_id } = req.params;

    const result = await envoyerRecuEmail(cotisation_id, dahiraId);
    return success(res, result, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Récupérer un reçu par cotisation
 */
const getRecuByCotisationController = async (req, res, next) => {
  try {
    const dahiraId = req.user.dahira_id;
    const { cotisation_id } = req.params;

    const recu = await getRecuByCotisation(cotisation_id, dahiraId);
    return success(res, recu, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Récupérer tous les reçus d'un membre
 */
const getRecusMembreController = async (req, res, next) => {
  try {
    const dahiraId = req.user.dahira_id;
    const { membre_id } = req.params;

    const recus = await getRecusMembre(membre_id, dahiraId);
    return success(res, recus, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Lister tous les reçus du dahira
 */
const getRecusDahiraController = async (req, res, next) => {
  try {
    const dahiraId = req.user.dahira_id;
    const recus = await getRecusDahira(dahiraId);
    return success(res, recus, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Télécharger / ouvrir le PDF d'un reçu par son ID
 */
const downloadRecuController = async (req, res, next) => {
  try {
    const dahiraId = req.user.dahira_id;
    const { id } = req.params;

    const recu = await getRecuForDownload(id, dahiraId);

    const filename = path.basename(recu.fichier_path);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    const stream = fsSync.createReadStream(recu.fichier_path);
    stream.on('error', next);
    stream.pipe(res);
  } catch (err) {
    next(err);
  }
};

/**
 * Créer un reçu depuis le corps de la requête { cotisation_id }
 */
const creerRecuController = async (req, res, next) => {
  try {
    const dahiraId = req.user.dahira_id;
    const { cotisation_id } = req.body;

    if (!cotisation_id) {
      return res.status(400).json({ success: false, message: 'cotisation_id est requis' });
    }

    const recuData = await genererRecuPDF(cotisation_id, dahiraId);
    await enregistrerRecu(cotisation_id, dahiraId, recuData.fichier_path, recuData.numero_recu);

    return success(res, { numero_recu: recuData.numero_recu }, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Générer et streamer un PDF récapitulatif d'une séance
 */
const getRecusSeanceController = async (req, res, next) => {
  try {
    const dahiraId = req.user.dahira_id;
    const { seance_id } = req.params;
    const pdfBuffer = await genererPDFSeance(seance_id, dahiraId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="seance-${seance_id}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  genererRecuController,
  envoyerRecuController,
  getRecuByCotisationController,
  getRecusMembreController,
  getRecusDahiraController,
  downloadRecuController,
  creerRecuController,
  getRecusSeanceController
};
