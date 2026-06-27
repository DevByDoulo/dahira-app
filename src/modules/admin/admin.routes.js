const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth.middleware');
const superAdminMiddleware = require('../../middlewares/superadmin.middleware');
const controller = require('./admin.controller');

// Toutes les routes /api/admin/* exigent d'être authentifié ET super_admin
router.use(authMiddleware, superAdminMiddleware);

// Statistiques globales de la plateforme
router.get('/stats', controller.getStats);

// Gestion des dahiras (tous)
router.get('/dahiras', controller.getAllDahiras);
router.get('/dahiras/:id', controller.getDahiraById);
router.patch('/dahiras/:id/toggle', controller.toggleDahiraStatus);

module.exports = router;
