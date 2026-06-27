const {
  encaisserCotisation,
  encaisserCotisationsBatch,
  declarerCotisation,
  getAllCotisations,
  getPendingCotisations,
  validerCotisation,
  rejeterCotisation,
  getMesCotisations,
  getDashboard
} = require('./cotisations.service');
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

const rejeterCotisationValidation = [
  body('note').optional()
];

const getDashboardValidation = [
  query('seance_id').optional().isInt().withMessage('seance_id doit être un entier')
];

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
  encaisserCotisationValidation,
  encaisserCotisationsBatchValidation,
  declarerCotisationValidation,
  rejeterCotisationValidation,
  getDashboardValidation,
  getAllCotisationsValidation
};
