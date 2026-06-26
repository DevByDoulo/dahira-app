const express = require('express');
const router = express.Router();
const {
  genererRecuController,
  envoyerRecuController,
  getRecuByCotisationController,
  getRecusMembreController,
  getRecusDahiraController,
  downloadRecuController,
  creerRecuController,
  getRecusSeanceController
} = require('./recus.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const tenantMiddleware = require('../../middlewares/tenant.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const { ROLES } = require('../../constants/roles');

// Toutes les routes nécessitent authentification
router.use(authMiddleware);
router.use(tenantMiddleware);

/**
 * @swagger
 * /api/recus:
 *   get:
 *     summary: Lister tous les reçus du dahira
 *     description: Retourne la liste complète des reçus générés pour le dahira courant
 *     tags: [Reçus]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des reçus
 *       401:
 *         description: Non authentifié
 */
router.get('/', getRecusDahiraController);

/**
 * @swagger
 * /api/recus:
 *   post:
 *     summary: Créer un reçu pour une cotisation
 *     description: Génère et enregistre un reçu en base pour la cotisation donnée dans le corps
 *     tags: [Reçus]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cotisation_id]
 *             properties:
 *               cotisation_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Reçu créé
 *       400:
 *         description: cotisation_id manquant
 *       404:
 *         description: Cotisation introuvable ou non approuvée
 */
router.post('/', roleMiddleware(ROLES.BUREAU, ROLES.TRESORIER), creerRecuController);

/**
 * @swagger
 * /api/recus/{id}/download:
 *   get:
 *     summary: Télécharger / ouvrir le PDF d'un reçu
 *     description: Sert le fichier PDF du reçu en streaming (inline pour impression, téléchargement côté client)
 *     tags: [Reçus]
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
 *         description: Fichier PDF
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Reçu ou fichier introuvable
 */
router.get('/:id/download', downloadRecuController);

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
router.post('/cotisation/:cotisation_id/generer', roleMiddleware(ROLES.BUREAU, ROLES.TRESORIER), genererRecuController);

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
router.post('/cotisation/:cotisation_id/envoyer', roleMiddleware(ROLES.BUREAU, ROLES.TRESORIER), envoyerRecuController);

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

router.get('/seance/:seance_id', roleMiddleware(ROLES.BUREAU, ROLES.TRESORIER), getRecusSeanceController);

module.exports = router;
