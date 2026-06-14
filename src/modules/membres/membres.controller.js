const { getAllMembres, getMembreById, createMembre, updateMembre, desactiverMembre } = require('./membres.service');
const { success, error } = require('../../utils/response');
const { body, validationResult } = require('express-validator');

const getAllMembresController = async (req, res, next) => {
  try {
    const membres = await getAllMembres(req.dahira_id);
    return success(res, membres, 200);
  } catch (err) {
    next(err);
  }
};

const getMembreByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id: userId, role, membre_id: userMembreId } = req.user;

    // Check if user has permission: bureau, tresorier, or accessing own member data
    if (role !== 'bureau' && role !== 'tresorier' && userMembreId !== parseInt(id)) {
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
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg, 400);
    }

    const membre = await createMembre(req.dahira_id, req.body);
    return success(res, membre, 201);
  } catch (err) {
    next(err);
  }
};

const updateMembreController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg, 400);
    }

    const { id } = req.params;
    const membre = await updateMembre(id, req.dahira_id, req.body);
    return success(res, membre, 200);
  } catch (err) {
    next(err);
  }
};

const desactiverMembreController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const membre = await desactiverMembre(id, req.dahira_id);
    return success(res, membre, 200);
  } catch (err) {
    next(err);
  }
};

const createMembreValidation = [
  body('nom').notEmpty().withMessage('Le nom est requis'),
  body('prenom').notEmpty().withMessage('Le prénom est requis')
];

const updateMembreValidation = [
  body('nom').notEmpty().withMessage('Le nom est requis'),
  body('prenom').notEmpty().withMessage('Le prénom est requis')
];

module.exports = {
  getAllMembresController,
  getMembreByIdController,
  createMembreController,
  updateMembreController,
  desactiverMembreController,
  createMembreValidation,
  updateMembreValidation
};
