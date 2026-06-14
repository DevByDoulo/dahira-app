const express = require('express');
const router = express.Router();
const {
  getAllMembresController,
  getMembreByIdController,
  createMembreController,
  updateMembreController,
  desactiverMembreController,
  createMembreValidation,
  updateMembreValidation
} = require('./membres.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const tenantMiddleware = require('../../middlewares/tenant.middleware');
const allowRoles = require('../../middlewares/role.middleware');
const { ROLES } = require('../../constants/roles');

/**
 * @swagger
 * /api/membres:
 *   get:
 *     summary: Lister tous les membres
 *     description: Retourne la liste de tous les membres du dahira avec leur statut de cotisation
 *     tags: [Membres]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des membres récupérée avec succès
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
 *                       prenom:
 *                         type: string
 *                         example: "Amadou"
 *                       telephone:
 *                         type: string
 *                         example: "221771234567"
 *                       telephone_secours:
 *                         type: string
 *                         nullable: true
 *                         example: "221779876543"
 *                       photo_url:
 *                         type: string
 *                         nullable: true
 *                         example: "/uploads/photos/membre1.jpg"
 *                       date_adhesion:
 *                         type: string
 *                         format: date
 *                         nullable: true
 *                         example: "2024-01-15"
 *                       responsabilites:
 *                         type: string
 *                         nullable: true
 *                         example: "Trésorier"
 *                       actif:
 *                         type: boolean
 *                         example: true
 *                       statut_cotisation:
 *                         type: string
 *                         enum: [a_jour, en_retard]
 *                         example: "a_jour"
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Rôle insuffisant
 */
router.get('/', authMiddleware, tenantMiddleware, allowRoles(ROLES.BUREAU, ROLES.TRESORIER), getAllMembresController);

/**
 * @swagger
 * /api/membres/{id}:
 *   get:
 *     summary: Obtenir les détails d'un membre
 *     description: Retourne les informations complètes d'un membre spécifique
 *     tags: [Membres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du membre
 *     responses:
 *       200:
 *         description: Membre récupéré avec succès
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
 *                     nom:
 *                       type: string
 *                       example: "Diallo"
 *                     prenom:
 *                       type: string
 *                       example: "Amadou"
 *                     telephone:
 *                       type: string
 *                       example: "221771234567"
 *                     telephone_secours:
 *                       type: string
 *                       nullable: true
 *                       example: "221779876543"
 *                     photo_url:
 *                       type: string
 *                       nullable: true
 *                       example: "/uploads/photos/membre1.jpg"
 *                     date_adhesion:
 *                       type: string
 *                       format: date
 *                       nullable: true
 *                       example: "2024-01-15"
 *                     responsabilites:
 *                       type: string
 *                       nullable: true
 *                       example: "Trésorier"
 *                     actif:
 *                       type: boolean
 *                       example: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Rôle insuffisant
 *       404:
 *         description: Membre non trouvé
 */
router.get('/:id', authMiddleware, tenantMiddleware, getMembreByIdController);

/**
 * @swagger
 * /api/membres:
 *   post:
 *     summary: Créer un nouveau membre
 *     description: Crée une nouvelle fiche membre dans le dahira
 *     tags: [Membres]
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
 *               - prenom
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "Diallo"
 *               prenom:
 *                 type: string
 *                 example: "Amadou"
 *               telephone:
 *                 type: string
 *                 example: "221771234567"
 *               telephone_secours:
 *                 type: string
 *                 example: "221779876543"
 *               photo_url:
 *                 type: string
 *                 example: "/uploads/photos/membre1.jpg"
 *               date_adhesion:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-15"
 *               responsabilites:
 *                 type: string
 *                 example: "Trésorier"
 *     responses:
 *       201:
 *         description: Membre créé avec succès
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
 *                     nom:
 *                       type: string
 *                       example: "Diallo"
 *                     prenom:
 *                       type: string
 *                       example: "Amadou"
 *                     telephone:
 *                       type: string
 *                       example: "221771234567"
 *                     telephone_secours:
 *                       type: string
 *                       example: "221779876543"
 *                     photo_url:
 *                       type: string
 *                       example: "/uploads/photos/membre1.jpg"
 *                     date_adhesion:
 *                       type: string
 *                       format: date
 *                       example: "2024-01-15"
 *                     responsabilites:
 *                       type: string
 *                       example: "Trésorier"
 *                     actif:
 *                       type: boolean
 *                       example: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Rôle insuffisant
 */
router.post('/', authMiddleware, tenantMiddleware, allowRoles(ROLES.BUREAU), createMembreValidation, createMembreController);

/**
 * @swagger
 * /api/membres/{id}:
 *   put:
 *     summary: Mettre à jour un membre
 *     description: Met à jour les informations d'un membre existant
 *     tags: [Membres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du membre
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - prenom
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "Diallo"
 *               prenom:
 *                 type: string
 *                 example: "Amadou"
 *               telephone:
 *                 type: string
 *                 example: "221771234567"
 *               telephone_secours:
 *                 type: string
 *                 example: "221779876543"
 *               photo_url:
 *                 type: string
 *                 example: "/uploads/photos/membre1.jpg"
 *               date_adhesion:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-15"
 *               responsabilites:
 *                 type: string
 *                 example: "Trésorier"
 *     responses:
 *       200:
 *         description: Membre mis à jour avec succès
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
 *                     nom:
 *                       type: string
 *                       example: "Diallo"
 *                     prenom:
 *                       type: string
 *                       example: "Amadou"
 *                     telephone:
 *                       type: string
 *                       example: "221771234567"
 *                     telephone_secours:
 *                       type: string
 *                       example: "221779876543"
 *                     photo_url:
 *                       type: string
 *                       example: "/uploads/photos/membre1.jpg"
 *                     date_adhesion:
 *                       type: string
 *                       format: date
 *                       example: "2024-01-15"
 *                     responsabilites:
 *                       type: string
 *                       example: "Trésorier"
 *                     actif:
 *                       type: boolean
 *                       example: true
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
 *         description: Membre non trouvé
 */
router.put('/:id', authMiddleware, tenantMiddleware, allowRoles(ROLES.BUREAU), updateMembreValidation, updateMembreController);

/**
 * @swagger
 * /api/membres/{id}/desactiver:
 *   patch:
 *     summary: Désactiver un membre
 *     description: Désactive un membre (soft delete, ne supprime pas la ligne)
 *     tags: [Membres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du membre
 *     responses:
 *       200:
 *         description: Membre désactivé avec succès
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
 *                     nom:
 *                       type: string
 *                       example: "Diallo"
 *                     prenom:
 *                       type: string
 *                       example: "Amadou"
 *                     telephone:
 *                       type: string
 *                       example: "221771234567"
 *                     telephone_secours:
 *                       type: string
 *                       example: "221779876543"
 *                     photo_url:
 *                       type: string
 *                       example: "/uploads/photos/membre1.jpg"
 *                     date_adhesion:
 *                       type: string
 *                       format: date
 *                       example: "2024-01-15"
 *                     responsabilites:
 *                       type: string
 *                       example: "Trésorier"
 *                     actif:
 *                       type: boolean
 *                       example: false
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Rôle insuffisant
 *       404:
 *         description: Membre non trouvé
 */
router.patch('/:id/desactiver', authMiddleware, tenantMiddleware, allowRoles(ROLES.BUREAU), desactiverMembreController);

module.exports = router;
