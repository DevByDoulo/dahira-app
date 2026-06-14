const express = require('express');
const router = express.Router();
const {
  createInvitationController,
  getInvitationByTokenController,
  acceptInvitationController,
  getInvitationsController,
  cancelInvitationController,
  resendInvitationController,
  createInvitationValidation,
  acceptInvitationValidation
} = require('./invitations.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const tenantMiddleware = require('../../middlewares/tenant.middleware');
const allowRoles = require('../../middlewares/role.middleware');

/**
 * @swagger
 * /api/invitations:
 *   post:
 *     summary: Créer une invitation pour un membre
 *     description: Envoie un email d'invitation à un membre pour créer son compte utilisateur
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - membre_id
 *               - email
 *             properties:
 *               membre_id:
 *                 type: integer
 *                 example: 1
 *                 description: ID du membre à inviter
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "membre@example.com"
 *                 description: Email du membre
 *               role:
 *                 type: string
 *                 enum: [membre, tresorier, bureau]
 *                 default: membre
 *                 example: "membre"
 *                 description: Rôle à attribuer au membre
 *     responses:
 *       201:
 *         description: Invitation créée et envoyée avec succès
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Rôle insuffisant
 */
router.post(
  '/',
  authMiddleware,
  tenantMiddleware,
  allowRoles('bureau', 'tresorier'),
  createInvitationValidation,
  createInvitationController
);

/**
 * @swagger
 * /api/invitations:
 *   get:
 *     summary: Liste les invitations du dahira
 *     description: Retourne toutes les invitations du dahira avec possibilité de filtrer par statut
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [pending, accepted, expired, cancelled]
 *         description: Filtrer par statut d'invitation
 *     responses:
 *       200:
 *         description: Liste des invitations récupérée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Rôle insuffisant
 */
router.get(
  '/',
  authMiddleware,
  tenantMiddleware,
  allowRoles('bureau', 'tresorier'),
  getInvitationsController
);

/**
 * @swagger
 * /api/invitations/verify/{token}:
 *   get:
 *     summary: Vérifier un token d'invitation
 *     description: Récupère les informations publiques d'une invitation (endpoint public, pas d'authentification requise)
 *     tags: [Invitations]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token d'invitation
 *     responses:
 *       200:
 *         description: Invitation valide
 *       400:
 *         description: Invitation invalide ou expirée
 */
router.get('/verify/:token', getInvitationByTokenController);

/**
 * @swagger
 * /api/invitations/accept:
 *   post:
 *     summary: Accepter une invitation et créer un compte
 *     description: Permet à un membre invité de créer son compte utilisateur (endpoint public)
 *     tags: [Invitations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 example: "abc123def456..."
 *                 description: Token d'invitation reçu par email
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: "motdepasse123"
 *                 description: Mot de passe souhaité (minimum 6 caractères)
 *               telephone:
 *                 type: string
 *                 example: "221771234567"
 *                 description: Numéro de téléphone (optionnel, pour validation)
 *     responses:
 *       201:
 *         description: Compte créé avec succès, retourne le token JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: Token JWT pour connexion
 *                     user:
 *                       type: object
 *                       description: Informations de l'utilisateur créé
 *       400:
 *         description: Erreur de validation ou invitation invalide
 */
router.post('/accept', acceptInvitationValidation, acceptInvitationController);

/**
 * @swagger
 * /api/invitations/{id}/cancel:
 *   patch:
 *     summary: Annuler une invitation
 *     description: Annule une invitation en attente
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'invitation
 *     responses:
 *       200:
 *         description: Invitation annulée avec succès
 *       400:
 *         description: Invitation ne peut pas être annulée
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Rôle insuffisant
 *       404:
 *         description: Invitation non trouvée
 */
router.patch(
  '/:id/cancel',
  authMiddleware,
  tenantMiddleware,
  allowRoles('bureau', 'tresorier'),
  cancelInvitationController
);

/**
 * @swagger
 * /api/invitations/{id}/resend:
 *   post:
 *     summary: Renvoyer une invitation
 *     description: Génère un nouveau token et renvoie l'email d'invitation
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'invitation
 *     responses:
 *       200:
 *         description: Invitation renvoyée avec succès
 *       400:
 *         description: Invitation ne peut pas être renvoyée
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Rôle insuffisant
 *       404:
 *         description: Invitation non trouvée
 */
router.post(
  '/:id/resend',
  authMiddleware,
  tenantMiddleware,
  allowRoles('bureau', 'tresorier'),
  resendInvitationController
);

module.exports = router;
