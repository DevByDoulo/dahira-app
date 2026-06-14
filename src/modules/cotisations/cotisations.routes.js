const express = require('express');
const router = express.Router();
const {
  encaisserCotisationController,
  encaisserCotisationsBatchController,
  declarerCotisationController,
  getPendingCotisationsController,
  validerCotisationController,
  rejeterCotisationController,
  getMesCotisationsController,
  getDashboardController,
  encaisserCotisationValidation,
  encaisserCotisationsBatchValidation,
  declarerCotisationValidation,
  rejeterCotisationValidation,
  getDashboardValidation
} = require('./cotisations.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const tenantMiddleware = require('../../middlewares/tenant.middleware');
const allowRoles = require('../../middlewares/role.middleware');

/**
 * @swagger
 * /api/cotisations/encaisser:
 *   post:
 *     summary: Encaisser une cotisation
 *     description: Crée une cotisation directement approuvée (statut = approved)
 *     tags: [Cotisations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - membre_id
 *               - seance_id
 *               - montant
 *               - mode_paiement
 *             properties:
 *               membre_id:
 *                 type: integer
 *                 example: 1
 *               seance_id:
 *                 type: integer
 *                 example: 1
 *               montant:
 *                 type: number
 *                 example: 500
 *               mode_paiement:
 *                 type: string
 *                 enum: [especes, wave, orange_money]
 *                 example: "especes"
 *               note:
 *                 type: string
 *                 example: "Cotisation du vendredi"
 *     responses:
 *       201:
 *         description: Cotisation encaissée avec succès
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
 *                       example: 1
 *                     seance_id:
 *                       type: integer
 *                       example: 1
 *                     montant:
 *                       type: number
 *                       example: 500
 *                     mode_paiement:
 *                       type: string
 *                       example: "especes"
 *                     note:
 *                       type: string
 *                       example: "Cotisation du vendredi"
 *                     statut:
 *                       type: string
 *                       example: "approved"
 *                     declare_par:
 *                       type: integer
 *                       nullable: true
 *                       example: null
 *                     valide_par:
 *                       type: integer
 *                       example: 1
 *                     valide_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-06-14T10:00:00.000Z"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Erreur de validation ou membre/séance non trouvé
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Rôle insuffisant
 */
router.post('/encaisser', authMiddleware, tenantMiddleware, allowRoles('bureau', 'tresorier'), encaisserCotisationValidation, encaisserCotisationController);

/**
 * @swagger
 * /api/cotisations/encaisser/batch:
 *   post:
 *     summary: Encaisser plusieurs cotisations
 *     description: Crée plusieurs cotisations en une transaction
 *     tags: [Cotisations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cotisations
 *             properties:
 *               cotisations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - membre_id
 *                     - seance_id
 *                     - montant
 *                     - mode_paiement
 *                   properties:
 *                     membre_id:
 *                       type: integer
 *                       example: 1
 *                     seance_id:
 *                       type: integer
 *                       example: 1
 *                     montant:
 *                       type: number
 *                       example: 500
 *                     mode_paiement:
 *                       type: string
 *                       enum: [especes, wave, orange_money]
 *                       example: "especes"
 *                     note:
 *                       type: string
 *                       example: "Cotisation du vendredi"
 *     responses:
 *       201:
 *         description: Cotisations encaissées avec succès
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
 *                     count:
 *                       type: integer
 *                       example: 3
 *                     cotisations:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Erreur de validation ou tableau vide
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Rôle insuffisant
 */
router.post('/encaisser/batch', authMiddleware, tenantMiddleware, allowRoles('bureau', 'tresorier'), encaisserCotisationsBatchValidation, encaisserCotisationsBatchController);

/**
 * @swagger
 * /api/cotisations/declarer:
 *   post:
 *     summary: Déclarer une cotisation
 *     description: Le membre connecté déclare sa propre cotisation (statut = pending)
 *     tags: [Cotisations]
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
 *               - montant
 *               - mode_paiement
 *             properties:
 *               seance_id:
 *                 type: integer
 *                 example: 1
 *               montant:
 *                 type: number
 *                 example: 500
 *               mode_paiement:
 *                 type: string
 *                 enum: [wave, orange_money]
 *                 example: "wave"
 *               note:
 *                 type: string
 *                 example: "Cotisation du vendredi"
 *     responses:
 *       201:
 *         description: Cotisation déclarée avec succès
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
 *                       example: 1
 *                     seance_id:
 *                       type: integer
 *                       example: 1
 *                     montant:
 *                       type: number
 *                       example: 500
 *                     mode_paiement:
 *                       type: string
 *                       example: "wave"
 *                     note:
 *                       type: string
 *                       example: "Cotisation du vendredi"
 *                     statut:
 *                       type: string
 *                       example: "pending"
 *                     declare_par:
 *                       type: integer
 *                       example: 1
 *                     valide_par:
 *                       type: integer
 *                       nullable: true
 *                       example: null
 *                     valide_at:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Erreur de validation ou compte non lié à un membre
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Rôle insuffisant
 *       404:
 *         description: Séance non trouvée
 */
router.post('/declarer', authMiddleware, tenantMiddleware, allowRoles('membre', 'tresorier', 'bureau'), declarerCotisationValidation, declarerCotisationController);

/**
 * @swagger
 * /api/cotisations/pending:
 *   get:
 *     summary: Lister les cotisations en attente
 *     description: Retourne toutes les cotisations en attente de validation
 *     tags: [Cotisations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des cotisations en attente
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
 *                       membre_id:
 *                         type: integer
 *                         example: 1
 *                       seance_id:
 *                         type: integer
 *                         example: 1
 *                       montant:
 *                         type: number
 *                         example: 500
 *                       mode_paiement:
 *                         type: string
 *                         example: "wave"
 *                       note:
 *                         type: string
 *                         example: "Cotisation du vendredi"
 *                       statut:
 *                         type: string
 *                         example: "pending"
 *                       declare_par:
 *                         type: integer
 *                         example: 1
 *                       valide_par:
 *                         type: integer
 *                         nullable: true
 *                         example: null
 *                       valide_at:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       nom:
 *                         type: string
 *                         example: "Diallo"
 *                       prenom:
 *                         type: string
 *                         example: "Amadou"
 *                       date_seance:
 *                         type: string
 *                         format: date
 *                         example: "2024-06-14"
 *                       type:
 *                         type: string
 *                         example: "hebdomadaire"
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Rôle insuffisant
 */
router.get('/pending', authMiddleware, tenantMiddleware, allowRoles('bureau', 'tresorier'), getPendingCotisationsController);

/**
 * @swagger
 * /api/cotisations/{id}/valider:
 *   patch:
 *     summary: Valider une cotisation
 *     description: Approuve une cotisation en attente
 *     tags: [Cotisations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cotisation
 *     responses:
 *       200:
 *         description: Cotisation validée avec succès
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
 *                     statut:
 *                       type: string
 *                       example: "approved"
 *                     valide_par:
 *                       type: integer
 *                       example: 1
 *                     valide_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Cotisation déjà traitée
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Rôle insuffisant
 *       404:
 *         description: Cotisation non trouvée
 */
router.patch('/:id/valider', authMiddleware, tenantMiddleware, allowRoles('bureau', 'tresorier'), validerCotisationController);

/**
 * @swagger
 * /api/cotisations/{id}/rejeter:
 *   patch:
 *     summary: Rejeter une cotisation
 *     description: Rejette une cotisation en attente
 *     tags: [Cotisations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cotisation
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *                 example: "Preuve de paiement invalide"
 *     responses:
 *       200:
 *         description: Cotisation rejetée avec succès
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
 *                     statut:
 *                       type: string
 *                       example: "rejected"
 *                     valide_par:
 *                       type: integer
 *                       example: 1
 *                     valide_at:
 *                       type: string
 *                       format: date-time
 *                     note:
 *                       type: string
 *                       example: "Preuve de paiement invalide"
 *       400:
 *         description: Cotisation déjà traitée
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Rôle insuffisant
 *       404:
 *         description: Cotisation non trouvée
 */
router.patch('/:id/rejeter', authMiddleware, tenantMiddleware, allowRoles('bureau', 'tresorier'), rejeterCotisationValidation, rejeterCotisationController);

/**
 * @swagger
 * /api/cotisations/mine:
 *   get:
 *     summary: Historique de mes cotisations
 *     description: Retourne l'historique des cotisations du membre connecté
 *     tags: [Cotisations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historique des cotisations
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
 *                       membre_id:
 *                         type: integer
 *                         example: 1
 *                       seance_id:
 *                         type: integer
 *                         example: 1
 *                       montant:
 *                         type: number
 *                         example: 500
 *                       mode_paiement:
 *                         type: string
 *                         example: "wave"
 *                       note:
 *                         type: string
 *                         example: "Cotisation du vendredi"
 *                       statut:
 *                         type: string
 *                         example: "approved"
 *                       declare_par:
 *                         type: integer
 *                         example: 1
 *                       valide_par:
 *                         type: integer
 *                         example: 1
 *                       valide_at:
 *                         type: string
 *                         format: date-time
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       date_seance:
 *                         type: string
 *                         format: date
 *                         example: "2024-06-14"
 *                       type:
 *                         type: string
 *                         example: "hebdomadaire"
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Rôle insuffisant
 */
router.get('/mine', authMiddleware, tenantMiddleware, allowRoles('membre', 'tresorier', 'bureau'), getMesCotisationsController);

/**
 * @swagger
 * /api/cotisations/dashboard:
 *   get:
 *     summary: Tableau de bord des cotisations
 *     description: Retourne les statistiques des cotisations pour le dahira
 *     tags: [Cotisations]
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
 *         description: Statistiques des cotisations
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
 *                     total_especes:
 *                       type: number
 *                       example: 50000
 *                     total_wave:
 *                       type: number
 *                       example: 30000
 *                     total_orange_money:
 *                       type: number
 *                       example: 20000
 *                     total_general:
 *                       type: number
 *                       example: 100000
 *                     membres_a_jour:
 *                       type: integer
 *                       example: 45
 *                     membres_en_retard:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 5
 *                           nom:
 *                             type: string
 *                             example: "Diallo"
 *                           prenom:
 *                             type: string
 *                             example: "Amadou"
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Rôle insuffisant
 */
router.get('/dashboard', authMiddleware, tenantMiddleware, allowRoles('bureau', 'tresorier'), getDashboardValidation, getDashboardController);

module.exports = router;
