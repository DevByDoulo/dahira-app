const express = require('express');
const router = express.Router();
const {
  createDahiraController,
  getAllDahirasController,
  getDahiraByIdController,
  updateDahiraController,
  desactiverDahiraController,
  activerDahiraController,
  deleteDahiraController,
  createDahiraValidation,
  updateDahiraValidation
} = require('./dahiras.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

// Note: Les routes dahiras ne nécessitent PAS de tenant middleware
// car elles concernent la gestion des dahiras eux-mêmes

/**
 * @swagger
 * /api/dahiras:
 *   post:
 *     summary: Créer un dahira
 *     description: Créer un nouveau dahira (Super admin uniquement - à implémenter)
 *     tags: [Dahiras]
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
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "Dahira Touba"
 *               adresse:
 *                 type: string
 *                 example: "10 Rue de la Paix, Dakar"
 *               telephone:
 *                 type: string
 *                 example: "221771234567"
 *               email:
 *                 type: string
 *                 example: "contact@dahira-touba.sn"
 *               description:
 *                 type: string
 *               logo_url:
 *                 type: string
 *     responses:
 *       201:
 *         description: Dahira créé
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non authentifié
 */
router.post('/', authMiddleware, createDahiraValidation, createDahiraController);

/**
 * @swagger
 * /api/dahiras:
 *   get:
 *     summary: Récupérer tous les dahiras
 *     description: Liste de tous les dahiras (avec filtres)
 *     tags: [Dahiras]
 *     parameters:
 *       - in: query
 *         name: actif
 *         schema:
 *           type: boolean
 *         description: Filtrer par statut actif
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Liste des dahiras
 */
router.get('/', getAllDahirasController);

/**
 * @swagger
 * /api/dahiras/{id}:
 *   get:
 *     summary: Récupérer un dahira par ID
 *     description: Détails d'un dahira avec statistiques
 *     tags: [Dahiras]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dahira récupéré
 *       404:
 *         description: Dahira non trouvé
 */
router.get('/:id', getDahiraByIdController);

/**
 * @swagger
 * /api/dahiras/{id}:
 *   put:
 *     summary: Mettre à jour un dahira
 *     description: Modifier les informations d'un dahira (Bureau uniquement)
 *     tags: [Dahiras]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               adresse:
 *                 type: string
 *               telephone:
 *                 type: string
 *               email:
 *                 type: string
 *               description:
 *                 type: string
 *               logo_url:
 *                 type: string
 *               actif:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Dahira mis à jour
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Dahira non trouvé
 */
router.put('/:id', authMiddleware, roleMiddleware(['bureau']), updateDahiraValidation, updateDahiraController);

/**
 * @swagger
 * /api/dahiras/{id}/desactiver:
 *   patch:
 *     summary: Désactiver un dahira
 *     description: Désactiver un dahira (Bureau uniquement)
 *     tags: [Dahiras]
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
 *         description: Dahira désactivé
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Dahira non trouvé
 */
router.patch('/:id/desactiver', authMiddleware, roleMiddleware(['bureau']), desactiverDahiraController);

/**
 * @swagger
 * /api/dahiras/{id}/activer:
 *   patch:
 *     summary: Activer un dahira
 *     description: Activer un dahira (Bureau uniquement)
 *     tags: [Dahiras]
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
 *         description: Dahira activé
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Dahira non trouvé
 */
router.patch('/:id/activer', authMiddleware, roleMiddleware(['bureau']), activerDahiraController);

/**
 * @swagger
 * /api/dahiras/{id}:
 *   delete:
 *     summary: Supprimer un dahira
 *     description: Supprimer un dahira (uniquement si vide - Bureau uniquement)
 *     tags: [Dahiras]
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
 *         description: Dahira supprimé
 *       400:
 *         description: Dahira contient des données
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Dahira non trouvé
 */
router.delete('/:id', authMiddleware, roleMiddleware(['bureau']), deleteDahiraController);

module.exports = router;
