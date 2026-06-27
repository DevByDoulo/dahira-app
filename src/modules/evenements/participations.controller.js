const pool = require('../../config/db');
const { success, error } = require('../../utils/response');
const { body, validationResult } = require('express-validator');

const toggleInscriptionController = async (req, res, next) => {
  try {
    const { id: evenementId } = req.params;
    const membreId = req.user.id;

    const [evenement] = await pool.query(
      'SELECT id, inscriptions_ouvertes FROM evenements WHERE id = ? AND dahira_id = ?',
      [evenementId, req.dahira_id],
    );
    if (evenement.length === 0) return error(res, 'Événement non trouvé', 404);
    if (!evenement[0].inscriptions_ouvertes) return error(res, 'Les inscriptions sont fermées', 400);

    const [existing] = await pool.query(
      'SELECT id, statut FROM participations WHERE evenement_id = ? AND membre_id = ?',
      [evenementId, membreId],
    );

    let statut;

    if (existing.length > 0) {
      statut = existing[0].statut === 'annule' ? 'inscrit' : 'annule';
      await pool.query('UPDATE participations SET statut = ? WHERE id = ?', [statut, existing[0].id]);
    } else {
      statut = 'inscrit';
      await pool.query(
        'INSERT INTO participations (evenement_id, membre_id, dahira_id, statut) VALUES (?, ?, ?, ?)',
        [evenementId, membreId, req.dahira_id, statut],
      );
    }

    return success(res, { statut }, 200);
  } catch (err) {
    next(err);
  }
};

const getParticipantsController = async (req, res, next) => {
  try {
    const { id: evenementId } = req.params;

    const [evenement] = await pool.query(
      'SELECT id FROM evenements WHERE id = ? AND dahira_id = ?',
      [evenementId, req.dahira_id],
    );
    if (evenement.length === 0) return error(res, 'Événement non trouvé', 404);

    const [participants] = await pool.query(
      `SELECT p.membre_id, m.nom, m.prenom, p.statut
       FROM participations p
       JOIN membres m ON p.membre_id = m.id
       WHERE p.evenement_id = ? AND p.statut != 'annule'
       ORDER BY m.nom, m.prenom`,
      [evenementId],
    );

    return success(res, participants, 200);
  } catch (err) {
    next(err);
  }
};

const updatePresenceController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return error(res, errors.array()[0].msg, 400);

    const { id: evenementId, membre_id } = req.params;
    const { present } = req.body;

    const [evenement] = await pool.query(
      'SELECT id FROM evenements WHERE id = ? AND dahira_id = ?',
      [evenementId, req.dahira_id],
    );
    if (evenement.length === 0) return error(res, 'Événement non trouvé', 404);

    const [membre] = await pool.query(
      'SELECT id FROM membres WHERE id = ? AND dahira_id = ?',
      [membre_id, req.dahira_id],
    );
    if (membre.length === 0) return error(res, 'Membre non trouvé', 404);

    const statut = present ? 'present' : 'inscrit';

    const [existing] = await pool.query(
      'SELECT id FROM participations WHERE evenement_id = ? AND membre_id = ?',
      [evenementId, membre_id],
    );

    if (existing.length > 0) {
      await pool.query('UPDATE participations SET statut = ? WHERE id = ?', [statut, existing[0].id]);
    } else {
      await pool.query(
        'INSERT INTO participations (evenement_id, membre_id, dahira_id, statut) VALUES (?, ?, ?, ?)',
        [evenementId, membre_id, req.dahira_id, statut],
      );
    }

    const [updated] = await pool.query(
      `SELECT p.membre_id, m.nom, m.prenom, p.statut
       FROM participations p
       JOIN membres m ON p.membre_id = m.id
       WHERE p.evenement_id = ? AND p.membre_id = ?`,
      [evenementId, membre_id],
    );

    return success(res, updated[0], 200);
  } catch (err) {
    next(err);
  }
};

const updatePresenceValidation = [
  body('present').isBoolean().withMessage('Le champ present doit être un booléen'),
];

module.exports = {
  toggleInscriptionController,
  getParticipantsController,
  updatePresenceController,
  updatePresenceValidation,
};
