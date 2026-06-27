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

const getAllAnnonces = async (dahiraId, userRole) => {
  const query = `SELECT a.*, m.nom as publie_par_nom
               FROM annonces a
               LEFT JOIN membres m ON a.publie_par = m.id
               WHERE a.dahira_id = ?
               ORDER BY a.created_at DESC`;

  const [annonces] = await pool.query(query, [dahiraId]);
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

  if (annonces.length === 0) {
    throw new Error('Annonce non trouvée');
  }

  return annonces[0];
};

const createAnnonce = async (dahiraId, annonceData, userId) => {
  const { titre, contenu, image_url, cible_groupe } = annonceData;

  const [result] = await pool.query(
    `INSERT INTO annonces (dahira_id, titre, contenu, image_url, cible_groupe, publie_par, epinglee)
     VALUES (?, ?, ?, ?, ?, ?, FALSE)`,
    [dahiraId, titre, contenu, image_url, cible_groupe, userId]
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
  const { titre, contenu, image_url, cible_groupe } = annonceData;

  // Check if annonce exists and belongs to dahira
  const [existing] = await pool.query(
    'SELECT id FROM annonces WHERE id = ? AND dahira_id = ?',
    [id, dahiraId]
  );

  if (existing.length === 0) {
    throw new Error('Annonce non trouvée');
  }

  await pool.query(
    `UPDATE annonces
     SET titre = ?, contenu = ?, image_url = ?, cible_groupe = ?
     WHERE id = ? AND dahira_id = ?`,
    [titre, contenu, image_url, cible_groupe, id, dahiraId]
  );

  const [updatedAnnonce] = await pool.query(
    `SELECT a.*, m.nom as publie_par_nom
     FROM annonces a
     LEFT JOIN membres m ON a.publie_par = m.id
     WHERE a.id = ?`,
    [id]
  );

  return updatedAnnonce[0];
};

const deleteAnnonce = async (id, dahiraId) => {
  // Check if annonce exists and belongs to dahira
  const [existing] = await pool.query(
    'SELECT id FROM annonces WHERE id = ? AND dahira_id = ?',
    [id, dahiraId]
  );

  if (existing.length === 0) {
    throw new Error('Annonce non trouvée');
  }

  await pool.query(
    'DELETE FROM annonces WHERE id = ? AND dahira_id = ?',
    [id, dahiraId]
  );

  return { message: 'Annonce supprimée avec succès' };
};

const toggleEpinglee = async (id, dahiraId) => {
  // Check if annonce exists and belongs to dahira
  const [existing] = await pool.query(
    'SELECT id, epinglee FROM annonces WHERE id = ? AND dahira_id = ?',
    [id, dahiraId]
  );

  if (existing.length === 0) {
    throw new Error('Annonce non trouvée');
  }

  const newEpinglee = !existing[0].epinglee;

  await pool.query(
    'UPDATE annonces SET epinglee = ? WHERE id = ? AND dahira_id = ?',
    [newEpinglee, id, dahiraId]
  );

  const [updatedAnnonce] = await pool.query(
    `SELECT a.*, m.nom as publie_par_nom
     FROM annonces a
     LEFT JOIN membres m ON a.publie_par = m.id
     WHERE a.id = ?`,
    [id]
  );

  return updatedAnnonce[0];
};

module.exports = {
  getAllAnnonces,
  getAnnonceById,
  createAnnonce,
  updateAnnonce,
  deleteAnnonce,
  toggleEpinglee,
  uploadAnnonceImage
};
