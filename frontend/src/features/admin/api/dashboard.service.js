import { unwrapData, unwrapNestedData } from '@/shared/api/service.utils.js';
import { api } from '@/shared/lib/apiClient.js';

export const getStats = async () => {
  return unwrapData(await api.get('/admin/analytics/stats'));
};

export const getRecentPlacements = async () => {
  return unwrapNestedData(await api.get('/admin/placements/recent'));
};
