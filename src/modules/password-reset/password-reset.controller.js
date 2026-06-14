const {
  requestPasswordReset,
  verifyResetToken,
  resetPassword
} = require('./password-reset.service');
const { success, error } = require('../../utils/response');
const { body, validationResult } = require('express-validator');

const requestPasswordResetController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg, 400);
    }

    const result = await requestPasswordReset(req.body.telephone);
    return success(res, result, 200);
  } catch (err) {
    next(err);
  }
};

const verifyResetTokenController = async (req, res, next) => {
  try {
    const { token } = req.params;
    const result = await verifyResetToken(token);
    return success(res, result, 200);
  } catch (err) {
    next(err);
  }
};

const resetPasswordController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg, 400);
    }

    const result = await resetPassword(req.body.token, req.body.password);
    return success(res, result, 200);
  } catch (err) {
    next(err);
  }
};

const requestPasswordResetValidation = [
  body('telephone').notEmpty().withMessage('Numéro de téléphone requis')
];

const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Token requis'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères')
];

module.exports = {
  requestPasswordResetController,
  verifyResetTokenController,
  resetPasswordController,
  requestPasswordResetValidation,
  resetPasswordValidation
};
