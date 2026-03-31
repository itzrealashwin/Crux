import User from "../models/users.model.js";
import AdminProfile from "../models/admin.model.js";

class AdminService {
  /**
   * CREATE ADMIN
   * Handles creating both Identity (User) and Details (Profile).
   * Includes manual rollback to ensure data consistency.
   */
  // admin.service.js
async createAdmin(adminData, actor) {
  const { userId, email, password, role = "ADMIN", ...profile } = adminData;

  if (role === "SUPER_ADMIN" && actor.actorRole !== "SUPER_ADMIN") {
    throw { statusCode: 403, message: "Only SUPER_ADMIN can create SUPER_ADMIN" };
  }

  let user = null;
  let createdUser = false;

  if (userId) {
    user = await User.findById(userId);
    if (!user) throw { statusCode: 404, message: "User account not found" };
  } else {
    if (!email || !password) {
      throw { statusCode: 400, message: "email and password are required to create admin login" };
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) throw { statusCode: 409, message: "Email already registered" };

    user = await User.create({
      email: email.toLowerCase(),
      passwordHash: password,
      role,
      isVerified: true
    });
    createdUser = true;
  }

  try {
    const existingProfile = await AdminProfile.findOne({ userId: user._id });
    if (existingProfile) throw { statusCode: 409, message: "Profile already exists for this user" };

    const adminProfile = await AdminProfile.create({
      userId: user._id,
      email: profile.email || user.email,
      ...profile
    });

    return { ...adminProfile.toObject(), accountInfo: { email: user.email, role: user.role } };
  } catch (err) {
    if (createdUser) await User.findByIdAndDelete(user._id);
    throw err;
  }
}

  /**
   * GET PROFILE
   * Uses manual join for clarity and performance.
   */
  async getProfile(userId) {
    // 1. Fetch Profile and User account in parallel for speed
    const [adminProfile, userAccount] = await Promise.all([
      AdminProfile.findOne({ userId : userId }).lean(),
      User.findById(userId).select("email role").lean(),
    ]);

    if (!adminProfile) {
      throw { statusCode: 404, message: "Admin profile not found" };
    }

    if (!userAccount || userAccount.role !== "ADMIN") {
      throw { statusCode: 403, message: "Access denied: User is not an admin" };
    }

    // 2. Manually merge the data
    return {
      ...adminProfile,
      accountInfo: userAccount,
    };
  }

  /**
   * UPDATE PROFILE
   * Uses atomic updates where possible.
   */
  async updateProfile(userId, updateData) {
    const { password, ...profileData } = updateData;

    // 1. Handle sensitive operations (Password)
    if (password) {
      const user = await User.findById(userId);
      if (!user) throw { statusCode: 404, message: "User account not found" };

      user.password = password; // Triggers pre-save hashing
      await user.save();
    }

    // 2. Perform atomic update on profile
    const updatedProfile = await AdminProfile.findOneAndUpdate(
      { userId },
      { $set: profileData },
      { new: true, runValidators: true, lean: true }
    );

    if (!updatedProfile) {
      throw { statusCode: 404, message: "Admin profile not found" };
    }

    return updatedProfile;
  }

  /**
   * DELETE PROFILE
   * Consistent with industry standards: find and delete.
   */
  async deleteProfile(userId) {
    // Check existence first to provide specific error
    const profile = await AdminProfile.findOneAndDelete({ userId });

    if (!profile) {
      throw { statusCode: 404, message: "Admin profile not found" };
    }

    // Optional: Also delete the user login account?
    // await User.findByIdAndDelete(userId);

    return { message: "Admin profile deleted successfully" };
  }

  /**
   * GET ALL ADMINS
   * Uses Aggregation Pipeline ($lookup)
   */
  async getAllAdmins() {
    return await AdminProfile.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "accountDetails",
        },
      },
      { $unwind: "$accountDetails" },
      {
        $project: {
          "accountDetails.password": 0,
          "accountDetails.passwordHash": 0,
          "accountDetails.__v": 0,
        },
      },
    ]);
  }
}

export default new AdminService();
