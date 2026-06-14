const express = require('express');
const router = express.Router();
const {
  getAllEvenementsController,
  getEvenementByIdController,
  createEvenementController,
  updateEvenementController,
  deleteEvenementController,
  createEvenementValidation,
  updateEvenementValidation
} = require('./evenements.controller');
const {
  toggleInscriptionController,
  getParticipantsController,
  updatePresenceController,
  updatePresenceValidation
} = require('./participations.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const tenantMiddleware = require('../../middlewares/tenant.middleware');
const allowRoles = require('../../middlewares/role.middleware');
const { ROLES } = require('../../constants/roles');

/**
 * @swagger
 * /api/evenements:
 *   get:
 *     summary: Lister tous les événements
 *     description: Retourne la liste de tous les événements du dahira avec nombre d'inscrits et statut d'inscription de l'utilisateur
 *     tags: [Événements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des événements récupérée avec succès
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
 *                       titre:
 *                         type: string
 *                         example: "Gamou annuel"
 *                       description:
 *                         type: string
 *                         example: "Célébration du gamou annuel"
 *                       date_evenement:
 *                         type: string
 *                         format: date
 *                         example: "2024-07-15"
 *                       heure:
 *                         type: string
 *                         example: "18:00"
 *                       lieu:
 *                         type: string
 *                         example: "Salle des fêtes"
 *                       photo_url:
 *                         type: string
 *                         nullable: true
 *                         example: "https://example.com/photo.jpg"
 *                       cree_par:
 *                         type: integer
 *                         example: 1
 *                       nombre_inscrits:
 *                         type: integer
 *                         example: 45
 *                       mon_inscription:
 *                         type: boolean
 *                         example: true
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Non authentifié
 */
router.get('/', authMiddleware, tenantMiddleware, allowRoles(ROLES.MEMBRE, ROLES.TRESORIER, ROLES.BUREAU), getAllEvenementsController);

/**
 * @swagger
 * /api/evenements/{id}:
 *   get:
 *     summary: Obtenir un événement par ID
 *     description: Retourne les détails d'un événement spécifique avec nombre d'inscrits et statut d'inscription
 *     tags: [Événements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'événement
 *     responses:
 *       200:
 *         description: Événement récupéré avec succès
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
 *                     titre:
 *                       type: string
 *                       example: "Gamou annuel"
 *                     description:
 *                       type: string
 *                       example: "Célébration du gamou annuel"
 *                     date_evenement:
 *                       type: string
 *                       format: date
 *                       example: "2024-07-15"
 *                     heure:
 *                       type: string
 *                       example: "18:00"
 *                     lieu:
 *                       type: string
 *                       example: "Salle des fêtes"
 *                     photo_url:
 *                       type: string
 *                       nullable: true
 *                       example: "https://example.com/photo.jpg"
 *                     cree_par:
 *                       type: integer
 *                       example: 1
 *                     nombre_inscrits:
 *                       type: integer
 *                       example: 45
 *                     mon_inscription:
 *                       type: boolean
 *                       example: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Événement non trouvé
 */
router.get('/:id', authMiddleware, tenantMiddleware, allowRoles(ROLES.MEMBRE, ROLES.TRESORIER, ROLES.BUREAU), getEvenementByIdController);

/**
 * @swagger
 * /api/evenements:
 *   post:
 *     summary: Créer un nouvel événement
 *     description: Crée un nouvel événement dans le dahira
 *     tags: [Événements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titre
 *               - date_evenement
 *             properties:
 *               titre:
 *                 type: string
 *                 example: "Gamou annuel"
 *               description:
 *                 type: string
 *                 example: "Célébration du gamou annuel"
 *               date_evenement:
 *                 type: string
 *                 format: date
 *                 example: "2024-07-15"
 *               heure:
 *                 type: string
 *                 example: "18:00"
 *               lieu:
 *                 type: string
 *                 example: "Salle des fêtes"
 *               photo_url:
 *                 type: string
 *                 example: "https://example.com/photo.jpg"
 *     responses:
 *       201:
 *         description: Événement créé avec succès
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
 *                     titre:
 *                       type: string
 *                       example: "Gamou annuel"
 *                     description:
 *                       type: string
 *                       example: "Célébration du gamou annuel"
 *                     date_evenement:
 *                       type: string
 *                       format: date
 *                       example: "2024-07-15"
 *                     heure:
 *                       type: string
 *                       example: "18:00"
 *                     lieu:
 *                       type: string
 *                       example: "Salle des fêtes"
 *                     photo_url:
 *                       type: string
 *                       nullable: true
 *                       example: "https://example.com/photo.jpg"
 *                     cree_par:
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
 */
router.post('/', authMiddleware, tenantMiddleware, allowRoles(ROLES.BUREAU), createEvenementValidation, createEvenementController);

/**
 * @swagger
 * /api/evenements/{id}:
 *   put:
 *     summary: Mettre à jour un événement
 *     description: Met à jour les informations d'un événement existant
 *     tags: [Événements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'événement
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titre
 *               - date_evenement
 *             properties:
 *               titre:
 *                 type: string
 *                 example: "Gamou annuel - Mise à jour"
 *               description:
 *                 type: string
 *                 example: "Célébration du gamou annuel (nouvelle date)"
 *               date_evenement:
 *                 type: string
 *                 format: date
 *                 example: "2024-07-20"
 *               heure:
 *                 type: string
 *                 example: "19:00"
 *               lieu:
 *                 type: string
 *                 example: "Salle polyvalente"
 *               photo_url:
 *                 type: string
 *                 example: "https://example.com/new-photo.jpg"
 *     responses:
 *       200:
 *         description: Événement mis à jour avec succès
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
 *                     titre:
 *                       type: string
 *                       example: "Gamou annuel - Mise à jour"
 *                     description:
 *                       type: string
 *                       example: "Célébration du gamou annuel (nouvelle date)"
 *                     date_evenement:
 *                       type: string
 *                       format: date
 *                       example: "2024-07-20"
 *                     heure:
 *                       type: string
 *                       example: "19:00"
 *                     lieu:
 *                       type: string
 *                       example: "Salle polyvalente"
 *                     photo_url:
 *                       type: string
 *                       nullable: true
 *                       example: "https://example.com/new-photo.jpg"
 *                     cree_par:
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
 *         description: Événement non trouvé
 */
router.put('/:id', authMiddleware, tenantMiddleware, allowRoles(ROLES.BUREAU), updateEvenementValidation, updateEvenementController);

/**
 * @swagger
 * /api/evenements/{id}:
 *   delete:
 *     summary: Supprimer un événement
 *     description: Supprime un événement existant (CASCADE supprime aussi les participations)
 *     tags: [Événements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'événement
 *     responses:
 *       200:
 *         description: Événement supprimé avec succès
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
 *                       example: "Événement supprimé avec succès"
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Rôle insuffisant
 *       404:
 *         description: Événement non trouvé
 */
router.delete('/:id', authMiddleware, tenantMiddleware, allowRoles(ROLES.BUREAU), deleteEvenementController);

/**
 * @swagger
 * /api/evenements/{id}/inscription:
 *   post:
 *     summary: S'inscrire / Se désinscrire d'un événement
 *     description: Toggle l'inscription du membre connecté à l'événement
 *     tags: [Événements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'événement
 *     responses:
 *       200:
 *         description: Statut d'inscription mis à jour avec succès
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
 *                     inscrit:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Compte non lié à un membre
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Rôle insuffisant
 *       404:
 *         description: Événement non trouvé
 */
router.post('/:id/inscription', authMiddleware, tenantMiddleware, allowRoles(ROLES.MEMBRE, ROLES.TRESORIER, ROLES.BUREAU), toggleInscriptionController);

/**
 * @swagger
 * /api/evenements/{id}/participants:
 *   get:
 *     summary: Lister les participants d'un événement
 *     description: Retourne la liste des participants (inscrits ou présents) avec leur statut
 *     tags: [Événements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'événement
 *     responses:
 *       200:
 *         description: Liste des participants récupérée avec succès
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
 *                       membre_id:
 *                         type: integer
 *                         example: 1
 *                       nom:
 *                         type: string
 *                         example: "Diallo"
 *                       prenom:
 *                         type: string
 *                         example: "Amadou"
 *                       inscrit:
 *                         type: boolean
 *                         example: true
 *                       present:
 *                         type: boolean
 *                         nullable: true
 *                         example: null
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Rôle insuffisant
 *       404:
 *         description: Événement non trouvé
 */
router.get('/:id/participants', authMiddleware, tenantMiddleware, allowRoles(ROLES.BUREAU, ROLES.TRESORIER), getParticipantsController);

/**
 * @swagger
 * /api/evenements/{id}/presence/{membre_id}:
 *   patch:
 *     summary: Marquer la présence d'un membre
 *     description: Met à jour le statut de présence d'un membre pour un événement
 *     tags: [Événements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'événement
 *       - in: path
 *         name: membre_id
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
 *               - present
 *             properties:
 *               present:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Présence mise à jour avec succès
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
 *                     membre_id:
 *                       type: integer
 *                       example: 1
 *                     nom:
 *                       type: string
 *                       example: "Diallo"
 *                     prenom:
 *                       type: string
 *                       example: "Amadou"
 *                     inscrit:
 *                       type: boolean
 *                       example: true
 *                     present:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Rôle insuffisant
 *       404:
 *         description: Événement ou membre non trouvé
 */
router.patch('/:id/presence/:membre_id', authMiddleware, tenantMiddleware, allowRoles(ROLES.BUREAU, ROLES.TRESORIER), updatePresenceValidation, updatePresenceController);

module.exports = router;
