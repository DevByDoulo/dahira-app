const {
  getDashboardStats,
  getDashboardCharts,
  getRecentActivity,
  getComparativeStats
} = require('./dashboard.service');
const { success, error } = require('../../utils/response');

/**
 * Récupérer les statistiques du dashboard
 */
const getDashboardStatsController = async (req, res, next) => {
  try {
    const dahiraId = req.user.dahira_id;
    const stats = await getDashboardStats(dahiraId);
    return success(res, stats, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Récupérer les graphiques du dashboard
 */
const getDashboardChartsController = async (req, res, next) => {
  try {
    const dahiraId = req.user.dahira_id;
    const charts = await getDashboardCharts(dahiraId);
    return success(res, charts, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Récupérer l'activité récente
 */
const getRecentActivityController = async (req, res, next) => {
  try {
    const dahiraId = req.user.dahira_id;
    const limit = parseInt(req.query.limit) || 10;
    const activity = await getRecentActivity(dahiraId, limit);
    return success(res, activity, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Récupérer les statistiques comparatives
 */
const getComparativeStatsController = async (req, res, next) => {
  try {
    const dahiraId = req.user.dahira_id;
    const stats = await getComparativeStats(dahiraId);
    return success(res, stats, 200);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStatsController,
  getDashboardChartsController,
  getRecentActivityController,
  getComparativeStatsController
};
