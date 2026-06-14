const {
  getAllEvenements,
  getEvenementById,
  createEvenement,
  updateEvenement,
  deleteEvenement
} = require('./evenements.service');
const { success, error } = require('../../utils/response');
const { body, validationResult } = require('express-validator');

const getAllEvenementsController = async (req, res, next) => {
  try {
    const evenements = await getAllEvenements(req.dahira_id, req.user.membre_id);
    return success(res, evenements, 200);
  } catch (err) {
    next(err);
  }
};

const getEvenementByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const evenement = await getEvenementById(id, req.dahira_id, req.user.membre_id);
    return success(res, evenement, 200);
  } catch (err) {
    next(err);
  }
};

const createEvenementController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg, 400);
    }

    const evenement = await createEvenement(req.dahira_id, req.body, req.user.id);
    return success(res, evenement, 201);
  } catch (err) {
    next(err);
  }
};

const updateEvenementController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg, 400);
    }

    const { id } = req.params;
    const evenement = await updateEvenement(id, req.dahira_id, req.body);
    return success(res, evenement, 200);
  } catch (err) {
    next(err);
  }
};

const deleteEvenementController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await deleteEvenement(id, req.dahira_id);
    return success(res, result, 200);
  } catch (err) {
    next(err);
  }
};

const createEvenementValidation = [
  body('titre').notEmpty().withMessage('Le titre est requis'),
  body('date_evenement').notEmpty().withMessage('La date de l\'événement est requise'),
  body('description').optional(),
  body('heure').optional(),
  body('lieu').optional(),
  body('photo_url').optional()
];

const updateEvenementValidation = [
  body('titre').notEmpty().withMessage('Le titre est requis'),
  body('date_evenement').notEmpty().withMessage('La date de l\'événement est requise'),
  body('description').optional(),
  body('heure').optional(),
  body('lieu').optional(),
  body('photo_url').optional()
];

module.exports = {
  getAllEvenementsController,
  getEvenementByIdController,
  createEvenementController,
  updateEvenementController,
  deleteEvenementController,
  createEvenementValidation,
  updateEvenementValidation
};
