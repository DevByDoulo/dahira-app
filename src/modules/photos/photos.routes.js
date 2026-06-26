const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  uploadMembrePhotoController,
  deleteMembrePhotoController,
  uploadUserPhotoController,
  uploadMembreMeController,
  getPhotosController,
  uploadGaleriePhotoController,
  deleteGaleriePhotoController,
} = require('./photos.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const tenantMiddleware = require('../../middlewares/tenant.middleware');
const allowRoles = require('../../middlewares/role.middleware');
const { ROLES } = require('../../constants/roles');

// Multer : upload unique (profil membre/user)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format de fichier non autorisé. Utilisez JPG, JPEG ou PNG.'));
    }
  }
});

// Multer : upload multiple pour la galerie (jusqu'à 20 fichiers)
const uploadMultiple = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Format non autorisé. Seuls les fichiers image sont acceptés.'));
  },
});

router.use(authMiddleware);
router.use(tenantMiddleware);

// ── Galerie photos ──────────────────────────────────────────
router.get('/', getPhotosController);
router.post('/', allowRoles(ROLES.BUREAU), uploadMultiple.array('photos', 20), uploadGaleriePhotoController);
router.delete('/:id([0-9]+)', allowRoles(ROLES.BUREAU), deleteGaleriePhotoController);
// ────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/photos/membres/{id}:
 *   post:
 *     summary: Upload une photo de membre
 *     description: Upload et optimise une photo de profil pour un membre
 *     tags: [Photos]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Photo uploadée avec succès
 *       400:
 *         description: Erreur de validation
 */
router.post(
  '/membres/:id',
  authMiddleware,
  tenantMiddleware,
  allowRoles(ROLES.BUREAU),
  upload.single('photo'),
  uploadMembrePhotoController
);

/**
 * @swagger
 * /api/photos/membres/{id}:
 *   delete:
 *     summary: Supprimer la photo d'un membre
 *     tags: [Photos]
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
 *         description: Photo supprimée avec succès
 */
router.delete(
  '/membres/:id',
  authMiddleware,
  tenantMiddleware,
  allowRoles(ROLES.BUREAU),
  deleteMembrePhotoController
);

/**
 * @swagger
 * /api/photos/me:
 *   post:
 *     summary: Upload sa propre photo de profil
 *     description: Permet à un utilisateur d'upload sa propre photo
 *     tags: [Photos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Photo uploadée avec succès
 */
router.post(
  '/me',
  authMiddleware,
  upload.single('photo'),
  uploadUserPhotoController
);

router.post(
  '/membres/me',
  authMiddleware,
  tenantMiddleware,
  upload.single('photo'),
  uploadMembreMeController
);

module.exports = router;
