const express = require('express');
const router = express.Router();
const {
  createSeanceController,
  getAllSeancesController,
  getSeanceCouranteController,
  getSeanceByIdController,
  updateSeanceController,
  uploadSeancePhotoController,
  cloturerSeanceController,
  createSeanceValidation,
  getAllSeancesValidation,
  updateSeanceValidation
} = require('./seances.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const tenantMiddleware = require('../../middlewares/tenant.middleware');
const allowRoles = require('../../middlewares/role.middleware');
const { ROLES } = require('../../constants/roles');

/**
 * @swagger
 * /api/seances:
 *   post:
 *     summary: Créer une nouvelle séance
 *     description: Crée une nouvelle séance dans le dahira
 *     tags: [Seances]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date_seance
 *               - type
 *             properties:
 *               date_seance:
 *                 type: string
 *                 format: date
 *                 example: "2024-06-14"
 *               type:
 *                 type: string
 *                 enum: [hebdomadaire, gamou, magal, safar, adiya, autre]
 *                 example: "hebdomadaire"
 *     responses:
 *       201:
 *         description: Séance créée avec succès
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
 *                     date_seance:
 *                       type: string
 *                       format: date
 *                       example: "2024-06-14"
 *                     type:
 *                       type: string
 *                       example: "hebdomadaire"
 *                     cloturee:
 *                       type: boolean
 *                       example: false
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Erreur de validation ou séance déjà existante
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Rôle insuffisant
 */
router.post('/', authMiddleware, tenantMiddleware, allowRoles(ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.RESPONSABLE_ORG), createSeanceValidation, createSeanceController);

/**
 * @swagger
 * /api/seances:
 *   get:
 *     summary: Lister toutes les séances
 *     description: Retourne la liste de toutes les séances du dahira, triées par date décroissante
 *     tags: [Seances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [hebdomadaire, gamou, magal, safar, adiya, autre]
 *         description: Filtrer par type de séance (optionnel)
 *     responses:
 *       200:
 *         description: Liste des séances récupérée avec succès
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
 *                       dahira_id:
 *                         type: integer
 *                         example: 1
 *                       date_seance:
 *                         type: string
 *                         format: date
 *                         example: "2024-06-14"
 *                       type:
 *                         type: string
 *                         example: "hebdomadaire"
 *                       cloturee:
 *                         type: boolean
 *                         example: false
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Rôle insuffisant
 */
router.get('/', authMiddleware, tenantMiddleware, allowRoles(ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER, ROLES.MEMBRE), getAllSeancesValidation, getAllSeancesController);

/**
 * @swagger
 * /api/seances/courante:
 *   get:
 *     summary: Obtenir la séance hebdomadaire courante
 *     description: Retourne la dernière séance hebdomadaire non clôturée (pour l'écran Séance du Vendredi)
 *     tags: [Seances]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Séance courante récupérée avec succès
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
 *                     date_seance:
 *                       type: string
 *                       format: date
 *                       example: "2024-06-14"
 *                     type:
 *                       type: string
 *                       example: "hebdomadaire"
 *                     cloturee:
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
 *         description: Aucune séance hebdomadaire en cours
 */
router.get('/courante', authMiddleware, tenantMiddleware, allowRoles(ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER, ROLES.RESPONSABLE_ORG), getSeanceCouranteController);

/**
 * @swagger
 * /api/seances/{id}/cloturer:
 *   patch:
 *     summary: Clôturer une séance
 *     description: Clôture une séance (passe cloturee = TRUE)
 *     tags: [Seances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la séance
 *     responses:
 *       200:
 *         description: Séance clôturée avec succès
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
 *                     date_seance:
 *                       type: string
 *                       format: date
 *                       example: "2024-06-14"
 *                     type:
 *                       type: string
 *                       example: "hebdomadaire"
 *                     cloturee:
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
 *         description: Séance non trouvée
 */
router.patch('/:id/cloturer', authMiddleware, tenantMiddleware, allowRoles(ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.RESPONSABLE_ORG), cloturerSeanceController);

router.get('/:id', authMiddleware, tenantMiddleware, allowRoles(ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER, ROLES.RESPONSABLE_ORG), getSeanceByIdController);

router.post('/:id/photo', authMiddleware, tenantMiddleware, allowRoles(ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.RESPONSABLE_ORG), uploadSeancePhotoController);

router.patch('/:id', authMiddleware, tenantMiddleware, allowRoles(ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.RESPONSABLE_ORG), updateSeanceValidation, updateSeanceController);

module.exports = router;

