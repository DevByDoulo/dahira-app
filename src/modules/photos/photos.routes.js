const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  uploadMembrePhotoController,
  deleteMembrePhotoController,
  uploadUserPhotoController
} = require('./photos.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const tenantMiddleware = require('../../middlewares/tenant.middleware');
const allowRoles = require('../../middlewares/role.middleware');

// Configuration Multer pour upload en mémoire
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
  allowRoles('bureau'),
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
  allowRoles('bureau'),
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

module.exports = router;
