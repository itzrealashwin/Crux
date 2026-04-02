import express from 'express';
import { 
  getProfile, 
  updateProfile, 
  deleteAdmin,
  getAllAdmins,
  createProfile
} from '../controllers/admin.controller.js';
import {
  getStats,
  getRecentPlacements,
  getDepartmentPlacementRates,
  getApplicationStageCounts,
  getProfileVerificationCounts,
  getPackageComparison
} from '../controllers/adminAnalytics.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize(['ADMIN', "SUPER_ADMIN"])); // All routes require ADMIN role

// Only SUPER_ADMIN can create or delete admins
router.post('/profile', authorize(['SUPER_ADMIN']), createProfile);
router.delete('/profile/:id', authorize(['SUPER_ADMIN']), deleteAdmin);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/all', getAllAdmins);

// Analytics Routes
router.get('/analytics/stats', getStats);
router.get('/analytics/departments/placement-rate', getDepartmentPlacementRates);
router.get('/analytics/applications/stage-counts', getApplicationStageCounts);
router.get('/analytics/accounts/profile-verification-counts', getProfileVerificationCounts);
router.get('/analytics/packages/comparison', getPackageComparison);
router.get('/placements/recent', getRecentPlacements);

export default router;
