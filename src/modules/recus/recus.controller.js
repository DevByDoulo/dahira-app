const {
  genererRecuPDF,
  envoyerRecuEmail,
  getRecuByCotisation,
  getRecusMembre
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
    return success(res, recu, 200);
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

module.exports = {
  genererRecuController,
  envoyerRecuController,
  getRecuByCotisationController,
  getRecusMembreController
};
