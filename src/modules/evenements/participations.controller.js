const pool = require('../../config/db');
const { success, error } = require('../../utils/response');
const { body, validationResult } = require('express-validator');

const toggleInscriptionController = async (req, res, next) => {
  try {
    const { id: evenementId } = req.params;
    const membreId = req.user.membre_id;

    if (!membreId) {
      return error(res, 'Ce compte n\'est pas lié à un membre', 400);
    }

    // Verify evenement belongs to dahira
    const [evenement] = await pool.query(
      'SELECT id FROM evenements WHERE id = ? AND dahira_id = ?',
      [evenementId, req.dahira_id]
    );

    if (evenement.length === 0) {
      return error(res, 'Événement non trouvé', 404);
    }

    // Check if participation exists
    const [existing] = await pool.query(
      'SELECT id, inscrit FROM participations WHERE evenement_id = ? AND membre_id = ?',
      [evenementId, membreId]
    );

    let newInscrit;

    if (existing.length > 0) {
      // Toggle inscrit
      newInscrit = !existing[0].inscrit;
      await pool.query(
        'UPDATE participations SET inscrit = ? WHERE id = ?',
        [newInscrit, existing[0].id]
      );
    } else {
      // Create new participation with inscrit=TRUE
      newInscrit = true;
      await pool.query(
        'INSERT INTO participations (evenement_id, membre_id, inscrit, present) VALUES (?, ?, TRUE, NULL)',
        [evenementId, membreId]
      );
    }

    return success(res, { inscrit: newInscrit }, 200);
  } catch (err) {
    next(err);
  }
};

const getParticipantsController = async (req, res, next) => {
  try {
    const { id: evenementId } = req.params;

    // Verify evenement belongs to dahira
    const [evenement] = await pool.query(
      'SELECT id FROM evenements WHERE id = ? AND dahira_id = ?',
      [evenementId, req.dahira_id]
    );

    if (evenement.length === 0) {
      return error(res, 'Événement non trouvé', 404);
    }

    // Get participants (inscrit=TRUE OR present IS NOT NULL)
    const [participants] = await pool.query(
      `SELECT p.membre_id, m.nom, m.prenom, p.inscrit, p.present
       FROM participations p
       JOIN membres m ON p.membre_id = m.id
       WHERE p.evenement_id = ? AND (p.inscrit = TRUE OR p.present IS NOT NULL)
       ORDER BY m.nom, m.prenom`,
      [evenementId]
    );

    return success(res, participants, 200);
  } catch (err) {
    next(err);
  }
};

const updatePresenceController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg, 400);
    }

    const { id: evenementId, membre_id } = req.params;
    const { present } = req.body;

    // Verify evenement belongs to dahira
    const [evenement] = await pool.query(
      'SELECT id FROM evenements WHERE id = ? AND dahira_id = ?',
      [evenementId, req.dahira_id]
    );

    if (evenement.length === 0) {
      return error(res, 'Événement non trouvé', 404);
    }

    // Verify membre belongs to dahira
    const [membre] = await pool.query(
      'SELECT id FROM membres WHERE id = ? AND dahira_id = ?',
      [membre_id, req.dahira_id]
    );

    if (membre.length === 0) {
      return error(res, 'Membre non trouvé', 404);
    }

    // Check if participation exists
    const [existing] = await pool.query(
      'SELECT id FROM participations WHERE evenement_id = ? AND membre_id = ?',
      [evenementId, membre_id]
    );

    let participation;

    if (existing.length > 0) {
      // Update present
      await pool.query(
        'UPDATE participations SET present = ? WHERE id = ?',
        [present, existing[0].id]
      );

      const [updated] = await pool.query(
        `SELECT p.membre_id, m.nom, m.prenom, p.inscrit, p.present
         FROM participations p
         JOIN membres m ON p.membre_id = m.id
         WHERE p.id = ?`,
        [existing[0].id]
      );
      participation = updated[0];
    } else {
      // Create new participation with inscrit=FALSE
      await pool.query(
        'INSERT INTO participations (evenement_id, membre_id, inscrit, present) VALUES (?, ?, FALSE, ?)',
        [evenementId, membre_id, present]
      );

      const [created] = await pool.query(
        `SELECT p.membre_id, m.nom, m.prenom, p.inscrit, p.present
         FROM participations p
         JOIN membres m ON p.membre_id = m.id
         WHERE p.evenement_id = ? AND p.membre_id = ?`,
        [evenementId, membre_id]
      );
      participation = created[0];
    }

    return success(res, participation, 200);
  } catch (err) {
    next(err);
  }
};

const updatePresenceValidation = [
  body('present').isBoolean().withMessage('Le champ present doit être un booléen')
];

module.exports = {
  toggleInscriptionController,
  getParticipantsController,
  updatePresenceController,
  updatePresenceValidation
};
