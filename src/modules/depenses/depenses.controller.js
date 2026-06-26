const {
  createDepense,
  getAllDepenses,
  getDepenseById,
  updateDepense,
  validerDepense,
  rejeterDepense,
  deleteDepense,
  getStatistiques,
  uploadJustificatif
} = require('./depenses.service');
const { success, error } = require('../../utils/response');
const { body, validationResult } = require('express-validator');

/**
 * Créer une dépense
 */
const createDepenseController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg, 400);
    }

    const dahiraId = req.user.dahira_id;
    const creePar = req.user.id;

    const depense = await createDepense(req.body, dahiraId, creePar);
    return success(res, depense, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Récupérer toutes les dépenses
 */
const getAllDepensesController = async (req, res, next) => {
  try {
    const dahiraId = req.user.dahira_id;
    const filters = {
      statut: req.query.statut,
      categorie: req.query.categorie,
      date_debut: req.query.date_debut,
      date_fin: req.query.date_fin,
      limit: req.query.limit,
      offset: req.query.offset
    };

    const result = await getAllDepenses(dahiraId, filters);
    return success(res, result, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Récupérer une dépense par ID
 */
const getDepenseByIdController = async (req, res, next) => {
  try {
    const dahiraId = req.user.dahira_id;
    const { id } = req.params;

    const depense = await getDepenseById(id, dahiraId);
    return success(res, depense, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Mettre à jour une dépense
 */
const updateDepenseController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg, 400);
    }

    const dahiraId = req.user.dahira_id;
    const { id } = req.params;

    const depense = await updateDepense(id, dahiraId, req.body);
    return success(res, depense, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Valider une dépense
 */
const validerDepenseController = async (req, res, next) => {
  try {
    const dahiraId = req.user.dahira_id;
    const validePar = req.user.id;
    const { id } = req.params;

    const depense = await validerDepense(id, dahiraId, validePar);
    return success(res, depense, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Rejeter une dépense
 */
const rejeterDepenseController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg, 400);
    }

    const dahiraId = req.user.dahira_id;
    const validePar = req.user.id;
    const { id } = req.params;
    const { motif } = req.body;

    const depense = await rejeterDepense(id, dahiraId, validePar, motif);
    return success(res, depense, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Supprimer une dépense
 */
const deleteDepenseController = async (req, res, next) => {
  try {
    const dahiraId = req.user.dahira_id;
    const { id } = req.params;

    const result = await deleteDepense(id, dahiraId);
    return success(res, result, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Récupérer les statistiques
 */
const getStatistiquesController = async (req, res, next) => {
  try {
    const dahiraId = req.user.dahira_id;
    const filters = {
      date_debut: req.query.date_debut,
      date_fin: req.query.date_fin,
      periode: req.query.periode
    };

    const stats = await getStatistiques(dahiraId, filters);
    return success(res, stats, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Upload un justificatif
 */
const uploadJustificatifController = async (req, res, next) => {
  try {
    if (!req.file) {
      return error(res, 'Aucun fichier fourni', 400);
    }
    const result = await uploadJustificatif(req.file);
    return success(res, result, 200);
  } catch (err) {
    next(err);
  }
};

// Validations
const createDepenseValidation = [
  body('description').notEmpty().withMessage('Description requise'),
  body('montant').isFloat({ min: 0 }).withMessage('Montant invalide'),
  body('categorie').isIn(['evenements', 'location', 'nourriture', 'donations', 'maintenance', 'autres']).withMessage('Catégorie invalide'),
  body('mode_paiement').isIn(['especes', 'wave', 'orange_money', 'virement', 'cheque']).withMessage('Mode de paiement invalide'),
  body('date_depense').isDate().withMessage('Date invalide')
];

const updateDepenseValidation = [
  body('montant').optional().isFloat({ min: 0 }).withMessage('Montant invalide'),
  body('categorie').optional().isIn(['evenements', 'location', 'nourriture', 'donations', 'maintenance', 'autres']).withMessage('Catégorie invalide'),
  body('mode_paiement').optional().isIn(['especes', 'wave', 'orange_money', 'virement', 'cheque']).withMessage('Mode de paiement invalide'),
  body('date_depense').optional().isDate().withMessage('Date invalide')
];

const rejeterDepenseValidation = [
  body('motif').notEmpty().withMessage('Motif de rejet requis')
];

module.exports = {
  createDepenseController,
  getAllDepensesController,
  getDepenseByIdController,
  updateDepenseController,
  validerDepenseController,
  rejeterDepenseController,
  deleteDepenseController,
  getStatistiquesController,
  uploadJustificatifController,
  createDepenseValidation,
  updateDepenseValidation,
  rejeterDepenseValidation
};
