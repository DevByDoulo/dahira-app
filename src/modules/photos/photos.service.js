const pool = require('../../config/db');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const { randomUUID } = require('crypto');

// Chemin absolu vers uploads/ depuis la racine du projet backend
const UPLOADS_BASE = path.resolve(__dirname, '..', '..', '..', 'uploads');

/**
 * Upload une photo de profil pour un membre
 */
const uploadMembrePhoto = async (membreId, dahiraId, file) => {
  // Vérifier que le membre existe et appartient au dahira
  const [membre] = await pool.query(
    'SELECT id, photo_url FROM membres WHERE id = ? AND dahira_id = ?',
    [membreId, dahiraId]
  );

  if (membre.length === 0) {
    throw new Error('Membre non trouvé');
  }

  const oldPhotoUrl = membre[0].photo_url;

  // Créer le dossier si nécessaire (chemin absolu)
  const uploadDir = path.join(UPLOADS_BASE, 'photos', 'membres');
  await fs.mkdir(uploadDir, { recursive: true });

  // Générer le nom de fichier
  const timestamp = Date.now();
  const filename = `membre-${membreId}-${timestamp}.jpg`;
  const photoPath = path.join(uploadDir, filename);

  try {
    // Redimensionner et optimiser l'image principale (max 800x800)
    await sharp(file.buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(photoPath);

    const photoUrl = `/uploads/photos/membres/${filename}`;

    // Mettre à jour uniquement photo_url (thumbnail_url n'existe pas dans la table)
    await pool.query(
      'UPDATE membres SET photo_url = ? WHERE id = ?',
      [photoUrl, membreId]
    );

    // Supprimer l'ancienne photo si elle existe
    if (oldPhotoUrl && oldPhotoUrl !== photoUrl) {
      try {
        await fs.unlink(path.join(UPLOADS_BASE, '..', oldPhotoUrl));
      } catch (err) {
        console.error('Erreur suppression ancienne photo:', err);
      }
    }

    return { photo_url: photoUrl };
  } catch (err) {
    // Nettoyer le fichier en cas d'erreur
    try {
      await fs.unlink(photoPath);
    } catch (cleanupErr) {
      // Ignorer les erreurs de nettoyage
    }
    throw err;
  }
};

/**
 * Supprimer la photo d'un membre
 */
const deleteMembrePhoto = async (membreId, dahiraId) => {
  // Vérifier que le membre existe et appartient au dahira
  const [membre] = await pool.query(
    'SELECT id, photo_url FROM membres WHERE id = ? AND dahira_id = ?',
    [membreId, dahiraId]
  );

  if (membre.length === 0) {
    throw new Error('Membre non trouvé');
  }

  const { photo_url } = membre[0];

  if (!photo_url) {
    throw new Error('Ce membre n\'a pas de photo');
  }

  // Supprimer le fichier
  try {
    await fs.unlink(path.join(UPLOADS_BASE, '..', photo_url));
  } catch (err) {
    console.error('Erreur suppression fichier photo:', err);
  }

  // Mettre à jour la base de données
  await pool.query(
    'UPDATE membres SET photo_url = NULL, thumbnail_url = NULL WHERE id = ?',
    [membreId]
  );

  return {
    message: 'Photo supprimée avec succès'
  };
};

/**
 * Upload une photo d'utilisateur
 */
const uploadUserPhoto = async (userId, file) => {
  // Vérifier que l'utilisateur existe
  const [user] = await pool.query(
    'SELECT id, photo_url FROM membres WHERE id = ?',
    [userId]
  );

  if (user.length === 0) {
    throw new Error('Utilisateur non trouvé');
  }

  const oldPhotoUrl = user[0].photo_url;

  // Créer les dossiers (chemin absolu)
  const uploadDir = path.join(UPLOADS_BASE, 'photos', 'users');
  const thumbnailDir = path.join(UPLOADS_BASE, 'photos', 'users', 'thumbnails');

  await fs.mkdir(uploadDir, { recursive: true });
  await fs.mkdir(thumbnailDir, { recursive: true });

  // Générer les noms de fichiers
  const timestamp = Date.now();
  const ext = path.extname(file.originalname);
  const filename = `user-${userId}-${timestamp}${ext}`;
  const thumbnailFilename = `thumb-${filename}`;

  const photoPath = path.join(uploadDir, filename);
  const thumbnailPath = path.join(thumbnailDir, thumbnailFilename);

  try {
    // Redimensionner et optimiser
    await sharp(file.buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(photoPath);

    await sharp(file.buffer)
      .resize(150, 150, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    const photoUrl = `/uploads/photos/users/${filename}`;
    const thumbnailUrl = `/uploads/photos/users/thumbnails/${thumbnailFilename}`;

    // Mettre à jour la base de données
    await pool.query(
      'UPDATE membres SET photo_url = ?, thumbnail_url = ? WHERE id = ?',
      [photoUrl, thumbnailUrl, userId]
    );

    // Supprimer l'ancienne photo
    if (oldPhotoUrl && oldPhotoUrl !== photoUrl) {
      const oldPhotoPath = path.join(UPLOADS_BASE, '..', oldPhotoUrl);
      const oldThumbnailPath = oldPhotoPath.replace('/users/', '/users/thumbnails/').replace(/user-/, 'thumb-user-');
      
      try {
        await fs.unlink(oldPhotoPath);
        await fs.unlink(oldThumbnailPath);
      } catch (err) {
        console.error('Erreur suppression ancienne photo:', err);
      }
    }

    return {
      photo_url: photoUrl,
      thumbnail_url: thumbnailUrl
    };
  } catch (err) {
    try {
      await fs.unlink(photoPath);
      await fs.unlink(thumbnailPath);
    } catch (cleanupErr) {
      // Ignorer
    }
    throw err;
  }
};

/**
 * Récupérer toutes les photos de la galerie d'un dahira
 */
const getGaleriePhotos = async (dahiraId) => {
  const [photos] = await pool.query(
    `SELECT p.*, e.titre as evenement_titre, e.date_debut as evenement_date, e.lieu as evenement_lieu,
            m_up.nom as uploader_nom
     FROM photos p
     LEFT JOIN evenements e ON p.evenement_id = e.id
     LEFT JOIN membres m_up ON p.uploaded_by = m_up.id
     WHERE p.dahira_id = ?
     ORDER BY p.evenement_id DESC, p.created_at DESC`,
    [dahiraId]
  );
  return photos;
};

/**
 * Upload une ou plusieurs photos dans la galerie
 */
const uploadGaleriePhoto = async (dahiraId, uploadedBy, file, evenementId, titre, description) => {
  const uploadDir = path.join(UPLOADS_BASE, 'photos', 'galerie');
  await fs.mkdir(uploadDir, { recursive: true });

  const filename = `galerie-${dahiraId}-${randomUUID()}.jpg`;
  const photoPath = path.join(uploadDir, filename);

  await sharp(file.buffer)
    .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toFile(photoPath);

  const fichierUrl = `/uploads/photos/galerie/${filename}`;

  const [result] = await pool.query(
    `INSERT INTO photos (dahira_id, evenement_id, titre, description, fichier_url, uploaded_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [dahiraId, evenementId || null, titre || null, description || null, fichierUrl, uploadedBy]
  );

  const [rows] = await pool.query(
    `SELECT p.*, e.titre as evenement_titre FROM photos p
     LEFT JOIN evenements e ON p.evenement_id = e.id
     WHERE p.id = ?`,
    [result.insertId]
  );
  return rows[0];
};

/**
 * Supprimer une photo de la galerie
 */
const deleteGaleriePhoto = async (photoId, dahiraId) => {
  const [rows] = await pool.query(
    'SELECT fichier_url FROM photos WHERE id = ? AND dahira_id = ?',
    [photoId, dahiraId]
  );

  if (rows.length === 0) throw new Error('Photo non trouvée');

  try {
    await fs.unlink(path.join(UPLOADS_BASE, '..', rows[0].fichier_url));
  } catch (err) {
    console.error('Erreur suppression fichier photo galerie:', err);
  }

  await pool.query('DELETE FROM photos WHERE id = ?', [photoId]);
  return { message: 'Photo supprimée' };
};

module.exports = {
  uploadMembrePhoto,
  deleteMembrePhoto,
  uploadUserPhoto,
  getGaleriePhotos,
  uploadGaleriePhoto,
  deleteGaleriePhoto,
};
