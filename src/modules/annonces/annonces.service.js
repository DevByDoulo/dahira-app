const pool = require('../../config/db');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

const UPLOADS_BASE = path.resolve(__dirname, '..', '..', '..', 'uploads');

const uploadAnnonceImage = async (file, baseUrl) => {
  const uploadDir = path.join(UPLOADS_BASE, 'annonces');
  await fs.mkdir(uploadDir, { recursive: true });

  const timestamp = Date.now();
  const filename = `annonce-${timestamp}.jpg`;
  const filePath = path.join(uploadDir, filename);

  await sharp(file.buffer)
    .resize(1200, 630, { fit: 'cover', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toFile(filePath);

  return { url: `${baseUrl}/uploads/annonces/${filename}` };
};

const uploadAnnonceAudio = async (file, baseUrl) => {
  const uploadDir = path.join(UPLOADS_BASE, 'annonces', 'audio');
  await fs.mkdir(uploadDir, { recursive: true });

  const ext = (file.originalname.split('.').pop() || 'webm').toLowerCase();
  const filename = `vocal-${Date.now()}.${ext}`;
  const filePath = path.join(uploadDir, filename);

  await fs.writeFile(filePath, file.buffer);

  return { url: `${baseUrl}/uploads/annonces/audio/${filename}` };
};

const deleteAudioFile = async (audioUrl) => {
  if (!audioUrl) return;
  try {
    const filename = path.basename(audioUrl);
    await fs.unlink(path.join(UPLOADS_BASE, 'annonces', 'audio', filename));
  } catch {
    // fichier déjà supprimé ou inexistant, pas critique
  }
};

const getAllAnnonces = async (dahiraId, userRole) => {
  const [annonces] = await pool.query(
    `SELECT a.*, m.nom as publie_par_nom
     FROM annonces a
     LEFT JOIN membres m ON a.publie_par = m.id
     WHERE a.dahira_id = ?
     ORDER BY a.created_at DESC`,
    [dahiraId]
  );
  return annonces;
};

const getAnnonceById = async (id, dahiraId) => {
  const [annonces] = await pool.query(
    `SELECT a.*, m.nom as publie_par_nom
     FROM annonces a
     LEFT JOIN membres m ON a.publie_par = m.id
     WHERE a.id = ? AND a.dahira_id = ?`,
    [id, dahiraId]
  );

  if (annonces.length === 0) throw new Error('Annonce non trouvée');

  return annonces[0];
};

const createAnnonce = async (dahiraId, annonceData, userId) => {
  const { titre, contenu, image_url, audio_url, cible_groupe } = annonceData;

  const [result] = await pool.query(
    `INSERT INTO annonces (dahira_id, titre, contenu, image_url, audio_url, cible_groupe, publie_par, epinglee)
     VALUES (?, ?, ?, ?, ?, ?, ?, FALSE)`,
    [dahiraId, titre, contenu, image_url ?? null, audio_url ?? null, cible_groupe ?? null, userId]
  );

  const [newAnnonce] = await pool.query(
    `SELECT a.*, m.nom as publie_par_nom
     FROM annonces a
     LEFT JOIN membres m ON a.publie_par = m.id
     WHERE a.id = ?`,
    [result.insertId]
  );

  return newAnnonce[0];
};

const updateAnnonce = async (id, dahiraId, annonceData) => {
  const { titre, contenu, image_url, audio_url, cible_groupe } = annonceData;

  const [existing] = await pool.query(
    'SELECT id, audio_url FROM annonces WHERE id = ? AND dahira_id = ?',
    [id, dahiraId]
  );

  if (existing.length === 0) throw new Error('Annonce non trouvée');

  // Nettoyer l'ancien fichier audio si remplacé ou supprimé
  const oldAudioUrl = existing[0].audio_url;
  if (oldAudioUrl && audio_url !== undefined && oldAudioUrl !== audio_url) {
    await deleteAudioFile(oldAudioUrl);
  }

  const newAudioUrl = audio_url !== undefined ? audio_url : oldAudioUrl;

  await pool.query(
    `UPDATE annonces
     SET titre = ?, contenu = ?, image_url = ?, audio_url = ?, cible_groupe = ?
     WHERE id = ? AND dahira_id = ?`,
    [titre, contenu, image_url ?? null, newAudioUrl ?? null, cible_groupe ?? null, id, dahiraId]
  );

  const [updated] = await pool.query(
    `SELECT a.*, m.nom as publie_par_nom
     FROM annonces a
     LEFT JOIN membres m ON a.publie_par = m.id
     WHERE a.id = ?`,
    [id]
  );

  return updated[0];
};

const deleteAnnonce = async (id, dahiraId) => {
  const [existing] = await pool.query(
    'SELECT id, audio_url FROM annonces WHERE id = ? AND dahira_id = ?',
    [id, dahiraId]
  );

  if (existing.length === 0) throw new Error('Annonce non trouvée');

  await deleteAudioFile(existing[0].audio_url);

  await pool.query(
    'DELETE FROM annonces WHERE id = ? AND dahira_id = ?',
    [id, dahiraId]
  );

  return { message: 'Annonce supprimée avec succès' };
};

const toggleEpinglee = async (id, dahiraId) => {
  const [existing] = await pool.query(
    'SELECT id, epinglee FROM annonces WHERE id = ? AND dahira_id = ?',
    [id, dahiraId]
  );

  if (existing.length === 0) throw new Error('Annonce non trouvée');

  const newEpinglee = !existing[0].epinglee;

  await pool.query(
    'UPDATE annonces SET epinglee = ? WHERE id = ? AND dahira_id = ?',
    [newEpinglee, id, dahiraId]
  );

  const [updated] = await pool.query(
    `SELECT a.*, m.nom as publie_par_nom
     FROM annonces a
     LEFT JOIN membres m ON a.publie_par = m.id
     WHERE a.id = ?`,
    [id]
  );

  return updated[0];
};

module.exports = {
  getAllAnnonces,
  getAnnonceById,
  createAnnonce,
  updateAnnonce,
  deleteAnnonce,
  toggleEpinglee,
  uploadAnnonceImage,
  uploadAnnonceAudio
};
