const {
  uploadMembrePhoto,
  deleteMembrePhoto,
  uploadUserPhoto,
  getGaleriePhotos,
  uploadGaleriePhoto,
  deleteGaleriePhoto,
} = require('./photos.service');
const { success, error } = require('../../utils/response');

const uploadMembrePhotoController = async (req, res, next) => {
  try {
    if (!req.file) {
      return error(res, 'Aucun fichier fourni', 400);
    }

    const { id } = req.params;
    const result = await uploadMembrePhoto(id, req.dahira_id, req.file);
    return success(res, result, 200);
  } catch (err) {
    next(err);
  }
};

const deleteMembrePhotoController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await deleteMembrePhoto(id, req.dahira_id);
    return success(res, result, 200);
  } catch (err) {
    next(err);
  }
};

const uploadUserPhotoController = async (req, res, next) => {
  try {
    if (!req.file) {
      return error(res, 'Aucun fichier fourni', 400);
    }

    const result = await uploadUserPhoto(req.user.id, req.file);
    return success(res, result, 200);
  } catch (err) {
    next(err);
  }
};

const uploadMembreMeController = async (req, res, next) => {
  try {
    if (!req.file) {
      return error(res, 'Aucun fichier fourni', 400);
    }
    const result = await uploadMembrePhoto(req.user.id, req.dahira_id, req.file);
    return success(res, result, 200);
  } catch (err) {
    next(err);
  }
};

const getPhotosController = async (req, res, next) => {
  try {
    const photos = await getGaleriePhotos(req.dahira_id);
    return success(res, photos, 200);
  } catch (err) {
    next(err);
  }
};

const uploadGaleriePhotoController = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return error(res, 'Aucun fichier fourni', 400);
    }

    const { evenement_id, titre, description } = req.body;

    const results = [];
    const BATCH = 5;
    for (let i = 0; i < req.files.length; i += BATCH) {
      const batch = req.files.slice(i, i + BATCH);
      const batchResults = await Promise.all(
        batch.map(file =>
          uploadGaleriePhoto(
            req.dahira_id,
            req.user.id,
            file,
            evenement_id ? Number(evenement_id) : null,
            titre || null,
            description || null,
          )
        )
      );
      results.push(...batchResults);
    }
    const created = results;

    return success(res, created, 201);
  } catch (err) {
    next(err);
  }
};

const deleteGaleriePhotoController = async (req, res, next) => {
  try {
    const result = await deleteGaleriePhoto(req.params.id, req.dahira_id);
    return success(res, result, 200);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadMembrePhotoController,
  deleteMembrePhotoController,
  uploadUserPhotoController,
  uploadMembreMeController,
  getPhotosController,
  uploadGaleriePhotoController,
  deleteGaleriePhotoController,
};
