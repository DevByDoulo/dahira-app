const {
  getAllMembres,
  getMembresAvecCompte,
  getMembreById,
  createMembre,
  updateMembre,
  updateRole,
  desactiverMembre,
  activerMembre,
  updateMembrePhoto,
} = require('./membres.service');
const { success, error } = require('../../utils/response');
const { body, validationResult } = require('express-validator');
const upload = require('../../middlewares/upload.middleware');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const getAllMembresController = async (req, res, next) => {
  try {
    const membres = await getAllMembres(req.dahira_id);
    return success(res, membres, 200);
  } catch (err) {
    next(err);
  }
};

const getMembresAvecCompteController = async (req, res, next) => {
  try {
    const membres = await getMembresAvecCompte(req.dahira_id);
    return success(res, membres, 200);
  } catch (err) {
    next(err);
  }
};

const getMembreByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;

    if (role !== 'bureau' && role !== 'tresorier' && userId !== parseInt(id)) {
      return error(res, 'Rôle insuffisant pour accéder à cette ressource', 403);
    }

    const membre = await getMembreById(id, req.dahira_id);
    return success(res, membre, 200);
  } catch (err) {
    next(err);
  }
};

const createMembreController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return error(res, errors.array()[0].msg, 400);

    const membre = await createMembre(req.dahira_id, req.body);
    return success(res, membre, 201);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return error(res, 'Ce numéro de téléphone est déjà utilisé', 409);
    if (err.code === 'ER_DUP_EMAIL') return error(res, err.message, 409);
    next(err);
  }
};

const updateMembreController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return error(res, errors.array()[0].msg, 400);

    const { id } = req.params;
    const membre = await updateMembre(id, req.dahira_id, req.body, req.user);
    return success(res, membre, 200);
  } catch (err) {
    if (err.message.startsWith('Action non autorisée')) return error(res, err.message, 403);
    if (err.code === 'ER_DUP_EMAIL') return error(res, err.message, 409);
    next(err);
  }
};

const updateRoleController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!role) return error(res, 'Le rôle est requis', 400);
    const membre = await updateRole(id, req.dahira_id, role, req.user);
    return success(res, membre, 200);
  } catch (err) {
    if (err.message.startsWith('Action non autorisée')) return error(res, err.message, 403);
    next(err);
  }
};

const desactiverMembreController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const membre = await desactiverMembre(id, req.dahira_id, req.user);
    return success(res, membre, 200);
  } catch (err) {
    if (err.message.startsWith('Action non autorisée')) return error(res, err.message, 403);
    next(err);
  }
};

const activerMembreController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const membre = await activerMembre(id, req.dahira_id, req.user);
    return success(res, membre, 200);
  } catch (err) {
    if (err.message.startsWith('Action non autorisée')) return error(res, err.message, 403);
    next(err);
  }
};

const uploadMembrePhotoController = [
  upload.single('photo'),
  async (req, res, next) => {
    try {
      if (!req.file) return error(res, 'Aucun fichier fourni', 400);

      const uploadsDir = path.join(process.cwd(), 'uploads', 'membres');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

      const { id } = req.params;
      const filename = `membre_${id}_${Date.now()}`;
      const photoPath = path.join(uploadsDir, `${filename}.webp`);
      const thumbPath = path.join(uploadsDir, `${filename}_thumb.webp`);

      await sharp(req.file.buffer).resize(800, 800, { fit: 'inside' }).webp({ quality: 85 }).toFile(photoPath);
      await sharp(req.file.buffer).resize(150, 150, { fit: 'cover' }).webp({ quality: 80 }).toFile(thumbPath);

      const photoUrl = `/uploads/membres/${filename}.webp`;
      const thumbnailUrl = `/uploads/membres/${filename}_thumb.webp`;

      const membre = await updateMembrePhoto(id, req.dahira_id, photoUrl, thumbnailUrl);
      return success(res, membre, 200);
    } catch (err) {
      next(err);
    }
  },
];

const createMembreValidation = [
  body('nom').notEmpty().withMessage('Le nom est requis'),
  body('telephone').notEmpty().withMessage('Le téléphone est requis'),
];

const updateMembreValidation = [
  body('nom').notEmpty().withMessage('Le nom est requis'),
  body('telephone').notEmpty().withMessage('Le téléphone est requis'),
];

module.exports = {
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
};
