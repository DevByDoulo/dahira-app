const pool = require('../../config/db');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

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

  // Créer les dossiers si nécessaire
  const uploadDir = path.join('uploads', 'photos', 'membres');
  const thumbnailDir = path.join('uploads', 'photos', 'membres', 'thumbnails');
  
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.mkdir(thumbnailDir, { recursive: true });

  // Générer les noms de fichiers
  const timestamp = Date.now();
  const ext = path.extname(file.originalname);
  const filename = `membre-${membreId}-${timestamp}${ext}`;
  const thumbnailFilename = `thumb-${filename}`;

  const photoPath = path.join(uploadDir, filename);
  const thumbnailPath = path.join(thumbnailDir, thumbnailFilename);

  try {
    // Redimensionner et optimiser l'image principale (max 800x800)
    await sharp(file.buffer)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toFile(photoPath);

    // Créer une miniature (150x150)
    await sharp(file.buffer)
      .resize(150, 150, {
        fit: 'cover'
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    // Construire les URLs
    const photoUrl = `/uploads/photos/membres/${filename}`;
    const thumbnailUrl = `/uploads/photos/membres/thumbnails/${thumbnailFilename}`;

    // Mettre à jour la base de données
    await pool.query(
      'UPDATE membres SET photo_url = ?, thumbnail_url = ? WHERE id = ?',
      [photoUrl, thumbnailUrl, membreId]
    );

    // Supprimer l'ancienne photo si elle existe
    if (oldPhotoUrl && oldPhotoUrl !== photoUrl) {
      const oldPhotoPath = path.join(process.cwd(), oldPhotoUrl);
      const oldThumbnailPath = oldPhotoPath.replace('/membres/', '/membres/thumbnails/').replace(/membre-/, 'thumb-membre-');
      
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
    // Nettoyer les fichiers en cas d'erreur
    try {
      await fs.unlink(photoPath);
      await fs.unlink(thumbnailPath);
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
    'SELECT id, photo_url, thumbnail_url FROM membres WHERE id = ? AND dahira_id = ?',
    [membreId, dahiraId]
  );

  if (membre.length === 0) {
    throw new Error('Membre non trouvé');
  }

  const { photo_url, thumbnail_url } = membre[0];

  if (!photo_url) {
    throw new Error('Ce membre n\'a pas de photo');
  }

  // Supprimer les fichiers
  const photoPath = path.join(process.cwd(), photo_url);
  const thumbnailPath = thumbnail_url ? path.join(process.cwd(), thumbnail_url) : null;

  try {
    await fs.unlink(photoPath);
    if (thumbnailPath) {
      await fs.unlink(thumbnailPath);
    }
  } catch (err) {
    console.error('Erreur suppression fichiers photo:', err);
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
    'SELECT id, photo_url FROM users WHERE id = ?',
    [userId]
  );

  if (user.length === 0) {
    throw new Error('Utilisateur non trouvé');
  }

  const oldPhotoUrl = user[0].photo_url;

  // Créer les dossiers
  const uploadDir = path.join('uploads', 'photos', 'users');
  const thumbnailDir = path.join('uploads', 'photos', 'users', 'thumbnails');
  
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
      'UPDATE users SET photo_url = ?, thumbnail_url = ? WHERE id = ?',
      [photoUrl, thumbnailUrl, userId]
    );

    // Supprimer l'ancienne photo
    if (oldPhotoUrl && oldPhotoUrl !== photoUrl) {
      const oldPhotoPath = path.join(process.cwd(), oldPhotoUrl);
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

module.exports = {
  uploadMembrePhoto,
  deleteMembrePhoto,
  uploadUserPhoto
};
