const express = require('express');
const router = express.Router();
const {
  getSoldeController,
  getTransactionsController,
  getEvolutionController,
  getPrevisionsController,
  getAlertesController,
  getRapportMensuelController
} = require('./tresorerie.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const tenantMiddleware = require('../../middlewares/tenant.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const { ROLES } = require('../../constants/roles');

// Toutes les routes nécessitent authentification
router.use(authMiddleware);
router.use(tenantMiddleware);

/**
 * @swagger
 * /api/tresorerie/solde:
 *   get:
 *     summary: Récupérer le solde actuel de la trésorerie
 *     description: Solde global et par mode de paiement (espèces, Wave, Orange Money)
 *     tags: [Trésorerie]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Solde récupéré avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
// Lecture seule ouverte à tous les rôles du dahira (affichage du solde sur « Gestion financière »)
router.get('/solde', roleMiddleware(ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER, ROLES.RESPONSABLE_ORG, ROLES.MEMBRE), getSoldeController);

/**
 * @swagger
 * /api/tresorerie/transactions:
 *   get:
 *     summary: Récupérer l'historique des transactions
 *     description: Liste des entrées et sorties avec filtres
 *     tags: [Trésorerie]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [entree, sortie]
 *         description: Type de transaction
 *       - in: query
 *         name: mode_paiement
 *         schema:
 *           type: string
 *           enum: [especes, wave, orange_money]
 *         description: Mode de paiement
 *       - in: query
 *         name: date_debut
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début
 *       - in: query
 *         name: date_fin
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Nombre de résultats
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Offset pour la pagination
 *     responses:
 *       200:
 *         description: Transactions récupérées
 *       401:
 *         description: Non authentifié
 */
router.get('/transactions', roleMiddleware(ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER), getTransactionsController);

/**
 * @swagger
 * /api/tresorerie/evolution:
 *   get:
 *     summary: Récupérer l'évolution de la trésorerie
 *     description: Évolution des entrées, sorties et solde sur une période
 *     tags: [Trésorerie]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: periode
 *         schema:
 *           type: string
 *           enum: [jour, semaine, mois]
 *           default: mois
 *         description: Période de regroupement
 *     responses:
 *       200:
 *         description: Évolution récupérée
 *       401:
 *         description: Non authentifié
 */
router.get('/evolution', roleMiddleware(ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER), getEvolutionController);

/**
 * @swagger
 * /api/tresorerie/previsions:
 *   get:
 *     summary: Récupérer les prévisions de trésorerie
 *     description: Prévisions basées sur les moyennes historiques
 *     tags: [Trésorerie]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: mois
 *         schema:
 *           type: integer
 *           default: 3
 *         description: Nombre de mois à prévoir
 *     responses:
 *       200:
 *         description: Prévisions récupérées
 *       401:
 *         description: Non authentifié
 */
router.get('/previsions', roleMiddleware(ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER), getPrevisionsController);

/**
 * @swagger
 * /api/tresorerie/alertes:
 *   get:
 *     summary: Récupérer les alertes trésorerie
 *     description: Alertes sur solde faible, tendances négatives, etc.
 *     tags: [Trésorerie]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Alertes récupérées
 *       401:
 *         description: Non authentifié
 */
router.get('/alertes', roleMiddleware(ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER), getAlertesController);

router.get('/rapport-mensuel', roleMiddleware(ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER), getRapportMensuelController);

module.exports = router;

