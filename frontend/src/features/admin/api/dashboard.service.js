import { unwrapData, unwrapNestedData } from '@/shared/api/service.utils.js';
import { api } from '@/shared/lib/apiClient.js';

export const getStats = async () => {
  return unwrapData(await api.get('/admin/analytics/stats'));
};

export const getRecentPlacements = async () => {
  return unwrapNestedData(await api.get('/admin/placements/recent'));
};

export const getDepartmentPlacementRates = async () => {
  return unwrapData(await api.get('/admin/analytics/departments/placement-rate'));
};

export const getApplicationStageCounts = async () => {
  return unwrapData(await api.get('/admin/analytics/applications/stage-counts'));
};

export const getProfileVerificationCounts = async (minCompleteness = 80) => {
  return unwrapData(
    await api.get('/admin/analytics/accounts/profile-verification-counts', {
      params: { minCompleteness }
    })
  );
};

export const getPackageComparison = async () => {
  return unwrapData(await api.get('/admin/analytics/packages/comparison'));
};
