const {
  createInvitation,
  getInvitationByToken,
  acceptInvitation,
  getInvitations,
  cancelInvitation,
  resendInvitation
} = require('./invitations.service');
const { success, error } = require('../../utils/response');
const { body, validationResult } = require('express-validator');

const createInvitationController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg, 400);
    }

    const invitation = await createInvitation(req.dahira_id, req.body, req.user.id);
    return success(res, invitation, 201);
  } catch (err) {
    next(err);
  }
};

const getInvitationByTokenController = async (req, res, next) => {
  try {
    const { token } = req.params;
    const invitation = await getInvitationByToken(token);
    
    // Ne pas exposer toutes les informations sensibles
    const publicInvitation = {
      membre_nom: invitation.membre_nom,
      membre_prenom: invitation.membre_prenom,
      dahira_nom: invitation.dahira_nom,
      email: invitation.email,
      role: invitation.role,
      expires_at: invitation.expires_at
    };
    
    return success(res, publicInvitation, 200);
  } catch (err) {
    next(err);
  }
};

const acceptInvitationController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg, 400);
    }

    const { token } = req.body;
    const result = await acceptInvitation(token, req.body);
    return success(res, result, 201);
  } catch (err) {
    next(err);
  }
};

const getInvitationsController = async (req, res, next) => {
  try {
    const { statut } = req.query;
    const invitations = await getInvitations(req.dahira_id, statut);
    return success(res, invitations, 200);
  } catch (err) {
    next(err);
  }
};

const cancelInvitationController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const invitation = await cancelInvitation(id, req.dahira_id);
    return success(res, invitation, 200);
  } catch (err) {
    next(err);
  }
};

const resendInvitationController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const invitation = await resendInvitation(id, req.dahira_id);
    return success(res, invitation, 200);
  } catch (err) {
    next(err);
  }
};

const createInvitationValidation = [
  body('membre_id').isInt({ min: 1 }).withMessage('ID du membre requis'),
  body('email').isEmail().withMessage('Email valide requis'),
  body('role').optional().isIn(['membre', 'tresorier', 'responsable_org', 'bureau']).withMessage('Rôle invalide')
];

const acceptInvitationValidation = [
  body('token').notEmpty().withMessage('Token d\'invitation requis'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('telephone').optional().notEmpty().withMessage('Numéro de téléphone invalide')
];

module.exports = {
  createInvitationController,
  getInvitationByTokenController,
  acceptInvitationController,
  getInvitationsController,
  cancelInvitationController,
  resendInvitationController,
  createInvitationValidation,
  acceptInvitationValidation
};
