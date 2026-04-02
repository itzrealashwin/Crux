import adminService from "../services/admin.service.js";
import { sendSuccess } from "../utils/response.util.js";

export const createProfile = async (req, res, next) => {
  try {
    // admin.controller.js
    const newProfile = await adminService.createAdmin(req.body, {
      actorId: req.user._id,
      actorRole: req.user.role,
    });
    // 4. Send 201 Created response
    sendSuccess(res, newProfile, "Admin profile created successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    // Fetch the logged-in admin's profile
    const userId = req.user.id;
    const profile = await adminService.getProfile(userId);
    sendSuccess(res, profile, "Admin profile fetched successfully");
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;
    const profile = await adminService.updateProfile(userId, updateData);
    sendSuccess(res, profile, "Admin profile updated successfully");
  } catch (error) {
    next(error);
  }
};

export const deleteAdmin = async (req, res, next) => {
  try {
    const adminId = req.params.id; // ID of the admin to delete
    const actor = {
      actorId: req.user._id,
      actorRole: req.user.role,
    };
    await adminService.deleteAdmin(adminId, actor);
    sendSuccess(res, null, "Admin profile deleted successfully");
  } catch (error) {
    next(error);
  }
};

export const getAllAdmins = async (req, res, next) => {
  try {
    const admins = await adminService.getAllAdmins();
    sendSuccess(res, admins, "All admins fetched successfully");
  } catch (error) {
    next(error);
  }
};
