const {
  uploadMembrePhoto,
  deleteMembrePhoto,
  uploadUserPhoto
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

module.exports = {
  uploadMembrePhotoController,
  deleteMembrePhotoController,
  uploadUserPhotoController
};
