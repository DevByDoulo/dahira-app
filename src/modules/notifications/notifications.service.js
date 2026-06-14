const pool = require('../../config/db');
const { sendNotificationEmail } = require('../../utils/email');

/**
 * Types de notifications supportés
 */
const NOTIFICATION_TYPES = {
  NOUVELLE_ANNONCE: 'nouvelle_annonce',
  SEANCE_RAPPEL: 'seance_rappel',
  COTISATION_RETARD: 'cotisation_retard',
  INVITATION_ACCEPTEE: 'invitation_acceptee',
  EVENEMENT_AJOUTE: 'evenement_ajoute',
  MESSAGE_BUREAU: 'message_bureau',
  VALIDATION_COTISATION: 'validation_cotisation'
};

/**
 * Créer une notification
 */
const createNotification = async (notificationData) => {
  const { user_id, dahira_id, type, title, message, link, metadata } = notificationData;

  const [result] = await pool.query(
    `INSERT INTO notifications (user_id, dahira_id, type, title, message, link, metadata)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [user_id, dahira_id, type, title, message, link, JSON.stringify(metadata || {})]
  );

  const [notification] = await pool.query(
    'SELECT * FROM notifications WHERE id = ?',
    [result.insertId]
  );

  // Envoyer l'email si l'utilisateur a activé les notifications email
  const [userPrefs] = await pool.query(
    'SELECT email, email_notifications FROM users WHERE id = ?',
    [user_id]
  );

  if (userPrefs.length > 0 && userPrefs[0].email && userPrefs[0].email_notifications !== false) {
    try {
      await sendNotificationEmail(userPrefs[0].email, title, message, link);
    } catch (err) {
      console.error('Erreur envoi email notification:', err);
    }
  }

  return notification[0];
};

/**
 * Créer une notification pour plusieurs utilisateurs
 */
const createBulkNotifications = async (userIds, dahiraId, notificationData) => {
  const { type, title, message, link, metadata } = notificationData;

  const values = userIds.map(userId => [
    userId,
    dahiraId,
    type,
    title,
    message,
    link,
    JSON.stringify(metadata || {})
  ]);

  await pool.query(
    `INSERT INTO notifications (user_id, dahira_id, type, title, message, link, metadata)
     VALUES ?`,
    [values]
  );

  // Envoyer les emails en arrière-plan (ne pas bloquer)
  setTimeout(async () => {
    const [users] = await pool.query(
      'SELECT email FROM users WHERE id IN (?) AND email IS NOT NULL AND email_notifications != FALSE',
      [userIds]
    );

    for (const user of users) {
      try {
        await sendNotificationEmail(user.email, title, message, link);
      } catch (err) {
        console.error('Erreur envoi email notification:', err);
      }
    }
  }, 0);

  return {
    count: userIds.length,
    message: 'Notifications créées avec succès'
  };
};

/**
 * Récupérer les notifications d'un utilisateur
 */
const getUserNotifications = async (userId, limit = 50, offset = 0) => {
  const [notifications] = await pool.query(
    `SELECT * FROM notifications 
     WHERE user_id = ? 
     ORDER BY created_at DESC 
     LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );

  const [countResult] = await pool.query(
    'SELECT COUNT(*) as total, SUM(CASE WHEN is_read = FALSE THEN 1 ELSE 0 END) as unread FROM notifications WHERE user_id = ?',
    [userId]
  );

  return {
    notifications,
    total: countResult[0].total,
    unread: countResult[0].unread
  };
};

/**
 * Marquer une notification comme lue
 */
const markAsRead = async (notificationId, userId) => {
  const [result] = await pool.query(
    'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = ? AND user_id = ?',
    [notificationId, userId]
  );

  if (result.affectedRows === 0) {
    throw new Error('Notification non trouvée');
  }

  return {
    message: 'Notification marquée comme lue'
  };
};

/**
 * Marquer toutes les notifications comme lues
 */
