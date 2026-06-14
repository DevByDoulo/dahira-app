const {
  createNotification,
  createBulkNotifications,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  notifyAllMembers,
  sendSeanceReminders,
  sendCotisationRetardAlerts
} = require('./notifications.service');
const { success, error } = require('../../utils/response');
const { body, validationResult } = require('express-validator');

/**
 * Récupérer les notifications de l'utilisateur
 */
const getUserNotificationsController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const result = await getUserNotifications(userId, limit, offset);
    return success(res, result, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Marquer une notification comme lue
 */
const markAsReadController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await markAsRead(id, userId);
    return success(res, result, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Marquer toutes les notifications comme lues
 */
const markAllAsReadController = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await markAllAsRead(userId);
    return success(res, result, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Supprimer une notification
 */
const deleteNotificationController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await deleteNotification(id, userId);
    return success(res, result, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Notifier tous les membres (Bureau uniquement)
 */
const notifyAllMembersController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg, 400);
    }

    const dahiraId = req.user.dahira_id;
    const { type, title, message, link, metadata } = req.body;

    const result = await notifyAllMembers(dahiraId, {
      type,
      title,
      message,
      link,
      metadata
    });

    return success(res, result, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Envoyer les rappels de séance (Bureau uniquement)
 */
const sendSeanceRemindersController = async (req, res, next) => {
  try {
    const result = await sendSeanceReminders();
    return success(res, result, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Envoyer les alertes de cotisation en retard (Bureau/Trésorier)
 */
const sendCotisationRetardAlertsController = async (req, res, next) => {
  try {
    const dahiraId = req.user.dahira_id;

    const result = await sendCotisationRetardAlerts(dahiraId);
    return success(res, result, 200);
  } catch (err) {
    next(err);
  }
};

// Validations
const notifyAllValidation = [
  body('type').notEmpty().withMessage('Type de notification requis'),
  body('title').notEmpty().withMessage('Titre requis'),
  body('message').notEmpty().withMessage('Message requis')
];

module.exports = {
  getUserNotificationsController,
  markAsReadController,
  markAllAsReadController,
  deleteNotificationController,
  notifyAllMembersController,
  sendSeanceRemindersController,
  sendCotisationRetardAlertsController,
  notifyAllValidation
};
