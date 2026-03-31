import adminAnalyticsService from '../services/adminAnalytics.service.js';
import { sendSuccess } from '../utils/response.util.js';

/**
 * Get admin dashboard stats and trends
 * @route GET /api/admin/analytics/stats
 */
export const getStats = async (req, res, next) => {
  try {
    const stats = await adminAnalyticsService.getStats();
    sendSuccess(res, stats, 'Admin stats fetched successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get recent placements
 * @route GET /api/admin/placements/recent
 */
export const getRecentPlacements = async (req, res, next) => {
  try {
    const placements = await adminAnalyticsService.getRecentPlacements();
    sendSuccess(res, { data: placements }, 'Recent placements fetched successfully');
  } catch (error) {
    next(error);
  }
};
