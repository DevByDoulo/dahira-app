const {
  getSolde,
  getTransactions,
  getEvolution,
  getPrevisions,
  getAlertes
} = require('./tresorerie.service');
const { success, error } = require('../../utils/response');

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
      limit: parseInt(req.query.limit) || 50,
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

module.exports = {
  getSoldeController,
  getTransactionsController,
  getEvolutionController,
  getPrevisionsController,
  getAlertesController
};
