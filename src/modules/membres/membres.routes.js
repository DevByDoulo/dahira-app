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
  authMiddleware, tenantMiddleware, allowRoles(ROLES.BUREAU),
  getMembresAvecCompteController,
);

router.get(
  '/',
  authMiddleware, tenantMiddleware, allowRoles(ROLES.BUREAU, ROLES.TRESORIER),
  getAllMembresController,
);

router.get('/:id', authMiddleware, tenantMiddleware, getMembreByIdController);

router.post(
  '/',
  authMiddleware, tenantMiddleware, allowRoles(ROLES.BUREAU),
  createMembreValidation, createMembreController,
);

router.put(
  '/:id',
  authMiddleware, tenantMiddleware, allowRoles(ROLES.BUREAU),
  updateMembreValidation, updateMembreController,
);

router.patch(
  '/:id/role',
  authMiddleware, tenantMiddleware, allowRoles(ROLES.BUREAU),
  updateRoleController,
);

router.patch(
  '/:id/desactiver',
  authMiddleware, tenantMiddleware, allowRoles(ROLES.BUREAU),
  desactiverMembreController,
);

router.patch(
  '/:id/activer',
  authMiddleware, tenantMiddleware, allowRoles(ROLES.BUREAU),
  activerMembreController,
);

router.post(
  '/:id/photo',
  authMiddleware, tenantMiddleware, allowRoles(ROLES.BUREAU),
  ...uploadMembrePhotoController,
);

module.exports = router;
