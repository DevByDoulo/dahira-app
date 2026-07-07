const express = require('express');
const router = express.Router();
const {
  getDashboardStatsController,
  getDashboardChartsController,
  getRecentActivityController,
  getComparativeStatsController
} = require('./dashboard.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const tenantMiddleware = require('../../middlewares/tenant.middleware');

// Toutes les routes nécessitent authentification
router.use(authMiddleware);
router.use(tenantMiddleware);

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Récupérer les statistiques du dashboard
 *     description: Statistiques globales (membres, cotisations, trésorerie, séances, etc.)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
 *       401:
 *         description: Non authentifié
 */
router.get('/stats', getDashboardStatsController);

/**
 * @swagger
 * /api/dashboard/charts:
 *   get:
 *     summary: Récupérer les données pour les graphiques
 *     description: Évolution trésorerie, cotisations, présences, etc.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Données des graphiques récupérées
 *       401:
 *         description: Non authentifié
 */
router.get('/charts', getDashboardChartsController);

/**
 * @swagger
 * /api/dashboard/activity:
 *   get:
 *     summary: Récupérer l'activité récente
 *     description: Liste des dernières activités (cotisations, nouveaux membres)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'activités à retourner
 *     responses:
 *       200:
 *         description: Activités récupérées
 *       401:
 *         description: Non authentifié
 */
router.get('/activity', getRecentActivityController);

/**
 * @swagger
 * /api/dashboard/comparative:
 *   get:
 *     summary: Récupérer les statistiques comparatives
 *     description: Comparaison mois actuel vs mois précédent
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques comparatives récupérées
 *       401:
 *         description: Non authentifié
 */
router.get('/comparative', getComparativeStatsController);

module.exports = router;
