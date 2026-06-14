const {
  createDahira,
  getAllDahiras,
  getDahiraById,
  updateDahira,
  desactiverDahira,
  activerDahira,
  deleteDahira
} = require('./dahiras.service');
const { success, error } = require('../../utils/response');
const { body, validationResult } = require('express-validator');

/**
 * Créer un dahira
 */
const createDahiraController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg, 400);
    }

    const dahira = await createDahira(req.body);
    return success(res, dahira, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Récupérer tous les dahiras
 */
const getAllDahirasController = async (req, res, next) => {
  try {
    const filters = {
      actif: req.query.actif,
      limit: req.query.limit,
      offset: req.query.offset
    };

    const result = await getAllDahiras(filters);
    return success(res, result, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Récupérer un dahira par ID
 */
const getDahiraByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const dahira = await getDahiraById(id);
    return success(res, dahira, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Mettre à jour un dahira
 */
const updateDahiraController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg, 400);
    }

    const { id } = req.params;

    const dahira = await updateDahira(id, req.body);
    return success(res, dahira, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Désactiver un dahira
 */
const desactiverDahiraController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await desactiverDahira(id);
    return success(res, result, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Activer un dahira
 */
const activerDahiraController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await activerDahira(id);
    return success(res, result, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Supprimer un dahira
 */
const deleteDahiraController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await deleteDahira(id);
    return success(res, result, 200);
  } catch (err) {
    next(err);
  }
};

// Validations
const createDahiraValidation = [
  body('nom').notEmpty().withMessage('Nom du dahira requis'),
  body('telephone').optional().isMobilePhone().withMessage('Numéro de téléphone invalide'),
  body('email').optional().isEmail().withMessage('Email invalide')
];

const updateDahiraValidation = [
  body('nom').optional().notEmpty().withMessage('Nom du dahira ne peut pas être vide'),
  body('telephone').optional().isMobilePhone().withMessage('Numéro de téléphone invalide'),
  body('email').optional().isEmail().withMessage('Email invalide'),
  body('actif').optional().isBoolean().withMessage('Actif doit être un booléen')
];

module.exports = {
  createDahiraController,
  getAllDahirasController,
  getDahiraByIdController,
  updateDahiraController,
  desactiverDahiraController,
  activerDahiraController,
  deleteDahiraController,
  createDahiraValidation,
  updateDahiraValidation
};
