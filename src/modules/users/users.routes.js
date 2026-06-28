const express = require('express');
const router = express.Router();
const {
  getAllUsersController,
  getUserByMembreIdController,
  createUserController,
  updateUserController,
  desactiverUserController,
  activerUserController,
  updateMeController,
  updateNotificationPrefsController,
  createUserValidation,
  updateUserValidation
} = require('./users.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const tenantMiddleware = require('../../middlewares/tenant.middleware');
const allowRoles = require('../../middlewares/role.middleware');
const { ROLES } = require('../../constants/roles');

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lister tous les comptes utilisateurs
 *     description: Retourne la liste de tous les comptes utilisateurs du dahira (sans mot de passe)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       nom:
 *                         type: string
 *                         example: "Diallo"
 *                       telephone:
 *                         type: string
 *                         example: "221771234567"
 *                       email:
 *                         type: string
 *                         nullable: true
 *                         example: "diallo@example.com"
 *                       role:
 *                         type: string
 *                         enum: [membre, tresorier, bureau]
 *                         example: "bureau"
 *                       actif:
 *                         type: boolean
 *                         example: true
 *                       membre_id:
 *                         type: integer
 *                         nullable: true
 *                         example: 1
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Rôle insuffisant
 */
// Routes statiques avant /:id
router.patch('/me', authMiddleware, tenantMiddleware, updateMeController);
router.patch('/me/preferences', authMiddleware, tenantMiddleware, updateNotificationPrefsController);
router.get('/by-membre/:membre_id', authMiddleware, tenantMiddleware, allowRoles(ROLES.BUREAU), getUserByMembreIdController);

router.get('/', authMiddleware, tenantMiddleware, allowRoles(ROLES.BUREAU), getAllUsersController);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Créer un nouveau compte utilisateur
 *     description: Crée un nouveau compte utilisateur dans le dahira avec mot de passe hashé
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - telephone
 *               - password
 *               - role
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "Diallo"
 *               telephone:
 *                 type: string
 *                 example: "221771234567"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               role:
 *                 type: string
 *                 enum: [membre, tresorier, bureau]
 *                 example: "membre"
 *               email:
 *                 type: string
 *                 example: "diallo@example.com"
 *               membre_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
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
 *                     nom:
 *                       type: string
 *                       example: "Diallo"
 *                     telephone:
 *                       type: string
 *                       example: "221771234567"
 *                     email:
 *                       type: string
 *                       example: "diallo@example.com"
 *                     role:
 *                       type: string
 *                       example: "membre"
 *                     actif:
 *                       type: boolean
 *                       example: true
 *                     membre_id:
 *                       type: integer
 *                       example: 1
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Erreur de validation ou téléphone déjà utilisé
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Rôle insuffisant
 *       404:
 *         description: Membre non trouvé (si membre_id fourni)
 */
router.post('/', authMiddleware, tenantMiddleware, allowRoles(ROLES.BUREAU), createUserValidation, createUserController);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Mettre à jour un compte utilisateur
 *     description: Met à jour les informations d'un compte utilisateur (pas le mot de passe)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "Diallo"
 *               email:
 *                 type: string
 *                 example: "diallo@example.com"
 *               role:
 *                 type: string
 *                 enum: [membre, tresorier, bureau]
 *                 example: "tresorier"
 *               membre_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour avec succès
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
 *                     nom:
 *                       type: string
 *                       example: "Diallo"
 *                     telephone:
 *                       type: string
 *                       example: "221771234567"
 *                     email:
 *                       type: string
 *                       example: "diallo@example.com"
 *                     role:
 *                       type: string
 *                       example: "tresorier"
 *                     actif:
 *                       type: boolean
 *                       example: true
 *                     membre_id:
 *                       type: integer
 *                       example: 1
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Rôle insuffisant
 *       404:
 *         description: Utilisateur ou membre non trouvé
 */
router.put('/:id', authMiddleware, tenantMiddleware, allowRoles(ROLES.BUREAU), updateUserValidation, updateUserController);

/**
 * @swagger
 * /api/users/{id}/desactiver:
 *   patch:
 *     summary: Désactiver un compte utilisateur
 *     description: Désactive un compte utilisateur (soft delete, ne supprime pas la ligne)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur désactivé avec succès
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
 *                     nom:
 *                       type: string
 *                       example: "Diallo"
 *                     telephone:
 *                       type: string
 *                       example: "221771234567"
 *                     email:
 *                       type: string
 *                       example: "diallo@example.com"
 *                     role:
 *                       type: string
 *                       example: "membre"
 *                     actif:
 *                       type: boolean
 *                       example: false
 *                     membre_id:
 *                       type: integer
 *                       example: 1
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Rôle insuffisant
 *       404:
 *         description: Utilisateur non trouvé
 */
router.patch('/:id/desactiver', authMiddleware, tenantMiddleware, allowRoles(ROLES.BUREAU), desactiverUserController);
router.patch('/:id/activer', authMiddleware, tenantMiddleware, allowRoles(ROLES.BUREAU), activerUserController);

module.exports = router;
