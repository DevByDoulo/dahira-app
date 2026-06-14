const express = require('express');
const router = express.Router();
const {
  genererRecuController,
  envoyerRecuController,
  getRecuByCotisationController,
  getRecusMembreController
} = require('./recus.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const tenantMiddleware = require('../../middlewares/tenant.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

// Toutes les routes nécessitent authentification
router.use(authMiddleware);
router.use(tenantMiddleware);

/**
 * @swagger
 * /api/recus/cotisation/{cotisation_id}/generer:
 *   post:
 *     summary: Générer un reçu PDF
 *     description: Générer un reçu PDF pour une cotisation
 *     tags: [Reçus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cotisation_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reçu généré avec succès
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Cotisation non trouvée
 */
router.post('/cotisation/:cotisation_id/generer', roleMiddleware(['bureau', 'tresorier']), genererRecuController);

/**
 * @swagger
 * /api/recus/cotisation/{cotisation_id}/envoyer:
 *   post:
 *     summary: Générer et envoyer un reçu par email
 *     description: Générer un reçu PDF et l'envoyer par email au membre
 *     tags: [Reçus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cotisation_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reçu envoyé par email
 *       400:
 *         description: Membre sans email
 *       401:
 *         description: Non authentifié
 */
router.post('/cotisation/:cotisation_id/envoyer', roleMiddleware(['bureau', 'tresorier']), envoyerRecuController);

/**
 * @swagger
 * /api/recus/cotisation/{cotisation_id}:
 *   get:
 *     summary: Récupérer un reçu par cotisation
 *     description: Récupérer le reçu d'une cotisation (le génère s'il n'existe pas)
 *     tags: [Reçus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cotisation_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reçu récupéré
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Cotisation non trouvée
 */
router.get('/cotisation/:cotisation_id', getRecuByCotisationController);

/**
 * @swagger
 * /api/recus/membre/{membre_id}:
 *   get:
 *     summary: Récupérer tous les reçus d'un membre
 *     description: Liste de tous les reçus de cotisation d'un membre
 *     tags: [Reçus]
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
 *         description: Reçus récupérés
 *       401:
 *         description: Non authentifié
 */
router.get('/membre/:membre_id', getRecusMembreController);

module.exports = router;
