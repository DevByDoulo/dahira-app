const express = require('express');
const router = express.Router();
const {
  getAllMembresController,
  getMembresAvecCompteController,
  getMembreByIdController,
  createMembreController,
  updateMembreController,
  updateRoleController,
  desactiverMembreController,
  activerMembreController,
  uploadMembrePhotoController,
  fichePdfController,
  createMembreValidation,
  updateMembreValidation,
} = require('./membres.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const tenantMiddleware = require('../../middlewares/tenant.middleware');
const allowRoles = require('../../middlewares/role.middleware');
const { ROLES } = require('../../constants/roles');

// Routes statiques avant /:id
router.get(
  '/avec-compte',
  authMiddleware, tenantMiddleware, allowRoles(ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT),
  getMembresAvecCompteController,
);

router.get(
  '/',
  authMiddleware, tenantMiddleware, allowRoles(ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER),
  getAllMembresController,
);

router.get('/:id/fiche-pdf', authMiddleware, tenantMiddleware, allowRoles(ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT, ROLES.TRESORIER), fichePdfController);

router.get('/:id', authMiddleware, tenantMiddleware, getMembreByIdController);

router.post(
  '/',
  authMiddleware, tenantMiddleware, allowRoles(ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT),
  createMembreValidation, createMembreController,
);

router.put(
  '/:id',
  authMiddleware, tenantMiddleware, allowRoles(ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT),
  updateMembreValidation, updateMembreController,
);

router.patch(
  '/:id/role',
  authMiddleware, tenantMiddleware, allowRoles(ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT),
  updateRoleController,
);

router.patch(
  '/:id/desactiver',
  authMiddleware, tenantMiddleware, allowRoles(ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT),
  desactiverMembreController,
);

router.patch(
  '/:id/activer',
  authMiddleware, tenantMiddleware, allowRoles(ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT),
  activerMembreController,
);

router.post(
  '/:id/photo',
  authMiddleware, tenantMiddleware, allowRoles(ROLES.SECRETAIRE_GENERAL, ROLES.ADJOINT),
  ...uploadMembrePhotoController,
);

module.exports = router;

