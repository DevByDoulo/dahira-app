const pool = require('../../config/db');
const crypto = require('crypto');
const { sendInvitationEmail, sendWelcomeEmail } = require('../../utils/email');
const { hashPassword } = require('../../utils/bcrypt');
const { generateToken } = require('../../utils/jwt');
const { FRONTEND_URL } = require('../../config/app');

const generateInvitationToken = () => crypto.randomBytes(32).toString('hex');

// Créer une invitation pour un membre existant (Option A — meilleure pratique)
// L'admin crée d'abord la fiche membre, puis invite par email pour définir le mot de passe.
const createInvitation = async (dahiraId, invitationData, invitedByMembreId) => {
  const { membre_id, email, role = 'membre' } = invitationData;

  const [membre] = await pool.query(
    'SELECT id, nom, prenom, telephone FROM membres WHERE id = ? AND dahira_id = ?',
    [membre_id, dahiraId],
  );
  if (membre.length === 0) throw new Error("Membre non trouvé ou n'appartient pas à ce dahira");

  // Vérifier si le membre a déjà un compte (password_hash défini)
  const [[membreCompte]] = await pool.query(
    'SELECT password_hash FROM membres WHERE id = ?',
    [membre_id],
  );
  if (membreCompte?.password_hash) {
    throw new Error('Ce membre possède déjà un compte actif');
  }

  // Vérifier que l'email n'est pas déjà utilisé par un autre membre ou une invitation en attente
  const [[{ emailCount }]] = await pool.query(
    `SELECT (
       SELECT COUNT(*) FROM membres WHERE email = ? AND dahira_id = ? AND id != ?
     ) + (
       SELECT COUNT(*) FROM invitations WHERE email = ? AND dahira_id = ? AND membre_id != ? AND statut = 'pending'
     ) AS emailCount`,
    [email, dahiraId, membre_id, email, dahiraId, membre_id],
  );
  if (emailCount > 0) {
    const err = new Error(`L'adresse email '${email}' est déjà utilisée dans ce dahira`);
    err.code = 'ER_DUP_EMAIL';
    throw err;
  }

  // Vérifier si une invitation active existe déjà
  const [existingInvitation] = await pool.query(
    `SELECT id FROM invitations
     WHERE membre_id = ? AND dahira_id = ? AND statut = 'pending' AND expires_at > NOW()`,
    [membre_id, dahiraId],
  );
  if (existingInvitation.length > 0) {
    throw new Error('Une invitation active existe déjà pour ce membre');
  }

  const token = generateInvitationToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const [result] = await pool.query(
    `INSERT INTO invitations (dahira_id, membre_id, email, role, token, expires_at, invited_by, statut)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [dahiraId, membre_id, email, role, token, expiresAt, invitedByMembreId],
  );

  const [[dahiraInfo]] = await pool.query('SELECT nom FROM dahiras WHERE id = ?', [dahiraId]);
  const [[inviterInfo]] = await pool.query('SELECT nom FROM membres WHERE id = ?', [invitedByMembreId]);

  const dahiraName = dahiraInfo?.nom || 'Dahira';
  const inviterName = inviterInfo?.nom || 'Un responsable';

  const baseUrl = FRONTEND_URL;
  const invitationLink = `${baseUrl}/accepter-invitation?token=${token}`;

  // Envoi en arrière-plan : la réponse HTTP ne doit pas attendre le SMTP.
  // En cas d'échec, l'invitation est supprimée pour permettre une nouvelle tentative.
  sendInvitationEmail(
    email,
    `${membre[0].prenom || ''} ${membre[0].nom}`.trim(),
    invitationLink,
    dahiraName,
    inviterName,
  ).catch(async (emailError) => {
    console.error("Échec de l'envoi de l'email d'invitation:", emailError.message);
    await pool.query('DELETE FROM invitations WHERE id = ?', [result.insertId]);
  });

  const [newInvitation] = await pool.query(
    'SELECT id, dahira_id, membre_id, email, role, token, expires_at, invited_by, statut, created_at FROM invitations WHERE id = ?',
    [result.insertId],
  );

  return { ...newInvitation[0], invitation_link: invitationLink };
};

const getInvitationByToken = async (token) => {
  const [invitations] = await pool.query(
    `SELECT i.*, m.nom as membre_nom, m.prenom as membre_prenom, m.telephone as membre_telephone,
            d.nom as dahira_nom
     FROM invitations i
     JOIN membres m ON i.membre_id = m.id
     JOIN dahiras d ON i.dahira_id = d.id
     WHERE i.token = ? AND i.statut = 'pending'`,
    [token],
  );

  if (invitations.length === 0) throw new Error('Invitation non trouvée ou déjà utilisée');

  const invitation = invitations[0];

  if (new Date(invitation.expires_at) < new Date()) {
    await pool.query('UPDATE invitations SET statut = ? WHERE id = ?', ['expired', invitation.id]);
    throw new Error('Cette invitation a expiré');
  }

  return invitation;
};

// Accepter une invitation : définit le mot de passe sur la fiche membre existante
const acceptInvitation = async (token, userData) => {
  const { password } = userData;
  const invitation = await getInvitationByToken(token);

  const passwordHash = await hashPassword(password);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Mettre à jour la fiche membre avec le mot de passe, le rôle et l'email si non défini
    await connection.query(
      'UPDATE membres SET password_hash = ?, role = ?, email = COALESCE(email, ?), actif = TRUE WHERE id = ?',
      [passwordHash, invitation.role, invitation.email, invitation.membre_id],
    );

    await connection.query(
      "UPDATE invitations SET statut = ?, accepted_at = NOW() WHERE id = ?",
      ['accepted', invitation.id],
    );

    await connection.commit();

    sendWelcomeEmail(
      invitation.email,
      `${invitation.membre_prenom || ''} ${invitation.membre_nom}`.trim(),
      invitation.dahira_nom,
    ).catch((err) => console.error('Erreur envoi email bienvenue:', err));

    const jwtToken = generateToken({
      id: invitation.membre_id,
      dahira_id: invitation.dahira_id,
      role: invitation.role,
    });

    const [newMembre] = await pool.query(
      'SELECT id, dahira_id, nom, prenom, telephone, email, role, actif, is_owner, created_at FROM membres WHERE id = ?',
      [invitation.membre_id],
    );

    return { token: jwtToken, user: newMembre[0] };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getInvitations = async (dahiraId, statut = null) => {
  let query = `
    SELECT i.*, m.nom as membre_nom, m.prenom as membre_prenom, m.telephone as membre_telephone,
           inv.nom as invited_by_name
    FROM invitations i
    JOIN membres m ON i.membre_id = m.id
    LEFT JOIN membres inv ON i.invited_by = inv.id
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

const cancelInvitation = async (invitationId, dahiraId) => {
  const [existing] = await pool.query(
    'SELECT id, statut FROM invitations WHERE id = ? AND dahira_id = ?',
    [invitationId, dahiraId],
  );
  if (existing.length === 0) throw new Error('Invitation non trouvée');
  if (existing[0].statut !== 'pending') throw new Error('Seules les invitations en attente peuvent être annulées');

  await pool.query('UPDATE invitations SET statut = ? WHERE id = ?', ['cancelled', invitationId]);

  const [updated] = await pool.query('SELECT * FROM invitations WHERE id = ?', [invitationId]);
  return updated[0];
};

const resendInvitation = async (invitationId, dahiraId) => {
  const [existing] = await pool.query(
    `SELECT i.*, m.nom as membre_nom, m.prenom as membre_prenom, d.nom as dahira_nom, inv.nom as inviter_name
     FROM invitations i
     JOIN membres m ON i.membre_id = m.id
     JOIN dahiras d ON i.dahira_id = d.id
     LEFT JOIN membres inv ON i.invited_by = inv.id
     WHERE i.id = ? AND i.dahira_id = ?`,
    [invitationId, dahiraId],
  );
  if (existing.length === 0) throw new Error('Invitation non trouvée');

  const invitation = existing[0];
  if (invitation.statut !== 'pending') throw new Error('Seules les invitations en attente peuvent être renvoyées');

  const newToken = generateInvitationToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await pool.query('UPDATE invitations SET token = ?, expires_at = ? WHERE id = ?', [
    newToken, expiresAt, invitationId,
  ]);

  const baseUrl = FRONTEND_URL;
  const invitationLink = `${baseUrl}/accepter-invitation?token=${newToken}`;

  // Envoi en arrière-plan : la réponse HTTP ne doit pas attendre le SMTP
  sendInvitationEmail(
    invitation.email,
    `${invitation.membre_prenom || ''} ${invitation.membre_nom}`.trim(),
    invitationLink,
    invitation.dahira_nom,
    invitation.inviter_name || 'Un responsable',
  ).catch((err) => {
    console.error("Échec du renvoi de l'email d'invitation:", err.message);
  });

  const [updated] = await pool.query('SELECT * FROM invitations WHERE id = ?', [invitationId]);
  return { ...updated[0], invitation_link: invitationLink };
};

module.exports = {
  createInvitation,
  getInvitationByToken,
  acceptInvitation,
  getInvitations,
  cancelInvitation,
  resendInvitation,
};
