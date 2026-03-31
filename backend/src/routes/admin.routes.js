import express from 'express';
import { 
  getProfile, 
  updateProfile, 
  deleteProfile,
  getAllAdmins,
  createProfile
} from '../controllers/admin.controller.js';
import { getStats, getRecentPlacements } from '../controllers/adminAnalytics.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize(['ADMIN', "SUPER_ADMIN"])); // All routes require ADMIN role
router.post('/profile', createProfile);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.delete('/profile', deleteProfile);
router.get('/all', getAllAdmins);

// Analytics Routes
router.get('/analytics/stats', getStats);
router.get('/placements/recent', getRecentPlacements);

export default router;
