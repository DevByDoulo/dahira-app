const express = require('express');
const router = express.Router();
const {
  loginController,
  getMeController,
  changePasswordController,
  registerDahiraController,
  loginValidation,
  changePasswordValidation,
  registerDahiraValidation,
} = require('./auth.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     description: Authentifie un utilisateur avec son téléphone et mot de passe, retourne un JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - telephone
 *               - password
 *             properties:
 *               telephone:
 *                 type: string
 *                 example: "221771234567"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Connexion réussie
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
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         dahira_id:
 *                           type: integer
 *                           example: 1
 *                         membre_id:
 *                           type: integer
 *                           nullable: true
 *                           example: 1
 *                         nom:
 *                           type: string
 *                           example: "Diallo"
 *                         telephone:
 *                           type: string
 *                           example: "221771234567"
 *                         email:
 *                           type: string
 *                           nullable: true
 *                           example: "diallo@example.com"
 *                         role:
 *                           type: string
 *                           enum: [membre, tresorier, bureau]
 *                           example: "bureau"
 *                         actif:
 *                           type: boolean
 *                           example: true
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Erreur de validation ou identifiants incorrects
 *       401:
 *         description: Compte désactivé
 */
router.post('/login', loginValidation, loginController);
router.post('/register', registerDahiraValidation, registerDahiraController);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtenir le profil utilisateur
 *     description: Retourne les informations de l'utilisateur connecté
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur récupéré avec succès
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
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     dahira_id:
 *                       type: integer
 *                       example: 1
 *                     membre_id:
 *                       type: integer
 *                       nullable: true
 *                       example: 1
 *                     nom:
 *                       type: string
 *                       example: "Diallo"
 *                     telephone:
 *                       type: string
 *                       example: "221771234567"
 *                     email:
 *                       type: string
 *                       nullable: true
 *                       example: "diallo@example.com"
 *                     role:
 *                       type: string
 *                       enum: [membre, tresorier, bureau]
 *                       example: "bureau"
 *                     actif:
 *                       type: boolean
 *                       example: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Token manquant ou invalide
 */
router.get('/me', authMiddleware, getMeController);

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Changer le mot de passe
 *     description: Permet à l'utilisateur connecté de changer son mot de passe
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ancien_password
 *               - nouveau_password
 *             properties:
 *               ancien_password:
 *                 type: string
 *                 example: "password123"
 *               nouveau_password:
 *                 type: string
 *                 minLength: 6
 *                 example: "newpassword456"
 *     responses:
 *       200:
 *         description: Mot de passe modifié avec succès
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
 *                     message:
 *                       type: string
 *                       example: "Mot de passe modifié avec succès"
 *       400:
 *         description: Erreur de validation ou ancien mot de passe incorrect
 *       401:
 *         description: Token manquant ou invalide
 */
router.patch('/change-password', authMiddleware, changePasswordValidation, changePasswordController);

module.exports = router;
