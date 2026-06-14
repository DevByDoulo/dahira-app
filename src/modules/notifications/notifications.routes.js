const express = require('express');
const router = express.Router();
const {
  getUserNotificationsController,
  markAsReadController,
  markAllAsReadController,
  deleteNotificationController,
  notifyAllMembersController,
  sendSeanceRemindersController,
  sendCotisationRetardAlertsController,
  notifyAllValidation
} = require('./notifications.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const tenantMiddleware = require('../../middlewares/tenant.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const { ROLES } = require('../../constants/roles');

// Toutes les routes nécessitent authentification
router.use(authMiddleware);
router.use(tenantMiddleware);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Récupérer les notifications de l'utilisateur
 *     description: Liste des notifications avec compteur de non lues
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Nombre de notifications
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Offset pour la pagination
 *     responses:
 *       200:
 *         description: Notifications récupérées
 *       401:
 *         description: Non authentifié
 */
router.get('/', getUserNotificationsController);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Marquer une notification comme lue
 *     description: Marquer une notification spécifique comme lue
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notification marquée comme lue
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Notification non trouvée
 */
router.patch('/:id/read', markAsReadController);

/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     summary: Marquer toutes les notifications comme lues
 *     description: Marquer toutes les notifications de l'utilisateur comme lues
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications marquées comme lues
 *       401:
 *         description: Non authentifié
 */
router.patch('/read-all', markAllAsReadController);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Supprimer une notification
 *     description: Supprimer une notification spécifique
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notification supprimée
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Notification non trouvée
 */
router.delete('/:id', deleteNotificationController);

/**
 * @swagger
 * /api/notifications/notify-all:
 *   post:
 *     summary: Notifier tous les membres
 *     description: Envoyer une notification à tous les membres du dahira (Bureau uniquement)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - title
 *               - message
 *             properties:
 *               type:
 *                 type: string
 *                 example: "message_bureau"
 *               title:
 *                 type: string
 *                 example: "Annonce importante"
 *               message:
 *                 type: string
 *                 example: "La prochaine séance est reportée"
 *               link:
 *                 type: string
 *                 example: "/annonces/123"
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Notifications envoyées
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
router.post('/notify-all', roleMiddleware(ROLES.BUREAU), notifyAllValidation, notifyAllMembersController);

/**
 * @swagger
 * /api/notifications/seance-reminders:
 *   post:
 *     summary: Envoyer les rappels de séance
 *     description: Envoyer des rappels pour les séances qui ont lieu dans 24h (Bureau uniquement)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rappels envoyés
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
router.post('/seance-reminders', roleMiddleware(ROLES.BUREAU), sendSeanceRemindersController);

/**
 * @swagger
 * /api/notifications/cotisation-retard:
 *   post:
 *     summary: Envoyer les alertes de cotisation en retard
 *     description: Alerter les membres dont la cotisation du mois n'est pas à jour (Bureau/Trésorier)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Alertes envoyées
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
router.post('/cotisation-retard', roleMiddleware(ROLES.BUREAU, ROLES.TRESORIER), sendCotisationRetardAlertsController);

module.exports = router;
