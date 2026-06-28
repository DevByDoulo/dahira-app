const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  createDepenseController,
  getAllDepensesController,
  getDepenseByIdController,
  updateDepenseController,
  validerDepenseController,
  rejeterDepenseController,
  deleteDepenseController,
  getStatistiquesController,
  uploadJustificatifController,
  createDepenseValidation,
  updateDepenseValidation,
  rejeterDepenseValidation
} = require('./depenses.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const tenantMiddleware = require('../../middlewares/tenant.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const { ROLES } = require('../../constants/roles');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Format non autorisé. Utilisez JPG, PNG ou PDF.'));
  }
});

// Toutes les routes nécessitent authentification
router.use(authMiddleware);
router.use(tenantMiddleware);

/**
 * @swagger
 * /api/depenses:
 *   post:
 *     summary: Créer une dépense
 *     description: Enregistrer une nouvelle dépense (Bureau/Trésorier)
 *     tags: [Dépenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *               - montant
 *               - categorie
 *               - mode_paiement
 *               - date_depense
 *             properties:
 *               description:
 *                 type: string
 *                 example: "Achat de matériel sono"
 *               montant:
 *                 type: number
 *                 example: 150000
 *               categorie:
 *                 type: string
 *                 enum: [evenements, location, nourriture, donations, maintenance, autres]
 *               mode_paiement:
 *                 type: string
 *                 enum: [especes, wave, orange_money, virement, cheque]
 *               date_depense:
 *                 type: string
 *                 format: date
 *               justificatif_url:
 *                 type: string
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Dépense créée
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
router.post('/upload-justificatif', roleMiddleware(ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER), upload.single('justificatif'), uploadJustificatifController);

router.post('/', roleMiddleware(ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER), createDepenseValidation, createDepenseController);

/**
 * @swagger
 * /api/depenses:
 *   get:
 *     summary: Récupérer toutes les dépenses
 *     description: Liste des dépenses avec filtres
 *     tags: [Dépenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [en_attente, validee, rejetee]
 *       - in: query
 *         name: categorie
 *         schema:
 *           type: string
 *       - in: query
 *         name: date_debut
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: date_fin
 *         schema:
 *           type: string
 *           format: date
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
 *         description: Dépenses récupérées
 *       401:
 *         description: Non authentifié
 */
router.get('/', roleMiddleware(ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER), getAllDepensesController);

/**
 * @swagger
 * /api/depenses/stats:
 *   get:
 *     summary: Récupérer les statistiques des dépenses
 *     description: Statistiques globales, par catégorie, évolution mensuelle
 *     tags: [Dépenses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques récupérées
 *       401:
 *         description: Non authentifié
 */
router.get('/stats', roleMiddleware(ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER), getStatistiquesController);

/**
 * @swagger
 * /api/depenses/{id}:
 *   get:
 *     summary: Récupérer une dépense par ID
 *     description: Détails d'une dépense spécifique
 *     tags: [Dépenses]
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
 *         description: Dépense récupérée
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Dépense non trouvée
 */
router.get('/:id', roleMiddleware(ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER), getDepenseByIdController);

/**
 * @swagger
 * /api/depenses/{id}:
 *   put:
 *     summary: Mettre à jour une dépense
 *     description: Modifier une dépense en attente (Bureau/Trésorier)
 *     tags: [Dépenses]
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
 *               description:
 *                 type: string
 *               montant:
 *                 type: number
 *               categorie:
 *                 type: string
 *               mode_paiement:
 *                 type: string
 *               date_depense:
 *                 type: string
 *                 format: date
 *               justificatif_url:
 *                 type: string
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Dépense mise à jour
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Dépense non trouvée
 */
router.put('/:id', roleMiddleware(ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER), updateDepenseValidation, updateDepenseController);

/**
 * @swagger
 * /api/depenses/{id}/valider:
 *   patch:
 *     summary: Valider une dépense
 *     description: |
 *       Approuver une dépense en attente.
 *       
 *       **Permission:** Bureau uniquement
 *       
 *       **Séparation des pouvoirs:** Le Trésorier crée les dépenses mais seul 
 *       le Bureau peut les valider pour assurer transparence et contrôle.
 *     tags: [Dépenses]
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
 *         description: Dépense validée
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé - Bureau uniquement
 *       404:
 *         description: Dépense non trouvée
 */
router.patch('/:id/valider', roleMiddleware(ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT), validerDepenseController);

/**
 * @swagger
 * /api/depenses/{id}/rejeter:
 *   patch:
 *     summary: Rejeter une dépense
 *     description: |
 *       Refuser une dépense en attente.
 *       
 *       **Permission:** Bureau uniquement
 *     tags: [Dépenses]
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
 *             required:
 *               - motif
 *             properties:
 *               motif:
 *                 type: string
 *                 example: "Justificatif manquant"
 *     responses:
 *       200:
 *         description: Dépense rejetée
 *       400:
 *         description: Motif requis
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé - Bureau uniquement
 */
router.patch('/:id/rejeter', roleMiddleware(ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT), rejeterDepenseValidation, rejeterDepenseController);

/**
 * @swagger
 * /api/depenses/{id}:
 *   delete:
 *     summary: Supprimer une dépense
 *     description: |
 *       Supprimer une dépense en attente ou rejetée.
 *       
 *       **Permission:** Bureau uniquement
 *     tags: [Dépenses]
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
 *         description: Dépense supprimée
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé - Bureau uniquement
 *       404:
 *         description: Dépense non trouvée ou impossible à supprimer
 */
router.delete('/:id', roleMiddleware(ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT), deleteDepenseController);

module.exports = router;

