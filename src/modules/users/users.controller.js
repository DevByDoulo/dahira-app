const { getAllUsers, getUserByMembreId, createUser, updateUser, desactiverUser, activerUser, updateMe, updateNotificationPrefs } = require('./users.service');
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
    const user = await updateUser(id, req.dahira_id, req.body, req.user);
    return success(res, user, 200);
  } catch (err) {
    if (err.message.startsWith('Action non autorisée')) return error(res, err.message, 403);
    next(err);
  }
};

const desactiverUserController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await desactiverUser(id, req.dahira_id, req.user);
    return success(res, user, 200);
  } catch (err) {
    if (err.message.startsWith('Action non autorisée')) return error(res, err.message, 403);
    next(err);
  }
};

const getUserByMembreIdController = async (req, res, next) => {
  try {
    const { membre_id } = req.params;
    const user = await getUserByMembreId(membre_id, req.dahira_id);
    return success(res, user, 200);
  } catch (err) {
    next(err);
  }
};

const activerUserController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await activerUser(id, req.dahira_id, req.user);
    return success(res, user, 200);
  } catch (err) {
    if (err.message.startsWith('Action non autorisée')) return error(res, err.message, 403);
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

const updateMeController = async (req, res, next) => {
  try {
    const { nom, email, telephone } = req.body;
    if (!nom || !nom.trim()) {
      return error(res, 'Le nom est requis', 400);
    }
    const user = await updateMe(req.user.id, req.dahira_id, { nom: nom.trim(), email, telephone });
    return success(res, user, 200);
  } catch (err) {
    next(err);
  }
};

const updateNotificationPrefsController = async (req, res, next) => {
  try {
    const allowed = ['notif_email_cotisation', 'notif_email_seance', 'notif_email_relance'];
    const prefs = {};
    for (const key of allowed) {
      if (key in req.body) prefs[key] = !!req.body[key];
    }
    const user = await updateNotificationPrefs(req.user.id, req.dahira_id, prefs);
    return success(res, user, 200);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllUsersController,
  getUserByMembreIdController,
  createUserController,
  updateUserController,
  desactiverUserController,
  activerUserController,
  updateMeController,
  updateNotificationPrefsController,
  createUserValidation,
  updateUserValidation,
};
