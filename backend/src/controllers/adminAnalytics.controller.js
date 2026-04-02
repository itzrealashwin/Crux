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

/**
 * Get department-wise placement rates
 * @route GET /api/admin/analytics/departments/placement-rate
 */
export const getDepartmentPlacementRates = async (req, res, next) => {
  try {
    const rates = await adminAnalyticsService.getDepartmentPlacementRates();
    sendSuccess(res, rates, 'Department-wise placement rates fetched successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get application stage counts including interview count as a first-class metric
 * @route GET /api/admin/analytics/applications/stage-counts
 */
export const getApplicationStageCounts = async (req, res, next) => {
  try {
    const counts = await adminAnalyticsService.getApplicationStageCounts();
    sendSuccess(res, counts, 'Application stage counts fetched successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get counts for incomplete student profiles and pending verification accounts
 * @route GET /api/admin/analytics/accounts/profile-verification-counts
 */
export const getProfileVerificationCounts = async (req, res, next) => {
  try {
    const parsedThreshold = Number(req.query.minCompleteness);
    const minCompleteness = Number.isFinite(parsedThreshold)
      ? Math.min(Math.max(parsedThreshold, 0), 100)
      : 80;
    const counts = await adminAnalyticsService.getProfileAndVerificationCounts(minCompleteness);
    sendSuccess(res, counts, 'Profile and verification counts fetched successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get package metrics comparison against last year
 * @route GET /api/admin/analytics/packages/comparison
 */
export const getPackageComparison = async (req, res, next) => {
  try {
    const comparison = await adminAnalyticsService.getPackageComparison();
    sendSuccess(res, comparison, 'Package comparison fetched successfully');
  } catch (error) {
    next(error);
  }
};
