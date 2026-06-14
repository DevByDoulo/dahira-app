const express = require('express');
const router = express.Router();
const {
  requestPasswordResetController,
  verifyResetTokenController,
  resetPasswordController,
  requestPasswordResetValidation,
  resetPasswordValidation
} = require('./password-reset.controller');

/**
 * @swagger
 * /api/password-reset/request:
 *   post:
 *     summary: Demander une réinitialisation de mot de passe
 *     description: Envoie un email avec un lien de réinitialisation (endpoint public)
 *     tags: [Password Reset]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - telephone
 *             properties:
 *               telephone:
 *                 type: string
 *                 example: "221771234567"
 *     responses:
 *       200:
 *         description: Email envoyé avec succès
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Compte non trouvé
 */
router.post('/request', requestPasswordResetValidation, requestPasswordResetController);

/**
 * @swagger
 * /api/password-reset/verify/{token}:
 *   get:
 *     summary: Vérifier un token de réinitialisation
 *     description: Vérifie la validité d'un token (endpoint public)
 *     tags: [Password Reset]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Token valide
 *       400:
 *         description: Token invalide ou expiré
 */
router.get('/verify/:token', verifyResetTokenController);

/**
 * @swagger
 * /api/password-reset/reset:
 *   post:
 *     summary: Réinitialiser le mot de passe
 *     description: Change le mot de passe avec un token valide (endpoint public)
 *     tags: [Password Reset]
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
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: "nouveauMotDePasse123"
 *     responses:
 *       200:
 *         description: Mot de passe réinitialisé avec succès
 *       400:
 *         description: Erreur de validation ou token invalide
 */
router.post('/reset', resetPasswordValidation, resetPasswordController);

module.exports = router;
