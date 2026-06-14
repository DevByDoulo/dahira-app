const express = require('express');
const router = express.Router();
const {
  enregistrerPresenceController,
  enregistrerPresencesBatchController,
  getPresencesSeanceController,
  getStatistiquesMembreController,
  getStatistiquesGlobalesController,
  marquerAbsenceController,
  supprimerPresenceController,
  genererFeuillePresenceController,
  presenceValidation,
  presencesBatchValidation
} = require('./presences.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const tenantMiddleware = require('../../middlewares/tenant.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

// Toutes les routes nécessitent authentification
router.use(authMiddleware);
router.use(tenantMiddleware);

/**
 * @swagger
 * /api/presences:
 *   post:
 *     summary: Enregistrer une présence
 *     description: Enregistrer la présence d'un membre à une séance
 *     tags: [Présences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - seance_id
 *               - membre_id
 *             properties:
 *               seance_id:
 *                 type: integer
 *               membre_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Présence enregistrée
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non authentifié
 */
router.post('/', roleMiddleware(['bureau', 'tresorier']), presenceValidation, enregistrerPresenceController);

/**
 * @swagger
 * /api/presences/batch:
 *   post:
 *     summary: Enregistrer plusieurs présences
 *     description: Enregistrer la présence de plusieurs membres en une fois
 *     tags: [Présences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - seance_id
 *               - membre_ids
 *             properties:
 *               seance_id:
 *                 type: integer
 *               membre_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       201:
 *         description: Présences enregistrées
 *       400:
 *         description: Erreur de validation
 */
router.post('/batch', roleMiddleware(['bureau', 'tresorier']), presencesBatchValidation, enregistrerPresencesBatchController);

/**
 * @swagger
 * /api/presences/seance/{seance_id}:
 *   get:
 *     summary: Récupérer les présences d'une séance
 *     description: Liste des membres présents à une séance
 *     tags: [Présences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: seance_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Présences récupérées
 *       401:
 *         description: Non authentifié
 */
router.get('/seance/:seance_id', getPresencesSeanceController);

/**
 * @swagger
 * /api/presences/membre/{membre_id}/stats:
 *   get:
 *     summary: Statistiques de présence d'un membre
 *     description: Taux de présence et historique d'un membre
 *     tags: [Présences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: membre_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Statistiques récupérées
 *       401:
 *         description: Non authentifié
 */
router.get('/membre/:membre_id/stats', getStatistiquesMembreController);

/**
 * @swagger
 * /api/presences/stats:
 *   get:
 *     summary: Statistiques globales de présence
 *     description: Statistiques globales ou par séance
 *     tags: [Présences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: seance_id
 *         schema:
 *           type: integer
 *         description: Filtrer par séance (optionnel)
 *     responses:
 *       200:
 *         description: Statistiques récupérées
 *       401:
 *         description: Non authentifié
 */
router.get('/stats', getStatistiquesGlobalesController);

/**
 * @swagger
 * /api/presences/absence:
 *   post:
 *     summary: Marquer une absence
 *     description: Enregistrer l'absence d'un membre à une séance
 *     tags: [Présences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - seance_id
 *               - membre_id
 *             properties:
 *               seance_id:
 *                 type: integer
 *               membre_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Absence enregistrée
 *       400:
 *         description: Erreur de validation
 */
router.post('/absence', roleMiddleware(['bureau', 'tresorier']), presenceValidation, marquerAbsenceController);

/**
 * @swagger
 * /api/presences/{id}:
 *   delete:
 *     summary: Supprimer une présence
 *     description: Supprimer l'enregistrement d'une présence
 *     tags: [Présences]
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
 *         description: Présence supprimée
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
router.delete('/:id', roleMiddleware(['bureau', 'tresorier']), supprimerPresenceController);

/**
 * @swagger
 * /api/presences/feuille/{seance_id}:
 *   get:
 *     summary: Générer une feuille de présence
 *     description: Feuille de présence avec tous les membres (présents, absents, non enregistrés)
 *     tags: [Présences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: seance_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Feuille de présence générée
 *       401:
 *         description: Non authentifié
 */
router.get('/feuille/:seance_id', genererFeuillePresenceController);

module.exports = router;
