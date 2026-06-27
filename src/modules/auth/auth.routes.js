const express = require('express');
const router = express.Router();
const {
  loginController,
  getMeController,
  updateMeController,
  uploadMePhotoController,
  changePasswordController,
  registerDahiraController,
  loginValidation,
  changePasswordValidation,
  registerDahiraValidation,
} = require('./auth.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

router.post('/login', loginValidation, loginController);
router.post('/register', registerDahiraValidation, registerDahiraController);

router.get('/me', authMiddleware, getMeController);
router.put('/me', authMiddleware, updateMeController);
router.post('/me/photo', authMiddleware, ...uploadMePhotoController);
router.patch('/change-password', authMiddleware, changePasswordValidation, changePasswordController);

module.exports = router;