const markAllAsRead = async (userId) => {
  await pool.query(
    'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE user_id = ? AND is_read = FALSE',
    [userId]
  );

  return {
    message: 'Toutes les notifications ont été marquées comme lues'
  };
};

/**
 * Supprimer une notification
 */
const deleteNotification = async (notificationId, userId) => {
  const [result] = await pool.query(
    'DELETE FROM notifications WHERE id = ? AND user_id = ?',
    [notificationId, userId]
  );

  if (result.affectedRows === 0) {
    throw new Error('Notification non trouvée');
  }

  return {
    message: 'Notification supprimée'
  };
};

/**
 * Notifier tous les membres d'un dahira
 */
const notifyAllMembers = async (dahiraId, notificationData) => {
  const [users] = await pool.query(
    'SELECT id FROM users WHERE dahira_id = ? AND actif = TRUE',
    [dahiraId]
  );

  const userIds = users.map(u => u.id);

  if (userIds.length === 0) {
    return {
      count: 0,
      message: 'Aucun membre à notifier'
    };
  }

  return await createBulkNotifications(userIds, dahiraId, notificationData);
};

/**
 * Rappel automatique de séance (24h avant)
 */
const sendSeanceReminders = async () => {
  // Récupérer les séances qui ont lieu dans 24h
  const [seances] = await pool.query(
    `SELECT s.*, d.nom as dahira_nom 
     FROM seances s
     JOIN dahiras d ON s.dahira_id = d.id
     WHERE s.date_seance BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 24 HOUR)
     AND s.rappel_envoye = FALSE`
  );

  let notificationsSent = 0;

  for (const seance of seances) {
    const [users] = await pool.query(
      'SELECT id FROM users WHERE dahira_id = ? AND actif = TRUE',
      [seance.dahira_id]
    );

    const userIds = users.map(u => u.id);

    if (userIds.length > 0) {
      await createBulkNotifications(userIds, seance.dahira_id, {
        type: NOTIFICATION_TYPES.SEANCE_RAPPEL,
        title: 'Rappel de séance',
        message: `La séance "${seance.type}" aura lieu demain à ${seance.heure_debut || ''}`,
        link: `/seances/${seance.id}`,
        metadata: { seance_id: seance.id }
      });

      notificationsSent += userIds.length;

      // Marquer la séance comme ayant reçu un rappel
      await pool.query(
        'UPDATE seances SET rappel_envoye = TRUE WHERE id = ?',
        [seance.id]
      );
    }
  }

  return {
    seances: seances.length,
    notifications: notificationsSent
  };
};

/**
 * Alerter les membres en retard de cotisation
 */
const sendCotisationRetardAlerts = async (dahiraId) => {
  const currentMonth = new Date().toISOString().slice(0, 7);

  // Récupérer les membres sans cotisation ce mois-ci
  const [membres] = await pool.query(
    `SELECT m.id, u.id as user_id, m.nom, m.prenom
     FROM membres m
     JOIN users u ON m.id = u.membre_id
     WHERE m.dahira_id = ? AND m.actif = TRUE
     AND m.id NOT IN (
       SELECT membre_id FROM cotisations 
       WHERE dahira_id = ? AND mois_concerne = ? AND statut = 'approved'
     )`,
    [dahiraId, dahiraId, currentMonth]
  );

  if (membres.length === 0) {
    return {
      count: 0,
      message: 'Aucun membre en retard'
    };
  }

  const userIds = membres.map(m => m.user_id).filter(id => id);

  if (userIds.length > 0) {
    await createBulkNotifications(userIds, dahiraId, {
      type: NOTIFICATION_TYPES.COTISATION_RETARD,
      title: 'Cotisation en retard',
      message: `Votre cotisation du mois de ${currentMonth} n'a pas encore été enregistrée`,
      link: '/cotisations',
      metadata: { mois: currentMonth }
    });
  }

  return {
    count: userIds.length,
    message: `${userIds.length} alertes envoyées`
  };
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
  sendCotisationRetardAlerts
};
