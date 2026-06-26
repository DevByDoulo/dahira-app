const {
  getAllAnnonces,
  getAnnonceById,
  createAnnonce,
  updateAnnonce,
  deleteAnnonce,
  toggleEpinglee,
  uploadAnnonceImage
} = require('./annonces.service');
const { success, error } = require('../../utils/response');
const { body, validationResult } = require('express-validator');

const getAllAnnoncesController = async (req, res, next) => {
  try {
    const annonces = await getAllAnnonces(req.dahira_id, req.user.role);
    return success(res, annonces, 200);
  } catch (err) {
    next(err);
  }
};

const getAnnonceByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const annonce = await getAnnonceById(id, req.dahira_id);
    return success(res, annonce, 200);
  } catch (err) {
    next(err);
  }
};

const createAnnonceController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg, 400);
    }

    const annonce = await createAnnonce(req.dahira_id, req.body, req.user.id);
    return success(res, annonce, 201);
  } catch (err) {
    next(err);
  }
};

const updateAnnonceController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg, 400);
    }

    const { id } = req.params;
    const annonce = await updateAnnonce(id, req.dahira_id, req.body);
    return success(res, annonce, 200);
  } catch (err) {
    next(err);
  }
};

const deleteAnnonceController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await deleteAnnonce(id, req.dahira_id);
    return success(res, result, 200);
  } catch (err) {
    next(err);
  }
};

const toggleEpingleeController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const annonce = await toggleEpinglee(id, req.dahira_id);
    return success(res, annonce, 200);
  } catch (err) {
    next(err);
  }
};

const createAnnonceValidation = [
  body('titre').notEmpty().withMessage('Le titre est requis'),
  body('contenu').notEmpty().withMessage('Le contenu est requis'),
  body('image_url').optional(),
  body('cible_groupe').optional()
];

const updateAnnonceValidation = [
  body('titre').notEmpty().withMessage('Le titre est requis'),
  body('contenu').notEmpty().withMessage('Le contenu est requis'),
  body('image_url').optional(),
  body('cible_groupe').optional()
];

const uploadAnnonceImageController = async (req, res, next) => {
  try {
    if (!req.file) return error(res, 'Aucun fichier reçu', 400);
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const result = await uploadAnnonceImage(req.file, baseUrl);
    return success(res, result, 200);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllAnnoncesController,
  getAnnonceByIdController,
  createAnnonceController,
  updateAnnonceController,
  deleteAnnonceController,
  toggleEpingleeController,
  uploadAnnonceImageController,
  createAnnonceValidation,
  updateAnnonceValidation
};
