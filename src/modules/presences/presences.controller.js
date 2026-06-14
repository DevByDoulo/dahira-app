const {
  enregistrerPresence,
  enregistrerPresencesBatch,
  getPresencesSeance,
  getStatistiquesMembre,
  getStatistiquesGlobales,
  marquerAbsence,
  supprimerPresence,
  genererFeuillePresence
} = require('./presences.service');
const { success, error } = require('../../utils/response');
const { body, validationResult } = require('express-validator');

/**
 * Enregistrer une présence
 */
const enregistrerPresenceController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg, 400);
    }

    const dahiraId = req.user.dahira_id;
    const enregistrePar = req.user.id;
    const { seance_id, membre_id } = req.body;

    const presence = await enregistrerPresence(seance_id, membre_id, dahiraId, enregistrePar);
    return success(res, presence, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Enregistrer plusieurs présences en masse
 */
const enregistrerPresencesBatchController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg, 400);
    }

    const dahiraId = req.user.dahira_id;
    const enregistrePar = req.user.id;
    const { seance_id, membre_ids } = req.body;

    const result = await enregistrerPresencesBatch(seance_id, membre_ids, dahiraId, enregistrePar);
    return success(res, result, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Récupérer les présences d'une séance
 */
const getPresencesSeanceController = async (req, res, next) => {
  try {
    const dahiraId = req.user.dahira_id;
    const { seance_id } = req.params;

    const presences = await getPresencesSeance(seance_id, dahiraId);
    return success(res, presences, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Récupérer les statistiques de présence d'un membre
 */
const getStatistiquesMembreController = async (req, res, next) => {
  try {
    const dahiraId = req.user.dahira_id;
    const { membre_id } = req.params;

    const stats = await getStatistiquesMembre(membre_id, dahiraId);
    return success(res, stats, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Récupérer les statistiques globales
 */
const getStatistiquesGlobalesController = async (req, res, next) => {
  try {
    const dahiraId = req.user.dahira_id;
    const seanceId = req.query.seance_id || null;

    const stats = await getStatistiquesGlobales(dahiraId, seanceId);
    return success(res, stats, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Marquer une absence
 */
const marquerAbsenceController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg, 400);
    }

    const dahiraId = req.user.dahira_id;
    const enregistrePar = req.user.id;
    const { seance_id, membre_id } = req.body;

    const presence = await marquerAbsence(seance_id, membre_id, dahiraId, enregistrePar);
    return success(res, presence, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Supprimer une présence
 */
const supprimerPresenceController = async (req, res, next) => {
  try {
    const dahiraId = req.user.dahira_id;
    const { id } = req.params;

    const result = await supprimerPresence(id, dahiraId);
    return success(res, result, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Générer une feuille de présence
 */
const genererFeuillePresenceController = async (req, res, next) => {
  try {
    const dahiraId = req.user.dahira_id;
    const { seance_id } = req.params;

    const feuille = await genererFeuillePresence(seance_id, dahiraId);
    return success(res, feuille, 200);
  } catch (err) {
    next(err);
  }
};

// Validations
const presenceValidation = [
  body('seance_id').isInt().withMessage('ID de séance invalide'),
  body('membre_id').isInt().withMessage('ID de membre invalide')
];

const presencesBatchValidation = [
  body('seance_id').isInt().withMessage('ID de séance invalide'),
  body('membre_ids').isArray().withMessage('Liste de membres requise'),
  body('membre_ids.*').isInt().withMessage('IDs de membres invalides')
];

module.exports = {
  enregistrerPresenceController,
  enregistrerPresencesBatchController,
  getPresencesSeanceController,
  getStatistiquesMembreController,
  getStatistiquesGlobalesController,
  marquerAbsenceController,
  supprimerPresenceController,
  genererFeuillePresenceController,
  presenceValidation,
  presencesBatchValidation
};
