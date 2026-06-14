const pool = require('../../config/db');
const crypto = require('crypto');
const { sendInvitationEmail, sendWelcomeEmail } = require('../../utils/email');
const { hashPassword } = require('../../utils/bcrypt');
const { generateToken } = require('../../utils/jwt');

/**
 * Génère un token d'invitation sécurisé
 */
const generateInvitationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Crée une invitation pour un membre
 */
const createInvitation = async (dahiraId, invitationData, invitedByUserId) => {
  const { membre_id, email, role = 'membre' } = invitationData;

  // Vérifier que le membre existe et appartient au dahira
  const [membre] = await pool.query(
    'SELECT id, nom, prenom, telephone FROM membres WHERE id = ? AND dahira_id = ?',
    [membre_id, dahiraId]
  );

  if (membre.length === 0) {
    throw new Error('Membre non trouvé ou n\'appartient pas à ce dahira');
  }

  // Vérifier si le membre a déjà un compte utilisateur
  const [existingUser] = await pool.query(
    'SELECT id FROM users WHERE membre_id = ? AND dahira_id = ?',
    [membre_id, dahiraId]
  );

  if (existingUser.length > 0) {
    throw new Error('Ce membre possède déjà un compte utilisateur');
  }

  // Vérifier si une invitation active existe déjà
  const [existingInvitation] = await pool.query(
    `SELECT id FROM invitations 
     WHERE membre_id = ? AND dahira_id = ? AND statut = 'pending' AND expires_at > NOW()`,
    [membre_id, dahiraId]
  );

  if (existingInvitation.length > 0) {
    throw new Error('Une invitation active existe déjà pour ce membre');
  }

  // Générer le token d'invitation
  const token = generateInvitationToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Expire dans 7 jours

  // Enregistrer l'invitation dans la base de données
  const [result] = await pool.query(
    `INSERT INTO invitations (dahira_id, membre_id, email, role, token, expires_at, invited_by, statut)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [dahiraId, membre_id, email, role, token, expiresAt, invitedByUserId]
  );

  // Récupérer les informations du dahira et de l'inviteur
  const [dahiraInfo] = await pool.query(
    'SELECT nom FROM dahiras WHERE id = ?',
    [dahiraId]
  );

  const [inviterInfo] = await pool.query(
    'SELECT nom FROM users WHERE id = ?',
    [invitedByUserId]
  );

  const dahiraName = dahiraInfo.length > 0 ? dahiraInfo[0].nom : 'Dahira';
  const inviterName = inviterInfo.length > 0 ? inviterInfo[0].nom : 'Un responsable';

  // Générer le lien d'invitation
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const invitationLink = `${baseUrl}/invitation/accept?token=${token}`;

  // Envoyer l'email d'invitation
  try {
    await sendInvitationEmail(
      email,
      `${membre[0].prenom} ${membre[0].nom}`,
      invitationLink,
      dahiraName,
      inviterName
    );
  } catch (emailError) {
    // Supprimer l'invitation si l'email échoue
    await pool.query('DELETE FROM invitations WHERE id = ?', [result.insertId]);
    throw new Error('Impossible d\'envoyer l\'email d\'invitation. Vérifiez l\'adresse email.');
  }

  const [newInvitation] = await pool.query(
    'SELECT id, dahira_id, membre_id, email, role, token, expires_at, invited_by, statut, created_at FROM invitations WHERE id = ?',
    [result.insertId]
  );

  return {
    ...newInvitation[0],
    invitation_link: invitationLink
  };
};

/**
 * Vérifie et récupère les détails d'une invitation par token
 */
const getInvitationByToken = async (token) => {
  const [invitations] = await pool.query(
    `SELECT i.*, m.nom as membre_nom, m.prenom as membre_prenom, m.telephone as membre_telephone, d.nom as dahira_nom
     FROM invitations i
     JOIN membres m ON i.membre_id = m.id
     JOIN dahiras d ON i.dahira_id = d.id
     WHERE i.token = ? AND i.statut = 'pending'`,
    [token]
  );

  if (invitations.length === 0) {
    throw new Error('Invitation non trouvée ou déjà utilisée');
  }

  const invitation = invitations[0];

  // Vérifier si l'invitation a expiré
  if (new Date(invitation.expires_at) < new Date()) {
    await pool.query(
      'UPDATE invitations SET statut = ? WHERE id = ?',
      ['expired', invitation.id]
    );
    throw new Error('Cette invitation a expiré');
  }

  return invitation;
};

/**
 * Accepte une invitation et crée le compte utilisateur
 */
const acceptInvitation = async (token, userData) => {
  const { password } = userData;

  // Récupérer et valider l'invitation
  const invitation = await getInvitationByToken(token);

  // Vérifier que le téléphone correspond à celui du membre (sécurité supplémentaire)
  if (userData.telephone && userData.telephone !== invitation.membre_telephone) {
    throw new Error('Le numéro de téléphone ne correspond pas au membre invité');
  }

  // Hasher le mot de passe
  const passwordHash = await hashPassword(password);

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Créer le compte utilisateur
    const [userResult] = await connection.query(
      `INSERT INTO users (dahira_id, membre_id, nom, telephone, email, password_hash, role, actif)
       VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        invitation.dahira_id,
        invitation.membre_id,
        `${invitation.membre_prenom} ${invitation.membre_nom}`,
        invitation.membre_telephone,
        invitation.email,
        passwordHash,
        invitation.role
      ]
    );

    const userId = userResult.insertId;

    // Marquer l'invitation comme acceptée
    await connection.query(
      'UPDATE invitations SET statut = ?, accepted_at = NOW() WHERE id = ?',
      ['accepted', invitation.id]
    );

    await connection.commit();

    // Envoyer l'email de bienvenue (non bloquant)
    sendWelcomeEmail(
      invitation.email,
      `${invitation.membre_prenom} ${invitation.membre_nom}`,
      invitation.dahira_nom
    ).catch(err => console.error('Erreur envoi email bienvenue:', err));

    // Générer le token JWT pour connexion automatique
    const jwtToken = generateToken({
      id: userId,
      dahira_id: invitation.dahira_id,
      role: invitation.role,
      membre_id: invitation.membre_id
    });

    // Récupérer les informations complètes de l'utilisateur
    const [newUser] = await pool.query(
      'SELECT id, dahira_id, membre_id, nom, telephone, email, role, actif, created_at FROM users WHERE id = ?',
      [userId]
    );

    return {
      token: jwtToken,
      user: newUser[0]
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Liste les invitations d'un dahira
 */
const getInvitations = async (dahiraId, statut = null) => {
  let query = `
    SELECT i.*, m.nom as membre_nom, m.prenom as membre_prenom, m.telephone as membre_telephone,
           u.nom as invited_by_name
    FROM invitations i
    JOIN membres m ON i.membre_id = m.id
    LEFT JOIN users u ON i.invited_by = u.id
    WHERE i.dahira_id = ?
  `;

  const params = [dahiraId];

  if (statut) {
    query += ' AND i.statut = ?';
    params.push(statut);
  }

  query += ' ORDER BY i.created_at DESC';

  const [invitations] = await pool.query(query, params);

  return invitations;
};

/**
 * Annule une invitation
 */
const cancelInvitation = async (invitationId, dahiraId) => {
  // Vérifier que l'invitation existe et appartient au dahira
  const [existing] = await pool.query(
    'SELECT id, statut FROM invitations WHERE id = ? AND dahira_id = ?',
    [invitationId, dahiraId]
  );

  if (existing.length === 0) {
    throw new Error('Invitation non trouvée');
  }

  if (existing[0].statut !== 'pending') {
    throw new Error('Seules les invitations en attente peuvent être annulées');
  }

  await pool.query(
    'UPDATE invitations SET statut = ? WHERE id = ?',
    ['cancelled', invitationId]
  );

  const [updatedInvitation] = await pool.query(
    'SELECT * FROM invitations WHERE id = ?',
    [invitationId]
  );

  return updatedInvitation[0];
};

/**
 * Renvoie une invitation
 */
const resendInvitation = async (invitationId, dahiraId) => {
  // Vérifier que l'invitation existe et appartient au dahira
  const [existing] = await pool.query(
    `SELECT i.*, m.nom as membre_nom, m.prenom as membre_prenom, d.nom as dahira_nom, u.nom as inviter_name
     FROM invitations i
     JOIN membres m ON i.membre_id = m.id
     JOIN dahiras d ON i.dahira_id = d.id
     LEFT JOIN users u ON i.invited_by = u.id
     WHERE i.id = ? AND i.dahira_id = ?`,
    [invitationId, dahiraId]
  );

  if (existing.length === 0) {
    throw new Error('Invitation non trouvée');
  }

  const invitation = existing[0];

  if (invitation.statut !== 'pending') {
    throw new Error('Seules les invitations en attente peuvent être renvoyées');
  }

  // Générer un nouveau token et prolonger l'expiration
  const newToken = generateInvitationToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await pool.query(
    'UPDATE invitations SET token = ?, expires_at = ? WHERE id = ?',
    [newToken, expiresAt, invitationId]
  );

  // Générer le nouveau lien
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const invitationLink = `${baseUrl}/invitation/accept?token=${newToken}`;

  // Renvoyer l'email
  await sendInvitationEmail(
    invitation.email,
    `${invitation.membre_prenom} ${invitation.membre_nom}`,
    invitationLink,
    invitation.dahira_nom,
    invitation.inviter_name || 'Un responsable'
  );

  const [updatedInvitation] = await pool.query(
    'SELECT * FROM invitations WHERE id = ?',
    [invitationId]
  );

  return {
    ...updatedInvitation[0],
    invitation_link: invitationLink
  };
};

module.exports = {
  createInvitation,
  getInvitationByToken,
  acceptInvitation,
  getInvitations,
  cancelInvitation,
  resendInvitation
};
