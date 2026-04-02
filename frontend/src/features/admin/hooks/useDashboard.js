import { useQuery } from '@tanstack/react-query';
import {
  getStats,
  getRecentPlacements,
  getDepartmentPlacementRates,
  getApplicationStageCounts,
  getProfileVerificationCounts,
  getPackageComparison
} from '@/features/admin/api/dashboard.service.js';

// Centralized keys for cache invalidation
export const DASHBOARD_KEYS = {
  all: ['dashboard'],
  stats: () => [...DASHBOARD_KEYS.all, 'stats'],
  placements: () => [...DASHBOARD_KEYS.all, 'placements'],
  departmentPlacementRates: () => [...DASHBOARD_KEYS.all, 'department-placement-rates'],
  applicationStageCounts: () => [...DASHBOARD_KEYS.all, 'application-stage-counts'],
  profileVerificationCounts: (minCompleteness = 80) => [
    ...DASHBOARD_KEYS.all,
    'profile-verification-counts',
    minCompleteness
  ],
  packageComparison: () => [...DASHBOARD_KEYS.all, 'package-comparison']
};

export const useStats = () => {
  return useQuery({
    queryKey: DASHBOARD_KEYS.stats(),
    queryFn: getStats,
    staleTime: 5 * 60 * 1000, // 5 minutes (Data stays fresh)
    gcTime: 10 * 60 * 1000,   // 10 minutes (Garbage collection time)
    retry: 1,                 // Don't retry infinitely on 404/500
    refetchOnWindowFocus: false, // Dashboards don't need to update every time you tab back
  });
};

export const useRecentPlacements = () => {
  return useQuery({
    queryKey: DASHBOARD_KEYS.placements(),
    queryFn: getRecentPlacements,
    staleTime: 5 * 60 * 1000, 
    retry: 1,
    refetchOnWindowFocus: false,
    // Optimization: If your API returns null for empty fields, 
    // default them here so UI logic is cleaner
    select: (data) => {
      const placements = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : [];

      return placements.map(p => ({
      ...p,
      avatar: p.avatar || '/default-avatar.png', // Fallback for missing images
      package: p.package ? `${p.package} LPA` : 'N/A' // Formatting logic moved here
      }));
    }
  });
};

export const useDepartmentPlacementRates = () => {
  return useQuery({
    queryKey: DASHBOARD_KEYS.departmentPlacementRates(),
    queryFn: getDepartmentPlacementRates,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    select: (data) => {
      if (Array.isArray(data?.departments)) return data.departments;
      return [];
    }
  });
};

export const useApplicationStageCounts = () => {
  return useQuery({
    queryKey: DASHBOARD_KEYS.applicationStageCounts(),
    queryFn: getApplicationStageCounts,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useProfileVerificationCounts = (minCompleteness = 80) => {
  return useQuery({
    queryKey: DASHBOARD_KEYS.profileVerificationCounts(minCompleteness),
    queryFn: () => getProfileVerificationCounts(minCompleteness),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const usePackageComparison = () => {
  return useQuery({
    queryKey: DASHBOARD_KEYS.packageComparison(),
    queryFn: getPackageComparison,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};