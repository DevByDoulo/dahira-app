const { getAllUsers, createUser, updateUser, desactiverUser } = require('./users.service');
const { success, error } = require('../../utils/response');
const { body, validationResult } = require('express-validator');

const getAllUsersController = async (req, res, next) => {
  try {
    const users = await getAllUsers(req.dahira_id);
    return success(res, users, 200);
  } catch (err) {
    next(err);
  }
};

const createUserController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg, 400);
    }

    const user = await createUser(req.dahira_id, req.body);
    return success(res, user, 201);
  } catch (err) {
    next(err);
  }
};

const updateUserController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg, 400);
    }

    const { id } = req.params;
    const user = await updateUser(id, req.dahira_id, req.body);
    return success(res, user, 200);
  } catch (err) {
    next(err);
  }
};

const desactiverUserController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await desactiverUser(id, req.dahira_id);
    return success(res, user, 200);
  } catch (err) {
    next(err);
  }
};

const createUserValidation = [
  body('nom').notEmpty().withMessage('Le nom est requis'),
  body('telephone').notEmpty().withMessage('Le téléphone est requis'),
  body('password').notEmpty().withMessage('Le mot de passe est requis'),
  body('role')
    .notEmpty().withMessage('Le rôle est requis')
    .isIn(['membre', 'tresorier', 'bureau']).withMessage('Le rôle doit être membre, tresorier ou bureau')
];

const updateUserValidation = [
  body('nom').notEmpty().withMessage('Le nom est requis'),
  body('role')
    .optional()
    .isIn(['membre', 'tresorier', 'bureau']).withMessage('Le rôle doit être membre, tresorier ou bureau')
];

module.exports = {
  getAllUsersController,
  createUserController,
  updateUserController,
  desactiverUserController,
  createUserValidation,
  updateUserValidation
};
