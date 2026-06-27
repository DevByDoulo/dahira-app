const {
  getAllEvenements,
  getEvenementById,
  createEvenement,
  updateEvenement,
  deleteEvenement
} = require('./evenements.service');
const { success, error } = require('../../utils/response');
const { body, validationResult } = require('express-validator');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const UPLOADS_BASE = path.resolve(__dirname, '..', '..', '..', 'uploads');

const getAllEvenementsController = async (req, res, next) => {
  try {
    const evenements = await getAllEvenements(req.dahira_id, req.user.id);
    return success(res, evenements, 200);
  } catch (err) {
    next(err);
  }
};

const getEvenementByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const evenement = await getEvenementById(id, req.dahira_id, req.user.id);
    return success(res, evenement, 200);
  } catch (err) {
    next(err);
  }
};

const createEvenementController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg, 400);
    }

    let photo_url = null;
    if (req.file) {
      const uploadDir = path.join(UPLOADS_BASE, 'photos', 'evenements');
      await fs.mkdir(uploadDir, { recursive: true });
      const filename = `evenement-${Date.now()}.jpg`;
      const photoPath = path.join(uploadDir, filename);
      await sharp(req.file.buffer)
        .resize(1200, 630, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toFile(photoPath);
      photo_url = `/uploads/photos/evenements/${filename}`;
    }

    const evenement = await createEvenement(req.dahira_id, { ...req.body, photo_url }, req.user.id);
    return success(res, evenement, 201);
  } catch (err) {
    next(err);
  }
};

const updateEvenementController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg, 400);
    }

    const { id } = req.params;
    const evenement = await updateEvenement(id, req.dahira_id, req.body);
    return success(res, evenement, 200);
  } catch (err) {
    next(err);
  }
};

const deleteEvenementController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await deleteEvenement(id, req.dahira_id);
    return success(res, result, 200);
  } catch (err) {
    next(err);
  }
};

const uploadEvenementPhotoController = async (req, res, next) => {
  try {
    if (!req.file) {
      return error(res, 'Aucun fichier fourni', 400);
    }

    const uploadDir = path.join(UPLOADS_BASE, 'photos', 'evenements');
    await fs.mkdir(uploadDir, { recursive: true });

    const filename = `evenement-${Date.now()}.jpg`;
    const photoPath = path.join(uploadDir, filename);

    await sharp(req.file.buffer)
      .resize(1200, 630, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(photoPath);

    return success(res, { photo_url: `/uploads/photos/evenements/${filename}` }, 200);
  } catch (err) {
    next(err);
  }
};

const createEvenementValidation = [
  body('titre').notEmpty().withMessage('Le titre est requis'),
  body('date_debut').notEmpty().withMessage('La date de l\'événement est requise'),
  body('description').optional(),
  body('lieu').optional(),
  body('type').optional().isIn(['conference', 'sortie', 'ceremonie', 'formation', 'autre']).withMessage('Type invalide'),
];

const updateEvenementValidation = [
  body('titre').notEmpty().withMessage('Le titre est requis'),
  body('date_debut').notEmpty().withMessage('La date de l\'événement est requise'),
  body('description').optional(),
  body('lieu').optional(),
  body('image_url').optional()
];

module.exports = {
  getAllEvenementsController,
  getEvenementByIdController,
  createEvenementController,
  updateEvenementController,
  deleteEvenementController,
  uploadEvenementPhotoController,
  createEvenementValidation,
  updateEvenementValidation
};
