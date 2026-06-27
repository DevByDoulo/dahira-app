const pool = require('../../config/db');
const { sendNotificationEmail } = require('../../utils/email');

const NOTIFICATION_TYPES = {
  NOUVELLE_ANNONCE: 'nouvelle_annonce',
  SEANCE_RAPPEL: 'seance_rappel',
  COTISATION_RETARD: 'cotisation_retard',
  INVITATION_ACCEPTEE: 'invitation_acceptee',
  EVENEMENT_AJOUTE: 'evenement_ajoute',
  MESSAGE_BUREAU: 'message_bureau',
  VALIDATION_COTISATION: 'validation_cotisation',
};

const createNotification = async (notificationData) => {
  const { membre_id, dahira_id, type, title, message, link, metadata } = notificationData;

  const [result] = await pool.query(
    `INSERT INTO notifications (membre_id, dahira_id, type, title, message, link, metadata)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [membre_id, dahira_id, type, title, message, link, JSON.stringify(metadata || {})],
  );

  const [notification] = await pool.query('SELECT * FROM notifications WHERE id = ?', [result.insertId]);

  const [membrePrefs] = await pool.query(
    'SELECT email, email_notifications FROM membres WHERE id = ?',
    [membre_id],
  );

  if (membrePrefs.length > 0 && membrePrefs[0].email && membrePrefs[0].email_notifications !== false) {
    try {
      await sendNotificationEmail(membrePrefs[0].email, title, message, link);
    } catch (err) {
      console.error('Erreur envoi email notification:', err);
    }
  }

  return notification[0];
};

const createBulkNotifications = async (membreIds, dahiraId, notificationData) => {
  const { type, title, message, link, metadata } = notificationData;

  const values = membreIds.map((membreId) => [
    membreId,
    dahiraId,
    type,
    title,
    message,
    link,
    JSON.stringify(metadata || {}),
  ]);

  await pool.query(
    'INSERT INTO notifications (membre_id, dahira_id, type, title, message, link, metadata) VALUES ?',
    [values],
  );

  setTimeout(async () => {
    const [membres] = await pool.query(
      'SELECT email FROM membres WHERE id IN (?) AND email IS NOT NULL AND email_notifications != FALSE',
      [membreIds],
    );
    for (const m of membres) {
      try {
        await sendNotificationEmail(m.email, title, message, link);
      } catch (err) {
        console.error('Erreur envoi email notification:', err);
      }
    }
  }, 0);

  return { count: membreIds.length, message: 'Notifications créées avec succès' };
};

const getUserNotifications = async (membreId, limit = 50, offset = 0) => {
  const [notifications] = await pool.query(
    'SELECT * FROM notifications WHERE membre_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [membreId, limit, offset],
  );

  const [countResult] = await pool.query(
    'SELECT COUNT(*) as total, SUM(CASE WHEN is_read = FALSE THEN 1 ELSE 0 END) as unread FROM notifications WHERE membre_id = ?',
    [membreId],
  );

  return { notifications, total: countResult[0].total, unread: countResult[0].unread };
};

const markAsRead = async (notificationId, membreId) => {
  const [result] = await pool.query(
    'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = ? AND membre_id = ?',
    [notificationId, membreId],
  );
  if (result.affectedRows === 0) throw new Error('Notification non trouvée');
  return { message: 'Notification marquée comme lue' };
};

const markAllAsRead = async (membreId) => {
  await pool.query(
    'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE membre_id = ? AND is_read = FALSE',
    [membreId],
  );
  return { message: 'Toutes les notifications ont été marquées comme lues' };
};

const deleteNotification = async (notificationId, membreId) => {
  const [result] = await pool.query(
    'DELETE FROM notifications WHERE id = ? AND membre_id = ?',
    [notificationId, membreId],
  );
  if (result.affectedRows === 0) throw new Error('Notification non trouvée');
  return { message: 'Notification supprimée' };
};

const notifyAllMembers = async (dahiraId, notificationData) => {
  const [membres] = await pool.query(
    'SELECT id FROM membres WHERE dahira_id = ? AND actif = TRUE AND password_hash IS NOT NULL',
    [dahiraId],
  );

  const membreIds = membres.map((m) => m.id);
  if (membreIds.length === 0) return { count: 0, message: 'Aucun membre à notifier' };

  return createBulkNotifications(membreIds, dahiraId, notificationData);
};

const sendSeanceReminders = async () => {
  const [seances] = await pool.query(
    `SELECT s.*, d.nom as dahira_nom
     FROM seances s
     JOIN dahiras d ON s.dahira_id = d.id
     WHERE s.date_seance BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 24 HOUR)
     AND s.rappel_envoye = FALSE`,
  );

  let notificationsSent = 0;

  for (const seance of seances) {
    const [membres] = await pool.query(
      'SELECT id FROM membres WHERE dahira_id = ? AND actif = TRUE AND password_hash IS NOT NULL',
      [seance.dahira_id],
    );

    const membreIds = membres.map((m) => m.id);

    if (membreIds.length > 0) {
      await createBulkNotifications(membreIds, seance.dahira_id, {
        type: NOTIFICATION_TYPES.SEANCE_RAPPEL,
        title: 'Rappel de séance',
        message: `La séance "${seance.type}" aura lieu demain à ${seance.heure_debut || ''}`,
        link: `/seances/${seance.id}`,
        metadata: { seance_id: seance.id },
      });

      notificationsSent += membreIds.length;
      await pool.query('UPDATE seances SET rappel_envoye = TRUE WHERE id = ?', [seance.id]);
    }
  }

  return { seances: seances.length, notifications: notificationsSent };
};

const sendCotisationRetardAlerts = async (dahiraId) => {
  const currentMonth = new Date().toISOString().slice(0, 7);

  const [membres] = await pool.query(
    `SELECT id FROM membres
     WHERE dahira_id = ? AND actif = TRUE AND password_hash IS NOT NULL
     AND id NOT IN (
       SELECT membre_id FROM cotisations
       WHERE dahira_id = ? AND mois_concerne = ? AND statut = 'approved'
     )`,
    [dahiraId, dahiraId, currentMonth],
  );

  if (membres.length === 0) return { count: 0, message: 'Aucun membre en retard' };

  const membreIds = membres.map((m) => m.id);

  await createBulkNotifications(membreIds, dahiraId, {
    type: NOTIFICATION_TYPES.COTISATION_RETARD,
    title: 'Cotisation en retard',
    message: `Votre cotisation du mois de ${currentMonth} n'a pas encore été enregistrée`,
    link: '/cotisations',
    metadata: { mois: currentMonth },
  });

  return { count: membreIds.length, message: `${membreIds.length} alertes envoyées` };
};

module.exports = {
  NOTIFICATION_TYPES,
  createNotification,
  createBulkNotifications,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  notifyAllMembers,
  sendSeanceReminders,
  sendCotisationRetardAlerts,
};
