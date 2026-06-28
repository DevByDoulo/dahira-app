const { createSeance, getAllSeances, getSeanceCourante, getSeanceById, updateSeance, updateSeancePhoto, cloturerSeance } = require('./seances.service');
const { success, error } = require('../../utils/response');
const { body, validationResult, query } = require('express-validator');
const upload = require('../../middlewares/upload.middleware');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const createSeanceController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg, 400);
    }

    const seance = await createSeance(req.dahira_id, req.body);
    return success(res, seance, 201);
  } catch (err) {
    next(err);
  }
};

const getAllSeancesController = async (req, res, next) => {
  try {
    const { type, cloturee, limit } = req.query;
    const clotureeFilter = cloturee === undefined ? null : cloturee === 'true' || cloturee === '1';
    const limitVal = limit ? parseInt(limit, 10) : null;
    const seances = await getAllSeances(req.dahira_id, type || null, clotureeFilter, limitVal);
    return success(res, seances, 200);
  } catch (err) {
    next(err);
  }
};

const getSeanceCouranteController = async (req, res, next) => {
  try {
    const seance = await getSeanceCourante(req.dahira_id);
    return success(res, seance, 200);
  } catch (err) {
    next(err);
  }
};

const cloturerSeanceController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const seance = await cloturerSeance(id, req.dahira_id);
    return success(res, seance, 200);
  } catch (err) {
    next(err);
  }
};

const getSeanceByIdController = async (req, res, next) => {
  try {
    const seance = await getSeanceById(req.params.id, req.dahira_id);
    return success(res, seance, 200);
  } catch (err) {
    next(err);
  }
};

const updateSeanceController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg, 400);
    }
    const seance = await updateSeance(req.params.id, req.dahira_id, req.body);
    return success(res, seance, 200);
  } catch (err) {
    next(err);
  }
};

const uploadSeancePhotoController = [
  upload.single('photo'),
  async (req, res, next) => {
    try {
      if (!req.file) return error(res, 'Aucun fichier fourni', 400);

      const uploadsDir = path.join(process.cwd(), 'uploads', 'seances');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

      const { id } = req.params;
      const filename = `seance_${id}_${Date.now()}`;
      const photoPath = path.join(uploadsDir, `${filename}.webp`);

      await sharp(req.file.buffer)
        .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(photoPath);

      const photoUrl = `/uploads/seances/${filename}.webp`;
      const seance = await updateSeancePhoto(id, req.dahira_id, photoUrl);
      return success(res, seance, 200);
    } catch (err) {
      next(err);
    }
  },
];

const createSeanceValidation = [
  body('date_seance').notEmpty().withMessage('La date de séance est requise'),
  body('type')
    .notEmpty().withMessage('Le type est requis')
    .isIn(['dahira', 'mensuelle', 'autre'])
    .withMessage('Le type doit être dahira, mensuelle ou autre'),
];

const getAllSeancesValidation = [
  query('type').optional().isIn(['dahira', 'mensuelle', 'autre']).withMessage('Le type doit être dahira, mensuelle ou autre'),
  query('cloturee').optional().isIn(['true', 'false', '0', '1']).withMessage('cloturee doit être true ou false'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit doit être un entier entre 1 et 100'),
];

const updateSeanceValidation = [
  body('date_seance').notEmpty().withMessage('La date de séance est requise'),
  body('type')
    .notEmpty().withMessage('Le type est requis')
    .isIn(['dahira', 'mensuelle', 'autre'])
    .withMessage('Type invalide'),
];

module.exports = {
  createSeanceController,
  getAllSeancesController,
  getSeanceCouranteController,
  getSeanceByIdController,
  updateSeanceController,
  uploadSeancePhotoController,
  cloturerSeanceController,
  createSeanceValidation,
  getAllSeancesValidation,
  updateSeanceValidation
};
