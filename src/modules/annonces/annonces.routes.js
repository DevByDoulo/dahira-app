const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getAllAnnoncesController,
  getAnnonceByIdController,
  createAnnonceController,
  updateAnnonceController,
  deleteAnnonceController,
  toggleEpingleeController,
  uploadAnnonceImageController,
  createAnnonceValidation,
  updateAnnonceValidation
} = require('./annonces.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const tenantMiddleware = require('../../middlewares/tenant.middleware');
const allowRoles = require('../../middlewares/role.middleware');
const { ROLES } = require('../../constants/roles');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Format non autorisé. Utilisez JPG, PNG, WebP ou GIF.'));
  }
});

/**
 * @swagger
 * /api/annonces:
 *   get:
 *     summary: Lister toutes les annonces
 *     description: Retourne la liste de toutes les annonces du dahira, triées par épinglées puis par date de création
 *     tags: [Annonces]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des annonces récupérée avec succès
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
 *                         example: "Réunion importante"
 *                       contenu:
 *                         type: string
 *                         example: "Une réunion aura lieu ce vendredi à 18h"
 *                       image_url:
 *                         type: string
 *                         nullable: true
 *                         example: "https://example.com/image.jpg"
 *                       cible_groupe:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       epinglee:
 *                         type: boolean
 *                         example: true
 *                       publie_par:
 *                         type: integer
 *                         example: 1
 *                       publie_par_username:
 *                         type: string
 *                         example: "admin"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Non authentifié
 */
router.post('/upload-image', authMiddleware, tenantMiddleware, allowRoles(ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.RESPONSABLE_ORG), upload.single('image'), uploadAnnonceImageController);

router.get('/', authMiddleware, tenantMiddleware, allowRoles(ROLES.MEMBRE, ROLES.TRESORIER, ROLES.RESPONSABLE_ORG, ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT), getAllAnnoncesController);

/**
 * @swagger
 * /api/annonces/{id}:
 *   get:
 *     summary: Obtenir une annonce par ID
 *     description: Retourne les détails d'une annonce spécifique
 *     tags: [Annonces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'annonce
 *     responses:
 *       200:
 *         description: Annonce récupérée avec succès
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
 *                     type: integer
 *                     example: 1
 *                   dahira_id:
 *                     type: integer
 *                     example: 1
 *                   titre:
 *                     type: string
 *                     example: "Réunion importante"
 *                   contenu:
 *                     type: string
 *                     example: "Une réunion aura lieu ce vendredi à 18h"
 *                   image_url:
 *                     type: string
 *                     nullable: true
 *                     example: "https://example.com/image.jpg"
 *                   cible_groupe:
 *                     type: string
 *                     nullable: true
 *                     example: null
 *                   epinglee:
 *                     type: boolean
 *                     example: true
 *                   publie_par:
 *                     type: integer
 *                     example: 1
 *                   publie_par_username:
 *                     type: string
 *                     example: "admin"
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Annonce non trouvée
 */
router.get('/:id', authMiddleware, tenantMiddleware, allowRoles(ROLES.MEMBRE, ROLES.TRESORIER, ROLES.RESPONSABLE_ORG, ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT), getAnnonceByIdController);

