const { login, getMe, updateMe, updateMePhoto, changePassword, registerDahira } = require('./auth.service');
const { success, error } = require('../../utils/response');
const { body, validationResult } = require('express-validator');
const upload = require('../../middlewares/upload.middleware');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const loginController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg, 400);
    }
    const { telephone, password } = req.body;
    const result = await login(telephone, password);
    return success(res, result, 200);
  } catch (err) {
    next(err);
  }
};

const getMeController = async (req, res, next) => {
  try {
    const membre = await getMe(req.user.id);
    return success(res, membre, 200);
  } catch (err) {
    next(err);
  }
};

const updateMeController = async (req, res, next) => {
  try {
    const { nom, email, telephone } = req.body;
    if (!nom || !nom.trim()) {
      return error(res, 'Le nom est requis', 400);
    }
    const membre = await updateMe(req.user.id, req.user.dahira_id, { nom: nom.trim(), email, telephone });
    return success(res, membre, 200);
  } catch (err) {
    next(err);
  }
};

const uploadMePhotoController = [
  upload.single('photo'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return error(res, 'Aucun fichier fourni', 400);
      }

      const uploadsDir = path.join(process.cwd(), 'uploads', 'profils');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

      const filename = `profil_${req.user.id}_${Date.now()}`;
      const photoPath = path.join(uploadsDir, `${filename}.webp`);
      const thumbPath = path.join(uploadsDir, `${filename}_thumb.webp`);

      await sharp(req.file.buffer).resize(800, 800, { fit: 'inside' }).webp({ quality: 85 }).toFile(photoPath);
      await sharp(req.file.buffer).resize(150, 150, { fit: 'cover' }).webp({ quality: 80 }).toFile(thumbPath);

      const photoUrl = `/uploads/profils/${filename}.webp`;
      const thumbnailUrl = `/uploads/profils/${filename}_thumb.webp`;

      const membre = await updateMePhoto(req.user.id, photoUrl, thumbnailUrl);
      return success(res, membre, 200);
    } catch (err) {
      next(err);
    }
  },
];

const changePasswordController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg, 400);
    }
    const { ancien_password, nouveau_password } = req.body;
    const result = await changePassword(req.user.id, ancien_password, nouveau_password);
    return success(res, result, 200);
  } catch (err) {
    next(err);
  }
};

const registerDahiraController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return error(res, errors.array()[0].msg, 400);
    const result = await registerDahira(req.body);
    return success(res, result, 201);
  } catch (err) {
    if (err.message.includes('déjà utilisé')) return error(res, err.message, 409);
    next(err);
  }
};

const registerDahiraValidation = [
  body('dahira.nom').notEmpty().withMessage('Le nom du Dahira est requis'),
  body('user.nom').notEmpty().withMessage('Votre nom est requis'),
  body('user.telephone').notEmpty().withMessage('Votre téléphone est requis'),
  body('user.password')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le mot de passe doit contenir une majuscule, une minuscule et un chiffre'),
];

const loginValidation = [
  body('telephone').notEmpty().withMessage('Le téléphone est requis'),
  body('password').notEmpty().withMessage('Le mot de passe est requis'),
];

const changePasswordValidation = [
  body('ancien_password').notEmpty().withMessage("L'ancien mot de passe est requis"),
  body('nouveau_password')
    .isLength({ min: 8 })
    .withMessage('Le nouveau mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'),
];

module.exports = {
  loginController,
  getMeController,
  updateMeController,
  uploadMePhotoController,
  changePasswordController,
  registerDahiraController,
  loginValidation,
  changePasswordValidation,
  registerDahiraValidation,
};
