const { login, getMe, changePassword } = require('./auth.service');
const { success, error } = require('../../utils/response');
const { body, validationResult } = require('express-validator');

const loginController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg, 400);
    }

    const { telephone, password } = req.body;
    const result = await login(telephone, password);
    return success(res, result, 200);
  } catch (err) {
    next(err);
  }
};

const getMeController = async (req, res, next) => {
  try {
    const user = await getMe(req.user.id);
    return success(res, user, 200);
  } catch (err) {
    next(err);
  }
};

const changePasswordController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg, 400);
    }

    const { ancien_password, nouveau_password } = req.body;
    const result = await changePassword(req.user.id, ancien_password, nouveau_password);
    return success(res, result, 200);
  } catch (err) {
    next(err);
  }
};

const loginValidation = [
  body('telephone').notEmpty().withMessage('Le téléphone est requis'),
  body('password').notEmpty().withMessage('Le mot de passe est requis')
];

const changePasswordValidation = [
  body('ancien_password').notEmpty().withMessage('L\'ancien mot de passe est requis'),
  body('nouveau_password')
    .isLength({ min: 6 })
    .withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères')
];

module.exports = {
  loginController,
  getMeController,
  changePasswordController,
  loginValidation,
  changePasswordValidation
};