/**
 * @swagger
 * /api/annonces:
 *   post:
 *     summary: Créer une nouvelle annonce
 *     description: Crée une nouvelle annonce dans le dahira
 *     tags: [Annonces]
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
 *               - contenu
 *             properties:
 *               titre:
 *                 type: string
 *                 example: "Réunion importante"
 *               contenu:
 *                 type: string
 *                 example: "Une réunion aura lieu ce vendredi à 18h"
 *               image_url:
 *                 type: string
 *                 example: "https://example.com/image.jpg"
 *               cible_groupe:
 *                 type: string
 *                 example: "comite"
 *     responses:
 *       201:
 *         description: Annonce créée avec succès
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
 *                       example: "Réunion importante"
 *                     contenu:
 *                       type: string
 *                       example: "Une réunion aura lieu ce vendredi à 18h"
 *                     image_url:
 *                       type: string
 *                       nullable: true
 *                       example: "https://example.com/image.jpg"
 *                     cible_groupe:
 *                       type: string
 *                       nullable: true
 *                       example: "comite"
 *                     epinglee:
 *                       type: boolean
 *                       example: false
 *                     publie_par:
 *                       type: integer
 *                       example: 1
 *                     publie_par_username:
 *                       type: string
 *                       example: "admin"
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
router.post('/', authMiddleware, tenantMiddleware, allowRoles(ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.RESPONSABLE_ORG), createAnnonceValidation, createAnnonceController);

/**
 * @swagger
 * /api/annonces/{id}:
 *   put:
 *     summary: Mettre à jour une annonce
 *     description: Met à jour les informations d'une annonce existante
 *     tags: [Annonces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'annonce
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titre
 *               - contenu
 *             properties:
 *               titre:
 *                 type: string
 *                 example: "Réunion importante - Mise à jour"
 *               contenu:
 *                 type: string
 *                 example: "La réunion est reportée à samedi à 18h"
 *               image_url:
 *                 type: string
 *                 example: "https://example.com/new-image.jpg"
 *               cible_groupe:
 *                 type: string
 *                 example: "tous"
 *     responses:
 *       200:
 *         description: Annonce mise à jour avec succès
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
 *                       example: "Réunion importante - Mise à jour"
 *                     contenu:
 *                       type: string
 *                       example: "La réunion est reportée à samedi à 18h"
 *                     image_url:
 *                       type: string
 *                       nullable: true
 *                       example: "https://example.com/new-image.jpg"
 *                     cible_groupe:
 *                       type: string
 *                       nullable: true
 *                       example: "tous"
 *                     epinglee:
 *                       type: boolean
 *                       example: false
 *                     publie_par:
 *                       type: integer
 *                       example: 1
 *                     publie_par_username:
 *                       type: string
 *                       example: "admin"
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
 *         description: Annonce non trouvée
 */
router.put('/:id', authMiddleware, tenantMiddleware, allowRoles(ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.RESPONSABLE_ORG), updateAnnonceValidation, updateAnnonceController);

/**
 * @swagger
 * /api/annonces/{id}:
 *   delete:
 *     summary: Supprimer une annonce
 *     description: Supprime une annonce existante
 *     tags: [Annonces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'annonce
 *     responses:
 *       200:
 *         description: Annonce supprimée avec succès
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
 *                       example: "Annonce supprimée avec succès"
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Rôle insuffisant
 *       404:
 *         description: Annonce non trouvée
 */
router.delete('/:id', authMiddleware, tenantMiddleware, allowRoles(ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.RESPONSABLE_ORG), deleteAnnonceController);

/**
 * @swagger
 * /api/annonces/{id}/epingler:
 *   patch:
 *     summary: Épingler/Désépingler une annonce
 *     description: Inverse la valeur de l'attribut epinglee (toggle)
 *     tags: [Annonces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'annonce
 *     responses:
 *       200:
 *         description: Statut d'épinglage mis à jour avec succès
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
 *                       example: "Réunion importante"
 *                     contenu:
 *                       type: string
 *                       example: "Une réunion aura lieu ce vendredi à 18h"
 *                     image_url:
 *                       type: string
 *                       nullable: true
 *                       example: "https://example.com/image.jpg"
 *                     cible_groupe:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     epinglee:
 *                       type: boolean
 *                       example: true
 *                     publie_par:
 *                       type: integer
 *                       example: 1
 *                     publie_par_username:
 *                       type: string
 *                       example: "admin"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Rôle insuffisant
 *       404:
 *         description: Annonce non trouvée
 */
router.patch('/:id/epingler', authMiddleware, tenantMiddleware, allowRoles(ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.RESPONSABLE_ORG), toggleEpingleeController);

module.exports = router;

