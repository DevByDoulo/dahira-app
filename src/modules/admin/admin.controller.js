const adminService = require('./admin.service');
const { success, error } = require('../../utils/response');

const getStats = async (req, res) => {
  try {
    const data = await adminService.getStats();
    return success(res, data);
  } catch (err) {
    console.error('[admin/stats]', err.message);
    return error(res, err.message, 500);
  }
};

const getAllDahiras = async (req, res) => {
  try {
    const data = await adminService.getAllDahiras();
    return success(res, data);
  } catch (err) {
    console.error('[admin/dahiras]', err.message);
    return error(res, err.message, 500);
  }
};

const getDahiraById = async (req, res) => {
  try {
    const data = await adminService.getDahiraById(req.params.id);
    return success(res, data);
  } catch (err) {
    return error(res, err.message, err.message === 'Dahira introuvable' ? 404 : 500);
  }
};

const toggleDahiraStatus = async (req, res) => {
  try {
    const data = await adminService.toggleDahiraStatus(req.params.id);
    return res.status(200).json({
      success: true,
      data,
      message: data.actif ? 'Dahira activé' : 'Dahira suspendu',
    });
  } catch (err) {
    return error(res, err.message, err.message === 'Dahira introuvable' ? 404 : 500);
  }
};

module.exports = { getStats, getAllDahiras, getDahiraById, toggleDahiraStatus };
