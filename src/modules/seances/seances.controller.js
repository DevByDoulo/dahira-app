const { createSeance, getAllSeances, getSeanceCourante, cloturerSeance } = require('./seances.service');
const { success, error } = require('../../utils/response');
const { body, validationResult, query } = require('express-validator');

const createSeanceController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg, 400);
    }

    const seance = await createSeance(req.dahira_id, req.body);
    return success(res, seance, 201);
  } catch (err) {
    next(err);
  }
};

const getAllSeancesController = async (req, res, next) => {
  try {
    const { type } = req.query;
    const seances = await getAllSeances(req.dahira_id, type);
    return success(res, seances, 200);
  } catch (err) {
    next(err);
  }
};

const getSeanceCouranteController = async (req, res, next) => {
  try {
    const seance = await getSeanceCourante(req.dahira_id);
    return success(res, seance, 200);
  } catch (err) {
    next(err);
  }
};

const cloturerSeanceController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const seance = await cloturerSeance(id, req.dahira_id);
    return success(res, seance, 200);
  } catch (err) {
    next(err);
  }
};

const createSeanceValidation = [
  body('date_seance').notEmpty().withMessage('La date de séance est requise'),
  body('type')
    .notEmpty().withMessage('Le type est requis')
    .isIn(['hebdomadaire', 'gamou', 'magal', 'safar', 'adiya', 'autre'])
    .withMessage('Le type doit être hebdomadaire, gamou, magal, safar, adiya ou autre')
];

const getAllSeancesValidation = [
  query('type')
    .optional()
    .isIn(['hebdomadaire', 'gamou', 'magal', 'safar', 'adiya', 'autre'])
    .withMessage('Le type doit être hebdomadaire, gamou, magal, safar, adiya ou autre')
];

module.exports = {
  createSeanceController,
  getAllSeancesController,
  getSeanceCouranteController,
  cloturerSeanceController,
  createSeanceValidation,
  getAllSeancesValidation
};
